import { useState, useEffect, useRef } from 'react';
import { v4 as uuidv4 } from 'uuid';

export type MessageListener = (message: String) => void;

export const useWebSocket = (gameCode: String) => {

  const [socket, setSocket] = useState<WebSocket | null>(null);

  const listeners = useRef<Array<MessageListener>>([]);

  const retryCount = useRef(0);

  useEffect(() => {
    if (gameCode) {
      const uuid = uuidv4();
      const url = `${process.env.WS_HOST_URL}/gamesocket?gameCode=${gameCode}&clientId=${uuid}`;
      const newSocket = new WebSocket(url);

      newSocket.onopen = (event) => {
        console.log('WebSocket connected:', event);
      };

      newSocket.onmessage = (event) => {
        console.log('WebSocket message received:', event.data);
        console.log('WebSocket target:', event.target);
        listeners.current.forEach((listener) => listener(event.data));
      };

      newSocket.onerror = (event) => {
        console.error('WebSocket error:', event);
        window.location.reload();
      };

      setSocket(newSocket);

      return () => {
        if (socket) {
          socket.close();
        }
      };
    }

  }, [gameCode]);



  const addMessageListener = (listener: MessageListener) => {
    console.log("adding listener")
    listeners.current.push(listener);
  };

  const removeMessageListener = (listener: MessageListener) => {
    console.log("removing listener")
    listeners.current = listeners.current.filter((l) => l !== listener);
    socket?.close(1000, "close the socket");
  };

  const sendMessage = (message: String) => {
    if (socket && socket.readyState === WebSocket.OPEN) {
      socket.send(JSON.stringify(message));
    }
  };

  return { addMessageListener, removeMessageListener, sendMessage };
};
