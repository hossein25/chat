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
import React, { FC, useEffect, useRef, useState } from 'react';
import { sendMessageToOpenAI } from '../../api/openai.service';

const TextChat: FC = () => {
  const [messages, setMessages] = useState<{ user: string; bot: string }[]>([]);
  const [userMessage, setUserMessage] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const messagesEndRef = useRef<HTMLDivElement | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (userMessage.trim() === '') return;

    const newMessages = [...messages, { user: userMessage, bot: '...' }];
    setMessages(newMessages);
    setUserMessage('');
    setIsLoading(true);
    setError(null);

    try {
      const botResponse = await sendMessageToOpenAI(userMessage);
      setMessages([
        ...newMessages.slice(0, -1),
        { user: userMessage, bot: botResponse },
      ]);
    } catch (error) {
      console.error('Error sending message:', error);
      setError('Sorry, something went wrong!');
      setMessages([
        ...newMessages.slice(0, -1),
        { user: userMessage, bot: 'Error: Unable to process request.' },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

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
        fontFamily: '"Roboto", sans-serif',
      }}
    >
      <Typography
        variant="h4"
        gutterBottom
        sx={{ color: '#3f51b5', fontWeight: 'bold', marginBottom: 4 }}
      >
        Text Chat - Hossein AI 😂
      </Typography>

      {error && (
        <Alert
          severity="error"
          sx={{ width: '100%', maxWidth: 600, marginBottom: 2 }}
        >
          {error}
        </Alert>
      )}

      <Paper
        sx={{
          width: '100%',
          maxWidth: 600,
          padding: 3,
          marginBottom: 2,
          height: '80%',
          maxHeight: 600,
          overflowY: 'auto',
          boxShadow: 2,
          borderRadius: 2,
          backgroundColor: '#ffffff',
        }}
      >
        <Stack spacing={2}>
          {messages.map((message, index) => (
            <Box key={index}>
              <Typography variant="body1" color="primary" fontWeight="bold">
                You: {message.user}
              </Typography>
              <Typography variant="body1" color="text.secondary">
                Bot: {message.bot}
              </Typography>
            </Box>
          ))}
          <div ref={messagesEndRef} />
        </Stack>
      </Paper>

      <form onSubmit={handleSubmit} style={{ width: '100%' }}>
        <Stack direction="row" spacing={2} sx={{ marginTop: 2 }}>
          <TextField
            autoFocus
            label="Type your message..."
            variant="outlined"
            fullWidth
            value={userMessage}
            onChange={(e) => setUserMessage(e.target.value)}
            disabled={isLoading}
            sx={{
              '& .MuiInputBase-root': { borderRadius: 2 },
            }}
          />
          <Button
            type="submit"
            variant="contained"
            color="primary"
            disabled={isLoading || userMessage.trim() === ''}
            sx={{
              borderRadius: 2,
              '&:disabled': { backgroundColor: '#ccc' },
            }}
          >
            {isLoading ? <CircularProgress /> : 'Send'}
          </Button>
        </Stack>
      </form>
    </Box>
  );
};

export default TextChat;
