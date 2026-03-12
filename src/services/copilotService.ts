// GitHub Copilot service wrapper

import * as vscode from 'vscode';
import { logger } from '../utils/logger';
import { AvailableModel } from '../models/types';

export class CopilotService {
  async getAvailableModels(): Promise<AvailableModel[]> {
    try {
      const models = await vscode.lm.selectChatModels();
      
      return models.map(model => ({
        id: model.id,
        name: model.name || model.id,
        vendor: model.vendor || 'unknown',
        family: model.family || 'unknown',
        version: model.version
      }));
    } catch (error) {
      logger.error('Failed to get available models', error as Error);
      return [];
    }
  }

  async sendRequest(
    modelId: string,
    messages: vscode.LanguageModelChatMessage[],
    options: vscode.LanguageModelChatRequestOptions = {},
    token?: vscode.CancellationToken
  ): Promise<vscode.LanguageModelChatResponse | null> {
    try {
      // Find the model
      const models = await vscode.lm.selectChatModels({
        id: modelId
      });

      if (models.length === 0) {
        logger.warn(`Model ${modelId} not found, trying by vendor/family`);
        // Try to find by name or family
        const allModels = await vscode.lm.selectChatModels();
        const model = allModels.find(m => 
          m.id.includes(modelId) || 
          m.name?.toLowerCase().includes(modelId.toLowerCase())
        );

        if (!model) {
          throw new Error(`Model ${modelId} not available`);
        }

        return await model.sendRequest(messages, options, token);
      }

      const model = models[0];
      return await model.sendRequest(messages, options, token);
    } catch (error) {
      logger.error(`Failed to send request to ${modelId}`, error as Error);
      return null;
    }
  }

  async isCopilotReady(): Promise<boolean> {
    try {
      const models = await vscode.lm.selectChatModels();
      return models.length > 0;
    } catch (error) {
      return false;
    }
  }
}

export const copilotService = new CopilotService();
