// Council service - orchestrates multi-model deliberation

import * as vscode from 'vscode';
import { CouncilConfig, ModelResponse, CouncilResult } from './models/types';
import { copilotService } from './services/copilotService';
import { configService } from './services/configService';
import { logger } from './utils/logger';
import { getModelInfo } from './models/modelRegistry';

export class CouncilService {
  async deliberate(
    query: string,
    config: CouncilConfig,
    stream: vscode.ChatResponseStream,
    token: vscode.CancellationToken
  ): Promise<CouncilResult> {
    const startTime = new Date();
    
    try {
      // Stage 1: Gather responses
      stream.markdown(' **Consulting Council Members...**\n\n');
      const responses = await this.gatherResponses(query, config, stream, token);

      if (responses.length === 0) {
        throw new Error('No responses received from council members');
      }

      // Stage 2: Review (if debate mode enabled)
      let critiques: ModelResponse[] | undefined;
      if (config.enableDebateMode) {
        stream.markdown('\n---\n\n **Peer Review Stage...**\n\n');
        critiques = await this.reviewResponses(query, responses, config, stream, token);
      }

      // Stage 3: Synthesize
      stream.markdown('\n---\n\n **Synthesizing Final Answer...**\n\n');
      const synthesis = await this.synthesize(query, responses, critiques, config, stream, token);

      return {
        query,
        responses,
        critiques,
        synthesis,
        timestamp: startTime,
        config
      };
    } catch (error) {
      logger.error('Deliberation failed', error as Error);
      stream.markdown(`\n\n **Error**: ${(error as Error).message}\n`);
      throw error;
    }
  }

  private async gatherResponses(
    query: string,
    config: CouncilConfig,
    stream: vscode.ChatResponseStream,
    token: vscode.CancellationToken
  ): Promise<ModelResponse[]> {
    const models = configService.getCouncilModels();
    logger.info(`Gathering responses from ${models.length} models: ${models.join(', ')}`);

    const promises = models.map(modelId => 
      this.queryModel(modelId, query, stream, token)
    );

    const results = await Promise.allSettled(promises);
    
    const responses: ModelResponse[] = [];
    for (let i = 0; i < results.length; i++) {
      const result = results[i];
      if (result.status === 'fulfilled' && result.value) {
        responses.push(result.value);
      } else if (result.status === 'rejected') {
        logger.error(`Model ${models[i]} failed`, result.reason);
        stream.markdown(`⚠️ *${models[i]} failed to respond*\n\n`);
      }
    }

    return responses;
  }

  private async queryModel(
    modelId: string,
    query: string,
    stream: vscode.ChatResponseStream,
    token: vscode.CancellationToken
  ): Promise<ModelResponse | null> {
    const modelInfo = getModelInfo(modelId);
    const modelName = modelInfo?.name || modelId;

    try {
      stream.markdown(`### 🤖 ${modelName}\n\n`);

      const messages: vscode.LanguageModelChatMessage[] = [
        vscode.LanguageModelChatMessage.User(query)
      ];

      const response = await copilotService.sendRequest(modelId, messages, {}, token);
      
      if (!response) {
        throw new Error('No response received');
      }

      let content = '';
      for await (const chunk of response.text) {
        if (token.isCancellationRequested) {
          break;
        }
        content += chunk;
        stream.markdown(chunk);
      }

      stream.markdown('\n\n');

      return {
        modelName,
        modelId,
        content,
        timestamp: new Date()
      };
    } catch (error) {
      logger.error(`Failed to query ${modelId}`, error as Error);
      return null;
    }
  }

