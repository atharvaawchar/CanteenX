import React, { createContext, useContext, useEffect, useState } from 'react';
import { io } from 'socket.io-client';
import { useAuth } from './AuthContext';

const SocketContext = createContext();

export function SocketProvider({ children }) {
  const [socket, setSocket] = useState(null);
  const { user } = useAuth();

  useEffect(() => {
    const serverUrl = import.meta.env.VITE_API_URL || '/';
    const newSocket = io(serverUrl, {
      transports: ['websocket', 'polling']
    });

    setSocket(newSocket);


    if (user && user.id) {
      newSocket.emit('join_user', user.id);
    }

    return () => newSocket.close();
  }, [user]);

  return (
    <SocketContext.Provider value={socket}>
      {children}
    </SocketContext.Provider>
  );
}

export function useSocket() {
  return useContext(SocketContext);
}
