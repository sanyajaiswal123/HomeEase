import React, { createContext, useEffect, useState, useContext } from 'react';
import { io } from 'socket.io-client';
import { AuthContext } from './AuthContext';

export const SocketContext = createContext();

export const SocketProvider = ({ children }) => {
  const [socket, setSocket] = useState(null);
  const { user } = useContext(AuthContext);

  useEffect(() => {
    if (user) {
      // Connect to server
      const newSocket = io('http://localhost:5000');
      setSocket(newSocket);

      // Register user with socket server
      newSocket.emit('register', user._id);

      return () => {
        newSocket.disconnect();
      };
    } else {
      if (socket) {
        socket.disconnect();
        setSocket(null);
      }
    }
  }, [user]);

  return <SocketContext.Provider value={socket}>{children}</SocketContext.Provider>;
};
