// Type definitions for the extension

export interface CouncilConfig {
  size: 'minimal' | 'standard' | 'extended';
  member1: string;
  member2: string;
  member3: string;
  member4: string;
  chairmanModel: string;
  enableDebateMode: boolean;
  streamResponses: boolean;
}

export interface ModelResponse {
  modelName: string;
  modelId: string;
  content: string;
  timestamp: Date;
}

export interface CouncilResult {
  query: string;
  responses: ModelResponse[];
  critiques?: ModelResponse[];
  synthesis: string;
  timestamp: Date;
  config: CouncilConfig;
}

export interface AvailableModel {
  id: string;
  name: string;
  vendor: string;
  family: string;
  version?: string;
}

export type CommandType = 'standard' | 'quick' | 'debate' | 'models';

export interface ParsedCommand {
  type: CommandType;
  query: string;
}
