// Chat participant handler for @council

import * as vscode from 'vscode';
import { councilService } from './councilService';
import { copilotService } from './services/copilotService';
import { configService } from './services/configService';
import { logger } from './utils/logger';
import { ParsedCommand } from './models/types';
import { KNOWN_MODELS } from './models/modelRegistry';

export function registerChatParticipant(context: vscode.ExtensionContext): void {
  const participant = vscode.chat.createChatParticipant('consensus', async (request, chatContext, stream, token) => {
    return await handleChatRequest(request, chatContext, stream, token);
  });

  participant.iconPath = vscode.Uri.joinPath(context.extensionUri, 'media', 'icon.png');

  context.subscriptions.push(participant);
  logger.info('Chat participant registered: @consensus');
}

async function handleChatRequest(
  request: vscode.ChatRequest,
  context: vscode.ChatContext,
  stream: vscode.ChatResponseStream,
  token: vscode.CancellationToken
): Promise<vscode.ChatResult> {
  try {
    // Check if Copilot is ready
    const isReady = await copilotService.isCopilotReady();
    if (!isReady) {
      stream.markdown('❌ **GitHub Copilot Not Ready**\n\n');
      stream.markdown('Please ensure:\n');
      stream.markdown('1. GitHub Copilot extension is installed\n');
      stream.markdown('2. You are signed in to GitHub\n');
      stream.markdown('3. Your Copilot subscription is active\n\n');
      stream.button({
        command: 'workbench.extensions.search',
        arguments: ['@id:github.copilot-chat'],
        title: 'Install Copilot Chat'
      });
      
      return { metadata: { command: 'error' } };
    }

    // Parse command
    const parsed = parseCommand(request.prompt);

    // Handle /models command
    if (parsed.type === 'models') {
      return await handleModelsCommand(stream, token);
    }

    // Get configuration (override for quick mode)
    let config = configService.getConfig();
    
    if (parsed.type === 'quick') {
      config = { ...config, size: 'minimal', enableDebateMode: false };
      stream.markdown('⚡ **Quick Mode** - Using minimal council size\n\n');
    } else if (parsed.type === 'debate') {
      config = { ...config, enableDebateMode: true };
      stream.markdown('🗣️ **Debate Mode** - Peer review enabled\n\n');
    }

    // Execute council deliberation
    await councilService.deliberate(parsed.query, config, stream, token);

    return { metadata: { command: parsed.type } };
  } catch (error) {
    logger.error('Chat request handler error', error as Error);
    stream.markdown(`\n\n❌ **Error:** ${(error as Error).message}\n`);
    return { metadata: { command: 'error' } };
  }
}

function parseCommand(prompt: string): ParsedCommand {
  const trimmed = prompt.trim();

  if (trimmed.startsWith('/quick')) {
    return {
      type: 'quick',
      query: trimmed.substring(6).trim()
    };
  }

  if (trimmed.startsWith('/debate')) {
    return {
      type: 'debate',
      query: trimmed.substring(7).trim()
    };
  }

  if (trimmed.startsWith('/models') || trimmed === 'models') {
    return {
      type: 'models',
      query: ''
    };
  }

  return {
    type: 'standard',
    query: trimmed
  };
}

async function handleModelsCommand(
  stream: vscode.ChatResponseStream,
  token: vscode.CancellationToken
): Promise<vscode.ChatResult> {
  stream.markdown('# Available AI Models\n\n');

  const availableModels = await copilotService.getAvailableModels();

  if (availableModels.length === 0) {
    stream.markdown('⚠️ No models currently available. Please check your GitHub Copilot connection.\n');
    return { metadata: { command: 'models' } };
  }

  stream.markdown('## Currently Available\n\n');
  
  for (const model of availableModels) {
    const knownModel = KNOWN_MODELS.find(m => 
      model.id.includes(m.id) || m.id.includes(model.id)
    );
    
    if (knownModel) {
      stream.markdown(`- **${knownModel.name}** \`(${model.id})\` - ${knownModel.description}\n`);
    } else {
      stream.markdown(`- **${model.name}** \`(${model.id})\` - ${model.vendor}\n`);
    }
  }

  stream.markdown('\n## Configuration\n\n');
  const config = configService.getConfig();
  stream.markdown(`- **Council Size:** ${config.size}\n`);
  stream.markdown(`- **Council Members:** ${configService.getCouncilModels().join(', ')}\n`);
  stream.markdown(`- **Chairman Model:** ${config.chairmanModel}\n`);
  stream.markdown(`- **Debate Mode:** ${config.enableDebateMode ? 'Enabled' : 'Disabled'}\n`);

  return { metadata: { command: 'models' } };
}
