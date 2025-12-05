import { useEffect, useState, useCallback } from 'react';
import { websocketService } from '../services/websocket';
import { WebSocketMessage } from '../types/game';

export function useWebSocket(gameId: string | null) {
  const [isConnected, setIsConnected] = useState(false);
  const [lastMessage, setLastMessage] = useState<WebSocketMessage | null>(null);

  useEffect(() => {
    if (!gameId) return;

    websocketService.connect(gameId);

    const unsubConnect = websocketService.onConnect(() => {
      setIsConnected(true);
    });

    const unsubDisconnect = websocketService.onDisconnect(() => {
      setIsConnected(false);
    });

    const unsubMessage = websocketService.onMessage((message) => {
      setLastMessage(message);
    });

    return () => {
      unsubConnect();
      unsubDisconnect();
      unsubMessage();
      websocketService.disconnect();
    };
  }, [gameId]);

  const sendMessage = useCallback((message: WebSocketMessage) => {
    websocketService.send(message);
  }, []);

  return {
    isConnected,
    lastMessage,
    sendMessage,
  };
}
