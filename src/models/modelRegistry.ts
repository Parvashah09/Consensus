// Registry of available models

export interface ModelInfo {
  id: string;
  name: string;
  description: string;
  vendor: string;
}

export const KNOWN_MODELS: ModelInfo[] = [
  {
    id: 'gpt-4',
    name: 'GPT-4',
    description: 'OpenAI\'s advanced reasoning model',
    vendor: 'openai'
  },
  {
    id: 'gpt-4o',
    name: 'GPT-4o',
    description: 'OpenAI\'s fast, capable model',
    vendor: 'openai'
  },
  {
    id: 'gpt-4o-mini',
    name: 'GPT-4o mini',
    description: 'OpenAI\'s compact efficient model',
    vendor: 'openai'
  },
  {
    id: 'o1-preview',
    name: 'O1 Preview',
    description: 'OpenAI\'s reasoning model',
    vendor: 'openai'
  },
  {
    id: 'o1-mini',
    name: 'O1 Mini',
    description: 'OpenAI\'s compact reasoning model',
    vendor: 'openai'
  },
  {
    id: 'claude-3.5-sonnet',
    name: 'Claude 3.5 Sonnet',
    description: 'Anthropic\'s advanced model',
    vendor: 'anthropic'
  },
  {
    id: 'claude-3-opus',
    name: 'Claude 3 Opus',
    description: 'Anthropic\'s most capable model',
    vendor: 'anthropic'
  },
  {
    id: 'gemini-1.5-pro',
    name: 'Gemini 1.5 Pro',
    description: 'Google\'s advanced model',
    vendor: 'google'
  },
  {
    id: 'gemini-2.0-flash',
    name: 'Gemini 2.0 Flash',
    description: 'Google\'s fast next-gen model',
    vendor: 'google'
  }
];

export function getModelInfo(modelId: string): ModelInfo | undefined {
  return KNOWN_MODELS.find(m => m.id === modelId || m.name === modelId);
}

export function getDefaultModelsForSize(size: 'minimal' | 'standard' | 'extended'): string[] {
  const models = {
    minimal: ['gpt-4', 'claude-3.5-sonnet'],
    standard: ['gpt-4', 'claude-3.5-sonnet', 'gemini-1.5-pro'],
    extended: ['gpt-4', 'gpt-4o', 'claude-3.5-sonnet', 'gemini-1.5-pro']
  };
  return models[size];
}
