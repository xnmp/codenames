import { WebSocketMessage } from '../types/game';
import { WS_BASE_URL } from '../utils/constants';

type MessageHandler = (message: WebSocketMessage) => void;
type ConnectionHandler = () => void;

class WebSocketService {
  private ws: WebSocket | null = null;
  private messageHandlers: Set<MessageHandler> = new Set();
  private connectHandlers: Set<ConnectionHandler> = new Set();
  private disconnectHandlers: Set<ConnectionHandler> = new Set();
  private gameId: string | null = null;
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 5;
  private reconnectTimeout: number | null = null;

  connect(gameId: string): void {
    if (this.ws?.readyState === WebSocket.OPEN) {
      this.disconnect();
    }

    this.gameId = gameId;
    this.ws = new WebSocket(`${WS_BASE_URL}/${gameId}`);

    this.ws.onopen = () => {
      this.reconnectAttempts = 0;
      this.connectHandlers.forEach(handler => handler());
    };

    this.ws.onmessage = (event) => {
      try {
        const message: WebSocketMessage = JSON.parse(event.data);
        this.messageHandlers.forEach(handler => handler(message));
      } catch (error) {
        console.error('Failed to parse WebSocket message:', error);
      }
    };

    this.ws.onclose = () => {
      this.disconnectHandlers.forEach(handler => handler());
      this.attemptReconnect();
    };

    this.ws.onerror = (error) => {
      console.error('WebSocket error:', error);
    };
  }

  private attemptReconnect(): void {
    if (this.reconnectAttempts < this.maxReconnectAttempts && this.gameId) {
      this.reconnectAttempts++;
      const delay = Math.min(1000 * Math.pow(2, this.reconnectAttempts), 10000);

      this.reconnectTimeout = window.setTimeout(() => {
        if (this.gameId) {
          this.connect(this.gameId);
        }
      }, delay);
    }
  }

  disconnect(): void {
    if (this.reconnectTimeout) {
      clearTimeout(this.reconnectTimeout);
      this.reconnectTimeout = null;
    }

    this.reconnectAttempts = this.maxReconnectAttempts; // Prevent reconnection

    if (this.ws) {
      this.ws.close();
      this.ws = null;
    }

    this.gameId = null;
  }

  send(message: WebSocketMessage): void {
    if (this.ws?.readyState === WebSocket.OPEN) {
      this.ws.send(JSON.stringify(message));
    } else {
      console.error('WebSocket is not connected');
    }
  }

  onMessage(handler: MessageHandler): () => void {
    this.messageHandlers.add(handler);
    return () => this.messageHandlers.delete(handler);
  }

  onConnect(handler: ConnectionHandler): () => void {
    this.connectHandlers.add(handler);
    return () => this.connectHandlers.delete(handler);
  }

  onDisconnect(handler: ConnectionHandler): () => void {
    this.disconnectHandlers.add(handler);
    return () => this.disconnectHandlers.delete(handler);
  }

  isConnected(): boolean {
    return this.ws?.readyState === WebSocket.OPEN;
  }
}

export const websocketService = new WebSocketService();
