import {
  Alert,
  Box,
  Button,
  CircularProgress,
  Paper,
  Stack,
  TextField,
  Typography,
} from '@mui/material';
import React, { useEffect, useRef, useState } from 'react';

const SOCKET_URL =
  'wss://api.openai.com/v1/realtime?model=gpt-4o-realtime-preview-2024-12-17';
const OPENAI_API_KEY = import.meta.env.VITE_OPEN_AI_API_KEY;

const RealtimeChat: React.FC = () => {
  const [messages, setMessages] = useState<string[]>([]);
  const [userMessage, setUserMessage] = useState<string>('');
  const [partialMessage, setPartialMessage] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const messagesEndRef = useRef<HTMLDivElement | null>(null);
  const socketRef = useRef<WebSocket | null>(null);

  const connectWebSocket = () => {
    socketRef.current = new WebSocket(SOCKET_URL, [
      'realtime',
      `openai-insecure-api-key.${OPENAI_API_KEY}`,
      'openai-beta.realtime-v1',
    ]);

    socketRef.current.onopen = () => {
      console.log('Connected to Open AI server.');
    };

    socketRef.current.onerror = (error) => {
      console.error('Socket error:', error);
      setError('Socket error. Please check your connection or credentials.');
    };

    socketRef.current.onmessage = (event) => {
      try {
        const message = JSON.parse(event.data);
        switch (message.type) {
          case 'response.text.delta':
            setPartialMessage((prev) => prev + message.delta);
            break;
          case 'response.content_part.done':
            setMessages((prevMessages) => [
              ...prevMessages,
              `Bot: ${message?.part?.text}`,
            ]);
            setPartialMessage('');
            setIsLoading(false);
            break;
          default:
            console.log('Unhandled message type:', message.type);
        }
      } catch (error) {
        console.error('Error processing message:', error);
        setError('Error while processing incoming message.');
      }
    };

    socketRef.current.onclose = () => {
      console.log('Socket connection closed.');
      setError('Socket connection closed. Please try reconnecting.');
    };
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!userMessage.trim()) return;

    setMessages((prevMessages) => [...prevMessages, `You: ${userMessage}`]);
    setUserMessage('');
    setIsLoading(true);
    setError(null);

    if (socketRef.current && socketRef.current.readyState === WebSocket.OPEN) {
      const message = {
        type: 'response.create',
        response: {
          modalities: ['text'],
          instructions: userMessage,
        },
      };
      socketRef.current.send(JSON.stringify(message));
    } else {
      setError('Socket is not connected. Please try again later.');
      setIsLoading(false);
    }
  };

  useEffect(() => {
    connectWebSocket();
    return () => {
      if (socketRef.current) {
        socketRef.current.close();
      }
    };
  }, []);

  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages]);

  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
        height: '100vh',
        padding: 2,
        backgroundColor: '#f4f6f8',
      }}
    >
      <Typography
        variant="h4"
        gutterBottom
        sx={{ color: '#3f51b5', fontWeight: 'bold', marginBottom: 4 }}
      >
        Realtime Chat - Hossein AI 😂
      </Typography>
      {error && <Alert severity="error">{error}</Alert>}
      <Paper
        sx={{
          width: '100%',
          maxWidth: 600,
          padding: 3,
          marginBottom: 2,
          height: '80%',
          overflowY: 'auto',
          boxShadow: 4,
          borderRadius: 2,
          backgroundColor: '#ffffff',
        }}
      >
        <Stack spacing={2}>
          {messages.map((msg, index) => (
            <Typography key={index}>{msg}</Typography>
          ))}
          {partialMessage && (
            <Typography
              style={{ color: 'gray' }}
            >{`Bot: ${partialMessage}`}</Typography>
          )}
          <div ref={messagesEndRef} />
        </Stack>
      </Paper>
      {isLoading && <CircularProgress sx={{ marginTop: 2 }} />}
      <form onSubmit={handleSubmit} style={{ width: '100%', maxWidth: 600 }}>
        <Stack direction="row" spacing={2} sx={{ marginTop: 2 }}>
          <TextField
            label="Type your message..."
            variant="outlined"
            fullWidth
            value={userMessage}
            onChange={(e) => setUserMessage(e.target.value)}
          />
          <Button
            type="submit"
            variant="contained"
            disabled={isLoading || !userMessage.trim()}
          >
            Send
          </Button>
        </Stack>
      </form>
    </Box>
  );
};

export default RealtimeChat;
