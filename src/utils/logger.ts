// Logging utilities

import * as vscode from 'vscode';

class Logger {
  private outputChannel: vscode.OutputChannel;

  constructor() {
    this.outputChannel = vscode.window.createOutputChannel('AI Consensus Engine');
  }

  info(message: string): void {
    const timestamp = new Date().toISOString();
    this.outputChannel.appendLine(`[${timestamp}] INFO: ${message}`);
  }

  error(message: string, error?: Error): void {
    const timestamp = new Date().toISOString();
    this.outputChannel.appendLine(`[${timestamp}] ERROR: ${message}`);
    if (error) {
      this.outputChannel.appendLine(`  ${error.message}`);
      if (error.stack) {
        this.outputChannel.appendLine(`  ${error.stack}`);
      }
    }
  }

  warn(message: string): void {
    const timestamp = new Date().toISOString();
    this.outputChannel.appendLine(`[${timestamp}] WARN: ${message}`);
  }

  debug(message: string): void {
    const timestamp = new Date().toISOString();
    this.outputChannel.appendLine(`[${timestamp}] DEBUG: ${message}`);
  }

  show(): void {
    this.outputChannel.show();
  }
}

export const logger = new Logger();
