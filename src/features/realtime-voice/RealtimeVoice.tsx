import {
  Alert,
  Box,
  Button,
  CircularProgress,
  Typography,
} from '@mui/material';
import { useEffect, useRef, useState } from 'react';

const SOCKET_URL =
  'wss://api.openai.com/v1/realtime?model=gpt-4o-realtime-preview-2024-12-17';
const OPENAI_API_KEY = import.meta.env.VITE_OPEN_AI_API_KEY;

const RealtimeVoice = () => {
  const [isRecording, setIsRecording] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [voiceMessage, setVoiceMessage] = useState<string>('');
  const socketRef = useRef<WebSocket | null>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);

  const connectWebSocket = () => {
    socketRef.current = new WebSocket(SOCKET_URL, [
      'realtime',
      `openai-insecure-api-key.${OPENAI_API_KEY}`,
      'openai-beta.realtime-v1',
    ]);

    socketRef.current.onopen = () => {
      console.log('Connected to Socket server for voice messages.');
    };

    socketRef.current.onerror = (error) => {
      console.error('Socket error:', error);
      setError('Failed to connect Socket for voice communication.');
    };

    socketRef.current.onmessage = (event) => {
      try {
        const message = JSON.parse(event.data);

        if (message.type === 'conversation.item.created') {
          if (message?.item?.content?.[0]?.transcript) {
            setVoiceMessage(
              (prev) => prev + message.item.content[0].transcript,
            );
          }
        }
      } catch (error) {
        console.error('Error processing message:', error);
        setError('Error while processing voice message.');
      }
    };

    socketRef.current.onclose = () => {
      console.log('Socket connection closed.');
      setError('Socket connection closed. Please try reconnecting.');
    };
  };

  useEffect(() => {
    connectWebSocket();
    return () => {
      if (socketRef.current) {
        socketRef.current.close();
      }
    };
  }, []);

  const startRecording = async () => {
    setError(null);
    setIsLoading(true);

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;

      mediaRecorder.start();
      setIsRecording(true);

      const audioChunks: BlobPart[] = [];

      mediaRecorder.ondataavailable = (event) => {
        audioChunks.push(event.data);
      };

      mediaRecorder.onstop = () => {
        const audioBlob = new Blob(audioChunks, { type: 'audio/webm' });
        sendVoiceData(audioBlob);
        setIsRecording(false);
      };
    } catch (error) {
      console.error('Error accessing microphone:', error);
      setError('Could not access your microphone.');
      setIsLoading(false);
    }
  };

  const stopRecording = () => {
    if (
      mediaRecorderRef.current &&
      mediaRecorderRef.current.state !== 'inactive'
    ) {
      mediaRecorderRef.current.stop();
    }
  };

  function blobToBase64(blob: Blob) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();

      reader.onloadend = () => {
        if (typeof reader.result === 'string') {
          resolve(reader.result?.split(',')[1]);
        }
      };

      reader.onerror = (error) => {
        reject(error);
      };

      reader.readAsDataURL(blob);
    });
  }

  const sendVoiceData = (audioBlob: Blob) => {
    if (socketRef.current && socketRef.current.readyState === WebSocket.OPEN) {
      blobToBase64(audioBlob)
        .then((base64) => {
          const event = {
            type: 'conversation.item.create',
            item: {
              type: 'message',
              role: 'user',
              content: [
                {
                  type: 'input_audio',
                  audio: base64,
                },
              ],
            },
          };
          socketRef.current?.send(JSON.stringify(event));
        })
        .catch((error) => {
          console.error('Error converting blob to base64:', error);
        });
    } else {
      setError('Socket is not connected. Please try again later.');
    }
    setIsLoading(false);
  };

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
      {isLoading && <CircularProgress sx={{ marginTop: 2 }} />}
      <Typography variant="body1">
        {voiceMessage ? `Bot: ${voiceMessage}` : 'Speak something...'}
      </Typography>
      <Button
        variant="contained"
        color={isRecording ? 'secondary' : 'primary'}
        onClick={isRecording ? stopRecording : startRecording}
        sx={{ marginTop: 3, marginBottom: 2 }}
      >
        {isRecording ? 'Stop Recording' : 'Start Recording'}
      </Button>
    </Box>
  );
};

export default RealtimeVoice;
