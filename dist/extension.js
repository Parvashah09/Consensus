/******/ (() => { // webpackBootstrap
/******/ 	"use strict";
/******/ 	var __webpack_modules__ = ([
/* 0 */
/***/ (function(__unused_webpack_module, exports, __webpack_require__) {


// Main extension entry point
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.activate = activate;
exports.deactivate = deactivate;
const vscode = __importStar(__webpack_require__(1));
const chatParticipant_1 = __webpack_require__(2);
const webviewProvider_1 = __webpack_require__(8);
const logger_1 = __webpack_require__(5);
const copilotService_1 = __webpack_require__(4);
let webviewProvider;
function activate(context) {
    logger_1.logger.info('AI Consensus Engine extension is activating...');
    try {
        // Register chat participant (@council)
        (0, chatParticipant_1.registerChatParticipant)(context);
        // Register webview provider for sidebar
        webviewProvider = new webviewProvider_1.CouncilWebviewProvider(context.extensionUri);
        context.subscriptions.push(vscode.window.registerWebviewViewProvider('consensusSidebar', webviewProvider));
        // Register commands
        context.subscriptions.push(vscode.commands.registerCommand('consensus.openPanel', () => {
            vscode.commands.executeCommand('consensusSidebar.focus');
        }));
        context.subscriptions.push(vscode.commands.registerCommand('consensus.refresh', () => {
            webviewProvider.refresh();
            vscode.window.showInformationMessage('Consensus settings refreshed');
        }));
        context.subscriptions.push(vscode.commands.registerCommand('consensus.exportResults', () => {
            vscode.window.showInformationMessage('Export feature coming soon!');
        }));
        context.subscriptions.push(vscode.commands.registerCommand('consensus.compareModels', () => {
            vscode.window.showInformationMessage('Model comparison coming soon!');
        }));
        // Check Copilot status on activation
        checkCopilotStatus();
        logger_1.logger.info('Open LLM Council extension activated successfully');
    }
    catch (error) {
        logger_1.logger.error('Failed to activate extension', error);
        vscode.window.showErrorMessage(`Open LLM Council: Failed to activate - ${error.message}`);
    }
}
async function checkCopilotStatus() {
    try {
        const isReady = await copilotService_1.copilotService.isCopilotReady();
        if (!isReady) {
            const result = await vscode.window.showWarningMessage('AI Consensus Engine: GitHub Copilot is not ready. Please ensure Copilot is installed and you are signed in.', 'Install Copilot Chat', 'Retry');
            if (result === 'Install Copilot Chat') {
                vscode.commands.executeCommand('workbench.extensions.search', '@id:github.copilot-chat');
            }
            else if (result === 'Retry') {
                setTimeout(() => checkCopilotStatus(), 2000);
            }
        }
        else {
            logger_1.logger.info('GitHub Copilot is ready');
        }
    }
    catch (error) {
        logger_1.logger.error('Failed to check Copilot status', error);
    }
}
function deactivate() {
    logger_1.logger.info('AI Consensus Engine extension deactivated');
}


/***/ }),
/* 1 */
/***/ ((module) => {

module.exports = require("vscode");

/***/ }),
/* 2 */
/***/ (function(__unused_webpack_module, exports, __webpack_require__) {


// Chat participant handler for @council
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.registerChatParticipant = registerChatParticipant;
const vscode = __importStar(__webpack_require__(1));
const councilService_1 = __webpack_require__(3);
const copilotService_1 = __webpack_require__(4);
const configService_1 = __webpack_require__(6);
const logger_1 = __webpack_require__(5);
const modelRegistry_1 = __webpack_require__(7);
function registerChatParticipant(context) {
    const participant = vscode.chat.createChatParticipant('consensus', async (request, chatContext, stream, token) => {
        return await handleChatRequest(request, chatContext, stream, token);
    });
    participant.iconPath = vscode.Uri.joinPath(context.extensionUri, 'media', 'icon.png');
    context.subscriptions.push(participant);
    logger_1.logger.info('Chat participant registered: @consensus');
}
async function handleChatRequest(request, context, stream, token) {
    try {
        // Check if Copilot is ready
        const isReady = await copilotService_1.copilotService.isCopilotReady();
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
        let config = configService_1.configService.getConfig();
        if (parsed.type === 'quick') {
            config = { ...config, size: 'minimal', enableDebateMode: false };
            stream.markdown('⚡ **Quick Mode** - Using minimal council size\n\n');
        }
        else if (parsed.type === 'debate') {
            config = { ...config, enableDebateMode: true };
            stream.markdown('🗣️ **Debate Mode** - Peer review enabled\n\n');
        }
        // Execute council deliberation
        await councilService_1.councilService.deliberate(parsed.query, config, stream, token);
        return { metadata: { command: parsed.type } };
    }
    catch (error) {
        logger_1.logger.error('Chat request handler error', error);
        stream.markdown(`\n\n❌ **Error:** ${error.message}\n`);
        return { metadata: { command: 'error' } };
    }
}
function parseCommand(prompt) {
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
async function handleModelsCommand(stream, token) {
    stream.markdown('# Available AI Models\n\n');
    const availableModels = await copilotService_1.copilotService.getAvailableModels();
    if (availableModels.length === 0) {
        stream.markdown('⚠️ No models currently available. Please check your GitHub Copilot connection.\n');
        return { metadata: { command: 'models' } };
    }
    stream.markdown('## Currently Available\n\n');
    for (const model of availableModels) {
        const knownModel = modelRegistry_1.KNOWN_MODELS.find(m => model.id.includes(m.id) || m.id.includes(model.id));
        if (knownModel) {
            stream.markdown(`- **${knownModel.name}** \`(${model.id})\` - ${knownModel.description}\n`);
        }
        else {
            stream.markdown(`- **${model.name}** \`(${model.id})\` - ${model.vendor}\n`);
        }
    }
    stream.markdown('\n## Configuration\n\n');
    const config = configService_1.configService.getConfig();
    stream.markdown(`- **Council Size:** ${config.size}\n`);
    stream.markdown(`- **Council Members:** ${configService_1.configService.getCouncilModels().join(', ')}\n`);
    stream.markdown(`- **Chairman Model:** ${config.chairmanModel}\n`);
    stream.markdown(`- **Debate Mode:** ${config.enableDebateMode ? 'Enabled' : 'Disabled'}\n`);
    return { metadata: { command: 'models' } };
}


/***/ }),
/* 3 */
/***/ (function(__unused_webpack_module, exports, __webpack_require__) {


// Council service - orchestrates multi-model deliberation
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.councilService = exports.CouncilService = void 0;
const vscode = __importStar(__webpack_require__(1));
const copilotService_1 = __webpack_require__(4);
const configService_1 = __webpack_require__(6);
const logger_1 = __webpack_require__(5);
const modelRegistry_1 = __webpack_require__(7);
class CouncilService {
    async deliberate(query, config, stream, token) {
        const startTime = new Date();
        try {
            // Stage 1: Gather responses
            stream.markdown(' **Consulting Council Members...**\n\n');
            const responses = await this.gatherResponses(query, config, stream, token);
            if (responses.length === 0) {
                throw new Error('No responses received from council members');
            }
            // Stage 2: Review (if debate mode enabled)
            let critiques;
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
        }
        catch (error) {
            logger_1.logger.error('Deliberation failed', error);
            stream.markdown(`\n\n **Error**: ${error.message}\n`);
            throw error;
        }
    }
    async gatherResponses(query, config, stream, token) {
        const models = configService_1.configService.getCouncilModels();
        logger_1.logger.info(`Gathering responses from ${models.length} models: ${models.join(', ')}`);
        const promises = models.map(modelId => this.queryModel(modelId, query, stream, token));
        const results = await Promise.allSettled(promises);
        const responses = [];
        for (let i = 0; i < results.length; i++) {
            const result = results[i];
            if (result.status === 'fulfilled' && result.value) {
                responses.push(result.value);
            }
            else if (result.status === 'rejected') {
                logger_1.logger.error(`Model ${models[i]} failed`, result.reason);
                stream.markdown(`⚠️ *${models[i]} failed to respond*\n\n`);
            }
        }
        return responses;
    }
    async queryModel(modelId, query, stream, token) {
        const modelInfo = (0, modelRegistry_1.getModelInfo)(modelId);
        const modelName = modelInfo?.name || modelId;
        try {
            stream.markdown(`### 🤖 ${modelName}\n\n`);
            const messages = [
                vscode.LanguageModelChatMessage.User(query)
            ];
            const response = await copilotService_1.copilotService.sendRequest(modelId, messages, {}, token);
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
        }
        catch (error) {
            logger_1.logger.error(`Failed to query ${modelId}`, error);
            return null;
        }
    }
    async reviewResponses(query, responses, config, stream, token) {
        logger_1.logger.info('Starting peer review stage');
        const critiques = [];
        // Each model reviews other models' responses
        for (const reviewer of responses) {
            if (token.isCancellationRequested) {
                break;
            }
            const otherResponses = responses.filter(r => r.modelId !== reviewer.modelId);
            const reviewPrompt = this.buildReviewPrompt(query, otherResponses);
            stream.markdown(`### 💭 ${reviewer.modelName} Reviews\n\n`);
            const messages = [
                vscode.LanguageModelChatMessage.User(reviewPrompt)
            ];
            try {
                const response = await copilotService_1.copilotService.sendRequest(reviewer.modelId, messages, {}, token);
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
            }
            catch (error) {
                logger_1.logger.error(`${reviewer.modelName} review failed`, error);
            }
        }
        return critiques;
    }
    buildReviewPrompt(query, responses) {
        let prompt = `Original question: "${query}"\n\n`;
        prompt += 'Here are responses from other AI models:\n\n';
        for (const response of responses) {
            prompt += `**${response.modelName}:**\n${response.content}\n\n`;
        }
        prompt += 'Please provide a brief critique of these responses. What are their strengths? What might be missing or could be improved? Be constructive and specific.';
        return prompt;
    }
    async synthesize(query, responses, critiques, config, stream, token) {
        const synthesisPrompt = this.buildSynthesisPrompt(query, responses, critiques);
        const messages = [
            vscode.LanguageModelChatMessage.User(synthesisPrompt)
        ];
        try {
            const response = await copilotService_1.copilotService.sendRequest(config.chairmanModel, messages, {}, token);
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
        }
        catch (error) {
            logger_1.logger.error('Synthesis failed', error);
            throw error;
        }
    }
    buildSynthesisPrompt(query, responses, critiques) {
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
exports.CouncilService = CouncilService;
exports.councilService = new CouncilService();


/***/ }),
/* 4 */
/***/ (function(__unused_webpack_module, exports, __webpack_require__) {


// GitHub Copilot service wrapper
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.copilotService = exports.CopilotService = void 0;
const vscode = __importStar(__webpack_require__(1));
const logger_1 = __webpack_require__(5);
class CopilotService {
    async getAvailableModels() {
        try {
            const models = await vscode.lm.selectChatModels();
            return models.map(model => ({
                id: model.id,
                name: model.name || model.id,
                vendor: model.vendor || 'unknown',
                family: model.family || 'unknown',
                version: model.version
            }));
        }
        catch (error) {
            logger_1.logger.error('Failed to get available models', error);
            return [];
        }
    }
    async sendRequest(modelId, messages, options = {}, token) {
        try {
            // Find the model
            const models = await vscode.lm.selectChatModels({
                id: modelId
            });
            if (models.length === 0) {
                logger_1.logger.warn(`Model ${modelId} not found, trying by vendor/family`);
                // Try to find by name or family
                const allModels = await vscode.lm.selectChatModels();
                const model = allModels.find(m => m.id.includes(modelId) ||
                    m.name?.toLowerCase().includes(modelId.toLowerCase()));
                if (!model) {
                    throw new Error(`Model ${modelId} not available`);
                }
                return await model.sendRequest(messages, options, token);
            }
            const model = models[0];
            return await model.sendRequest(messages, options, token);
        }
        catch (error) {
            logger_1.logger.error(`Failed to send request to ${modelId}`, error);
            return null;
        }
    }
    async isCopilotReady() {
        try {
            const models = await vscode.lm.selectChatModels();
            return models.length > 0;
        }
        catch (error) {
            return false;
        }
    }
}
exports.CopilotService = CopilotService;
exports.copilotService = new CopilotService();


/***/ }),
/* 5 */
/***/ (function(__unused_webpack_module, exports, __webpack_require__) {


// Logging utilities
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.logger = void 0;
const vscode = __importStar(__webpack_require__(1));
class Logger {
    constructor() {
        this.outputChannel = vscode.window.createOutputChannel('AI Consensus Engine');
    }
    info(message) {
        const timestamp = new Date().toISOString();
        this.outputChannel.appendLine(`[${timestamp}] INFO: ${message}`);
    }
    error(message, error) {
        const timestamp = new Date().toISOString();
        this.outputChannel.appendLine(`[${timestamp}] ERROR: ${message}`);
        if (error) {
            this.outputChannel.appendLine(`  ${error.message}`);
            if (error.stack) {
                this.outputChannel.appendLine(`  ${error.stack}`);
            }
        }
    }
    warn(message) {
        const timestamp = new Date().toISOString();
        this.outputChannel.appendLine(`[${timestamp}] WARN: ${message}`);
    }
    debug(message) {
        const timestamp = new Date().toISOString();
        this.outputChannel.appendLine(`[${timestamp}] DEBUG: ${message}`);
    }
    show() {
        this.outputChannel.show();
    }
}
exports.logger = new Logger();


/***/ }),
/* 6 */
/***/ (function(__unused_webpack_module, exports, __webpack_require__) {


// Configuration service
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.configService = exports.ConfigService = void 0;
const vscode = __importStar(__webpack_require__(1));
class ConfigService {
    getConfig() {
        const config = vscode.workspace.getConfiguration('consensus');
        return {
            size: config.get('size', 'standard'),
            member1: config.get('member1', 'gpt-4'),
            member2: config.get('member2', 'gpt-4o'),
            member3: config.get('member3', 'claude-3.5-sonnet'),
            member4: config.get('member4', 'gemini-1.5-pro'),
            chairmanModel: config.get('synthesisModel', 'gpt-4'),
            enableDebateMode: config.get('enableCrossValidation', false),
            streamResponses: config.get('streamResponses', true)
        };
    }
    getCouncilModels() {
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
    async updateConfig(key, value) {
        const config = vscode.workspace.getConfiguration('consensus');
        await config.update(key, value, vscode.ConfigurationTarget.Global);
    }
}
exports.ConfigService = ConfigService;
exports.configService = new ConfigService();


/***/ }),
/* 7 */
/***/ ((__unused_webpack_module, exports) => {


// Registry of available models
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.KNOWN_MODELS = void 0;
exports.getModelInfo = getModelInfo;
exports.getDefaultModelsForSize = getDefaultModelsForSize;
exports.KNOWN_MODELS = [
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
function getModelInfo(modelId) {
    return exports.KNOWN_MODELS.find(m => m.id === modelId || m.name === modelId);
}
function getDefaultModelsForSize(size) {
    const models = {
        minimal: ['gpt-4', 'claude-3.5-sonnet'],
        standard: ['gpt-4', 'claude-3.5-sonnet', 'gemini-1.5-pro'],
        extended: ['gpt-4', 'gpt-4o', 'claude-3.5-sonnet', 'gemini-1.5-pro']
    };
    return models[size];
}


/***/ }),
/* 8 */
/***/ (function(__unused_webpack_module, exports, __webpack_require__) {


// Webview panel provider
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.CouncilWebviewProvider = void 0;
const vscode = __importStar(__webpack_require__(1));
const councilService_1 = __webpack_require__(3);
const configService_1 = __webpack_require__(6);
const copilotService_1 = __webpack_require__(4);
const logger_1 = __webpack_require__(5);
class CouncilWebviewProvider {
    constructor(extensionUri) {
        this.extensionUri = extensionUri;
    }
    resolveWebviewView(webviewView, context, token) {
        this.view = webviewView;
        webviewView.webview.options = {
            enableScripts: true,
            localResourceRoots: [this.extensionUri]
        };
        webviewView.webview.html = this.getHtmlContent(webviewView.webview);
        // Handle messages from webview
        webviewView.webview.onDidReceiveMessage(async (message) => {
            await this.handleMessage(message, webviewView.webview);
        });
        logger_1.logger.info('Webview panel resolved');
    }
    async handleMessage(message, webview) {
        switch (message.type) {
            case 'query':
                await this.handleQuery(message.text, webview);
                break;
            case 'getConfig':
                await this.sendConfig(webview);
                break;
            case 'checkCopilot':
                await this.checkCopilotStatus(webview);
                break;
        }
    }
    async handleQuery(query, webview) {
        try {
            webview.postMessage({ type: 'clearResults' });
            webview.postMessage({ type: 'status', text: 'Consulting council...' });
            const config = configService_1.configService.getConfig();
            // Create a custom stream that sends to webview
            const stream = {
                markdown: (text) => {
                    webview.postMessage({ type: 'response', text });
                },
                button: () => { },
                filetree: () => { },
                anchor: () => { },
                progress: () => { },
                reference: () => { },
                push: () => { }
            };
            const token = new vscode.CancellationTokenSource().token;
            await councilService_1.councilService.deliberate(query, config, stream, token);
            webview.postMessage({ type: 'complete' });
        }
        catch (error) {
            logger_1.logger.error('Webview query error', error);
            webview.postMessage({
                type: 'error',
                text: error.message
            });
        }
    }
    async sendConfig(webview) {
        const config = configService_1.configService.getConfig();
        webview.postMessage({ type: 'config', config });
    }
    async checkCopilotStatus(webview) {
        const isReady = await copilotService_1.copilotService.isCopilotReady();
        webview.postMessage({ type: 'copilotStatus', ready: isReady });
    }
    refresh() {
        if (this.view) {
            this.view.webview.html = this.getHtmlContent(this.view.webview);
        }
    }
    getHtmlContent(webview) {
        return `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Open LLM Council</title>
    <style>
        body {
            padding: 10px;
            font-family: var(--vscode-font-family);
            color: var(--vscode-foreground);
            background-color: var(--vscode-editor-background);
        }
        
        .header {
            margin-bottom: 20px;
            padding-bottom: 10px;
            border-bottom: 1px solid var(--vscode-panel-border);
        }
        
        .header h2 {
            margin: 0 0 10px 0;
            font-size: 18px;
        }
        
        .input-section {
            margin-bottom: 20px;
        }
        
        textarea {
            width: 100%;
            min-height: 80px;
            padding: 8px;
            background: var(--vscode-input-background);
            color: var(--vscode-input-foreground);
            border: 1px solid var(--vscode-input-border);
            border-radius: 4px;
            font-family: var(--vscode-font-family);
            resize: vertical;
        }
        
        textarea:focus {
            outline: 1px solid var(--vscode-focusBorder);
        }
        
        .button-group {
            display: flex;
            gap: 8px;
            margin-top: 10px;
        }
        
        button {
            padding: 6px 12px;
            background: var(--vscode-button-background);
            color: var(--vscode-button-foreground);
            border: none;
            border-radius: 4px;
            cursor: pointer;
            font-size: 13px;
        }
        
        button:hover {
            background: var(--vscode-button-hoverBackground);
        }
        
        button:disabled {
            opacity: 0.5;
            cursor: not-allowed;
        }
        
        .status {
            margin: 10px 0;
            padding: 8px;
            background: var(--vscode-textBlockQuote-background);
            border-left: 3px solid var(--vscode-textBlockQuote-border);
            font-size: 13px;
        }
        
        .results {
            margin-top: 20px;
        }
        
        .result-content {
            line-height: 1.6;
        }
        
        .error {
            color: var(--vscode-errorForeground);
            background: var(--vscode-inputValidation-errorBackground);
            border: 1px solid var(--vscode-inputValidation-errorBorder);
            padding: 10px;
            border-radius: 4px;
            margin: 10px 0;
        }
        
        .copilot-warning {
            background: var(--vscode-inputValidation-warningBackground);
            border: 1px solid var(--vscode-inputValidation-warningBorder);
            padding: 10px;
            border-radius: 4px;
            margin: 10px 0;
        }
        
        code {
            background: var(--vscode-textCodeBlock-background);
            padding: 2px 4px;
            border-radius: 3px;
            font-family: var(--vscode-editor-font-family);
        }
        
        pre {
            background: var(--vscode-textCodeBlock-background);
            padding: 10px;
            border-radius: 4px;
            overflow-x: auto;
        }
        
        pre code {
            padding: 0;
        }
    </style>
</head>
<body>
    <div class="header">
        <h2>🧠 AI Consensus Engine</h2>
        <p style="margin: 0; font-size: 12px; opacity: 0.8;">Get AI consensus through multi-model collaboration</p>
    </div>
    
    <div id="copilotWarning" class="copilot-warning" style="display: none;">
        ⚠️ GitHub Copilot is not ready. Please check your connection.
    </div>
    
    <div class="input-section">
        <textarea id="queryInput" placeholder="Ask a question to get AI consensus..."></textarea>
        <div class="button-group">
            <button id="askBtn" onclick="askCouncil()">🧠 Ask Consensus</button>
            <button id="quickBtn" onclick="askQuick()">⚡ Quick Mode</button>
            <button id="debateBtn" onclick="askDebate()">🔍 Analyze</button>
        </div>
    </div>
    
    <div id="status" class="status" style="display: none;"></div>
    
    <div id="results" class="results">
        <div id="resultContent" class="result-content"></div>
    </div>

    <script>
        const vscode = acquireVsCodeApi();
        let isProcessing = false;

        // Check Copilot status on load
        window.addEventListener('load', () => {
            vscode.postMessage({ type: 'checkCopilot' });
        });

        // Handle messages from extension
        window.addEventListener('message', event => {
            const message = event.data;
            
            switch (message.type) {
                case 'response':
                    appendResponse(message.text);
                    break;
                case 'status':
                    showStatus(message.text);
                    break;
                case 'error':
                    showError(message.text);
                    setProcessing(false);
                    break;
                case 'complete':
                    hideStatus();
                    setProcessing(false);
                    break;
                case 'clearResults':
                    clearResults();
                    break;
                case 'copilotStatus':
                    updateCopilotStatus(message.ready);
                    break;
            }
        });

        function askCouncil() {
            const query = document.getElementById('queryInput').value.trim();
            if (!query || isProcessing) return;
            
            setProcessing(true);
            vscode.postMessage({ type: 'query', text: query });
        }

        function askQuick() {
            const query = document.getElementById('queryInput').value.trim();
            if (!query || isProcessing) return;
            
            setProcessing(true);
            vscode.postMessage({ type: 'query', text: '/quick ' + query });
        }

        function askDebate() {
            const query = document.getElementById('queryInput').value.trim();
            if (!query || isProcessing) return;
            
            setProcessing(true);
            vscode.postMessage({ type: 'query', text: '/debate ' + query });
        }

        function setProcessing(processing) {
            isProcessing = processing;
            const buttons = document.querySelectorAll('button');
            buttons.forEach(btn => btn.disabled = processing);
        }

        function showStatus(text) {
            const status = document.getElementById('status');
            status.textContent = text;
            status.style.display = 'block';
        }

        function hideStatus() {
            const status = document.getElementById('status');
            status.style.display = 'none';
        }

        function appendResponse(text) {
            const content = document.getElementById('resultContent');
            // Simple markdown-like rendering
            const html = text
                .replace(/\\*\\*(.+?)\\*\\*/g, '<strong>$1</strong>')
                .replace(/\\*(.+?)\\*/g, '<em>$1</em>')
                .replace(/\`(.+?)\`/g, '<code>$1</code>')
                .replace(/^### (.+)$/gm, '<h3>$1</h3>')
                .replace(/^## (.+)$/gm, '<h2>$1</h2>')
                .replace(/^# (.+)$/gm, '<h1>$1</h1>')
                .replace(/\\n/g, '<br>');
            content.innerHTML += html;
            content.scrollTop = content.scrollHeight;
        }

        function showError(text) {
            const content = document.getElementById('resultContent');
            content.innerHTML += \`<div class="error">❌ Error: \${text}</div>\`;
        }

        function clearResults() {
            document.getElementById('resultContent').innerHTML = '';
        }

        function updateCopilotStatus(ready) {
            const warning = document.getElementById('copilotWarning');
            warning.style.display = ready ? 'none' : 'block';
            
            const buttons = document.querySelectorAll('button');
            buttons.forEach(btn => btn.disabled = !ready);
        }

        // Enter to submit (with Ctrl/Cmd)
        document.getElementById('queryInput').addEventListener('keydown', (e) => {
            if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
                askCouncil();
            }
        });
    </script>
</body>
</html>`;
    }
}
exports.CouncilWebviewProvider = CouncilWebviewProvider;


/***/ })
/******/ 	]);
/************************************************************************/
/******/ 	// The module cache
/******/ 	var __webpack_module_cache__ = {};
/******/ 	
/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {
/******/ 		// Check if module is in cache
/******/ 		var cachedModule = __webpack_module_cache__[moduleId];
/******/ 		if (cachedModule !== undefined) {
/******/ 			return cachedModule.exports;
/******/ 		}
/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = __webpack_module_cache__[moduleId] = {
/******/ 			// no module.id needed
/******/ 			// no module.loaded needed
/******/ 			exports: {}
/******/ 		};
/******/ 	
/******/ 		// Execute the module function
/******/ 		__webpack_modules__[moduleId].call(module.exports, module, module.exports, __webpack_require__);
/******/ 	
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/ 	
/************************************************************************/
/******/ 	
/******/ 	// startup
/******/ 	// Load entry module and return exports
/******/ 	// This entry module is referenced by other modules so it can't be inlined
/******/ 	var __webpack_exports__ = __webpack_require__(0);
/******/ 	module.exports = __webpack_exports__;
/******/ 	
/******/ })()
;
//# sourceMappingURL=extension.js.map