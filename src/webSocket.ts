import { useState, useEffect, useRef } from 'react';

export type MessageListener = (message: String) => void;

export const useWebSocket = () => {
  const url = 'ws://localhost:5065/game';
  const [socket, setSocket] = useState<WebSocket | null>(null);

  const listeners = useRef<Array<MessageListener>>([]);

  useEffect(() => {
    const newSocket = new WebSocket(url);

    newSocket.onopen = (event) => {
      console.log('WebSocket connected:', event);
    };

    newSocket.onmessage = (event) => {
      console.log('WebSocket message received:', event.data);
      listeners.current.forEach((listener) => listener(event.data));
    };

    newSocket.onerror = (event) => {
      console.error('WebSocket error:', event);
    };

    setSocket(newSocket);

    return () => {
      if (socket) {
        socket.close();
      }
    };
  }, []);

  

  const addMessageListener = (listener: MessageListener) => {
    listeners.current.push(listener);
  };

  const removeMessageListener = (listener: MessageListener) => {
    listeners.current = listeners.current.filter((l) => l !== listener);
  };

  const sendMessage = (message: String) => {
    if (socket && socket.readyState === WebSocket.OPEN) {
      socket.send(JSON.stringify(message));
    }
  };

  return { addMessageListener, removeMessageListener, sendMessage };
};
