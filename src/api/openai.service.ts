import { API } from './axios';

export const sendMessageToOpenAI = async (message: string) => {
  try {
    const response = await API.post('/chat/completions', {
      model: 'gpt-3.5-turbo',
      messages: [{ role: 'user', content: message }],
      max_tokens: 100,
    });

    return response.data.choices[0].message.content;
  } catch (error) {
    console.error('OpenAI Error:', error);
    return 'Sorry, there was an error processing your request. Try again later';
  }
};
