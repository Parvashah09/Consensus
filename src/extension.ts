// Main extension entry point

import * as vscode from 'vscode';
import { registerChatParticipant } from './chatParticipant';
import { CouncilWebviewProvider } from './webview/webviewProvider';
import { logger } from './utils/logger';
import { copilotService } from './services/copilotService';

let webviewProvider: CouncilWebviewProvider;

export function activate(context: vscode.ExtensionContext) {
  logger.info('AI Consensus Engine extension is activating...');

  try {
    // Register chat participant (@council)
    registerChatParticipant(context);

    // Register webview provider for sidebar
    webviewProvider = new CouncilWebviewProvider(context.extensionUri);
    context.subscriptions.push(
      vscode.window.registerWebviewViewProvider('consensusSidebar', webviewProvider)
    );

    // Register commands
    context.subscriptions.push(
      vscode.commands.registerCommand('consensus.openPanel', () => {
        vscode.commands.executeCommand('consensusSidebar.focus');
      })
    );

    context.subscriptions.push(
      vscode.commands.registerCommand('consensus.refresh', () => {
        webviewProvider.refresh();
        vscode.window.showInformationMessage('Consensus settings refreshed');
      })
    );

    context.subscriptions.push(
      vscode.commands.registerCommand('consensus.exportResults', () => {
        vscode.window.showInformationMessage('Export feature coming soon!');
      })
    );

    context.subscriptions.push(
      vscode.commands.registerCommand('consensus.compareModels', () => {
        vscode.window.showInformationMessage('Model comparison coming soon!');
      })
    );

    // Check Copilot status on activation
    checkCopilotStatus();

    logger.info('Open LLM Council extension activated successfully');
  } catch (error) {
    logger.error('Failed to activate extension', error as Error);
    vscode.window.showErrorMessage(`Open LLM Council: Failed to activate - ${(error as Error).message}`);
  }
}

async function checkCopilotStatus(): Promise<void> {
  try {
    const isReady = await copilotService.isCopilotReady();
    if (!isReady) {
      const result = await vscode.window.showWarningMessage(
        'AI Consensus Engine: GitHub Copilot is not ready. Please ensure Copilot is installed and you are signed in.',
        'Install Copilot Chat',
        'Retry'
      );

      if (result === 'Install Copilot Chat') {
        vscode.commands.executeCommand('workbench.extensions.search', '@id:github.copilot-chat');
      } else if (result === 'Retry') {
        setTimeout(() => checkCopilotStatus(), 2000);
      }
    } else {
      logger.info('GitHub Copilot is ready');
    }
  } catch (error) {
    logger.error('Failed to check Copilot status', error as Error);
  }
}

export function deactivate() {
  logger.info('AI Consensus Engine extension deactivated');
}
