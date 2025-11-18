import { fetchEventSource } from '@microsoft/fetch-event-source';
import type { ChatRequest } from '../types/chat';

export class ChatService {
  private apiUrl: string;

  constructor(apiUrl: string) {
    this.apiUrl = apiUrl;
  }

  async sendMessage(
    request: ChatRequest,
    onMessage: (content: string) => void,
    onError: (error: Error) => void,
    onComplete: () => void
  ): Promise<void> {
    let buffer = '';

    try {
      await fetchEventSource(this.apiUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(request),
        async onopen(response) {
          if (response.ok && response.headers.get('content-type')?.includes('text/event-stream')) {
            return; // Connection successful
          }
          throw new Error(`Failed to connect: ${response.status} ${response.statusText}`);
        },
        onmessage(event) {
          if (event.data) {
            // Parse the event data
            let content = event.data;

            // Strip surrounding quotes if present
            if (content.startsWith('"') && content.endsWith('"')) {
              content = content.slice(1, -1);
            }

            // Replace \n with actual newlines
            content = content.replace(/\\n/g, '\n');

            // Add to buffer
            buffer += content;

            // Send the processed content
            onMessage(buffer);
          }
        },
        onerror(error) {
          console.error('SSE Error:', error);
          onError(error instanceof Error ? error : new Error('Unknown error occurred'));
          throw error; // Stop the connection
        },
        onclose() {
          // Connection closed successfully
          onComplete();
        },
      });
    } catch (error) {
      console.error('Chat service error:', error);
      onError(error instanceof Error ? error : new Error('Failed to send message'));
    }
  }

  setApiUrl(url: string): void {
    this.apiUrl = url;
  }
}

// Singleton instance
let chatServiceInstance: ChatService | null = null;

export const getChatService = (apiUrl?: string): ChatService => {
  if (!chatServiceInstance) {
    chatServiceInstance = new ChatService(apiUrl || 'https://example.com/v1/chat');
  } else if (apiUrl) {
    chatServiceInstance.setApiUrl(apiUrl);
  }
  return chatServiceInstance;
};
