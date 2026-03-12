// Webview panel provider

import * as vscode from 'vscode';
import { councilService } from '../councilService';
import { configService } from '../services/configService';
import { copilotService } from '../services/copilotService';
import { logger } from '../utils/logger';

export class CouncilWebviewProvider implements vscode.WebviewViewProvider {
  private view?: vscode.WebviewView;

  constructor(private readonly extensionUri: vscode.Uri) {}

  public resolveWebviewView(
    webviewView: vscode.WebviewView,
    context: vscode.WebviewViewResolveContext,
    token: vscode.CancellationToken
  ): void {
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

    logger.info('Webview panel resolved');
  }

  private async handleMessage(message: any, webview: vscode.Webview): Promise<void> {
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

  private async handleQuery(query: string, webview: vscode.Webview): Promise<void> {
    try {
      webview.postMessage({ type: 'clearResults' });
      webview.postMessage({ type: 'status', text: 'Consulting council...' });

      const config = configService.getConfig();

      // Create a custom stream that sends to webview
      const stream: any = {
        markdown: (text: string) => {
          webview.postMessage({ type: 'response', text });
        },
        button: () => {},
        filetree: () => {},
        anchor: () => {},
        progress: () => {},
        reference: () => {},
        push: () => {}
      };

      const token = new vscode.CancellationTokenSource().token;

      await councilService.deliberate(query, config, stream, token);

      webview.postMessage({ type: 'complete' });
    } catch (error) {
      logger.error('Webview query error', error as Error);
      webview.postMessage({ 
        type: 'error', 
        text: (error as Error).message 
      });
    }
  }

  private async sendConfig(webview: vscode.Webview): Promise<void> {
    const config = configService.getConfig();
    webview.postMessage({ type: 'config', config });
  }

  private async checkCopilotStatus(webview: vscode.Webview): Promise<void> {
    const isReady = await copilotService.isCopilotReady();
    webview.postMessage({ type: 'copilotStatus', ready: isReady });
  }

  public refresh(): void {
    if (this.view) {
      this.view.webview.html = this.getHtmlContent(this.view.webview);
    }
  }

  private getHtmlContent(webview: vscode.Webview): string {
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
