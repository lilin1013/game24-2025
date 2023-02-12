import { useState, useEffect, useRef } from 'react';

export type MessageListener = (message: String) => void;

export const useWebSocket = (gameCode:String) => {
  const url = `${process.env.WS_HOST_URL}/gamesocket/${gameCode}`;
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