  private async reviewResponses(
    query: string,
    responses: ModelResponse[],
    config: CouncilConfig,
    stream: vscode.ChatResponseStream,
    token: vscode.CancellationToken
  ): Promise<ModelResponse[]> {
    logger.info('Starting peer review stage');

    const critiques: ModelResponse[] = [];

    // Each model reviews other models' responses
    for (const reviewer of responses) {
      if (token.isCancellationRequested) {
        break;
      }

      const otherResponses = responses.filter(r => r.modelId !== reviewer.modelId);
      const reviewPrompt = this.buildReviewPrompt(query, otherResponses);

      stream.markdown(`### 💭 ${reviewer.modelName} Reviews\n\n`);

      const messages: vscode.LanguageModelChatMessage[] = [
        vscode.LanguageModelChatMessage.User(reviewPrompt)
      ];

      try {
        const response = await copilotService.sendRequest(reviewer.modelId, messages, {}, token);
        
        if (response) {
          let content = '';
          for await (const chunk of response.text) {
            if (token.isCancellationRequested) {
              break;
            }
            content += chunk;
            stream.markdown(chunk);
          }

          stream.markdown('\n\n');

          critiques.push({
            modelName: `${reviewer.modelName} (Critique)`,
            modelId: reviewer.modelId,
            content,
            timestamp: new Date()
          });
        }
      } catch (error) {
        logger.error(`${reviewer.modelName} review failed`, error as Error);
      }
    }

    return critiques;
  }

  private buildReviewPrompt(query: string, responses: ModelResponse[]): string {
    let prompt = `Original question: "${query}"\n\n`;
    prompt += 'Here are responses from other AI models:\n\n';

    for (const response of responses) {
      prompt += `**${response.modelName}:**\n${response.content}\n\n`;
    }

    prompt += 'Please provide a brief critique of these responses. What are their strengths? What might be missing or could be improved? Be constructive and specific.';

    return prompt;
  }

  private async synthesize(
    query: string,
    responses: ModelResponse[],
    critiques: ModelResponse[] | undefined,
    config: CouncilConfig,
    stream: vscode.ChatResponseStream,
    token: vscode.CancellationToken
  ): Promise<string> {
    const synthesisPrompt = this.buildSynthesisPrompt(query, responses, critiques);

    const messages: vscode.LanguageModelChatMessage[] = [
      vscode.LanguageModelChatMessage.User(synthesisPrompt)
    ];

    try {
      const response = await copilotService.sendRequest(config.chairmanModel, messages, {}, token);
      
      if (!response) {
        throw new Error('Synthesis failed - no response from chairman model');
      }

      let synthesis = '';
      for await (const chunk of response.text) {
        if (token.isCancellationRequested) {
          break;
        }
        synthesis += chunk;
        stream.markdown(chunk);
      }

      stream.markdown('\n\n');

      return synthesis;
    } catch (error) {
      logger.error('Synthesis failed', error as Error);
      throw error;
    }
  }

  private buildSynthesisPrompt(
    query: string,
    responses: ModelResponse[],
    critiques?: ModelResponse[]
  ): string {
    let prompt = `You are the chairman of an AI council. Multiple AI models have been consulted on the following question:\n\n`;
    prompt += `**Question:** "${query}"\n\n`;
    prompt += '---\n\n';
    prompt += '**Council Members\' Responses:**\n\n';

    for (const response of responses) {
      prompt += `### ${response.modelName}\n\n${response.content}\n\n`;
    }

    if (critiques && critiques.length > 0) {
      prompt += '---\n\n';
      prompt += '**Peer Reviews:**\n\n';
      for (const critique of critiques) {
        prompt += `### ${critique.modelName}\n\n${critique.content}\n\n`;
      }
    }

    prompt += '---\n\n';
    prompt += '**Your Task:**\n\n';
    prompt += 'Synthesize a comprehensive, unified answer that:\n';
    prompt += '1. Combines the best insights from all perspectives\n';
    prompt += '2. Resolves any contradictions or disagreements\n';
    prompt += '3. Provides a clear, actionable answer\n';
    prompt += '4. Acknowledges important caveats or alternative approaches\n';
    if (critiques && critiques.length > 0) {
      prompt += '5. Considers the peer review feedback\n';
    }
    prompt += '\nProvide a well-structured, complete answer that would best serve the questioner.';

    return prompt;
  }
}

export const councilService = new CouncilService();
