// Configuration service

import * as vscode from 'vscode';
import { CouncilConfig } from '../models/types';
import { getDefaultModelsForSize } from '../models/modelRegistry';

export class ConfigService {
  getConfig(): CouncilConfig {
    const config = vscode.workspace.getConfiguration('consensus');

    return {
      size: config.get('size', 'standard') as 'minimal' | 'standard' | 'extended',
      member1: config.get('member1', 'gpt-4'),
      member2: config.get('member2', 'gpt-4o'),
      member3: config.get('member3', 'claude-3.5-sonnet'),
      member4: config.get('member4', 'gemini-1.5-pro'),
      chairmanModel: config.get('synthesisModel', 'gpt-4'),
      enableDebateMode: config.get('enableCrossValidation', false),
      streamResponses: config.get('streamResponses', true)
    };
  }

  getCouncilModels(): string[] {
    const config = this.getConfig();
    const sizeMap = {
      minimal: 2,
      standard: 3,
      extended: 4
    };

    const count = sizeMap[config.size];
    const members = [config.member1, config.member2, config.member3, config.member4];
    
    return members.slice(0, count);
  }

  async updateConfig(key: string, value: any): Promise<void> {
    const config = vscode.workspace.getConfiguration('consensus');
    await config.update(key, value, vscode.ConfigurationTarget.Global);
  }
}

export const configService = new ConfigService();
