import axios from 'axios';

const OLLAMA_API = 'http://localhost:11434/api';

export const askOllama = async (prompt, model = 'llama2') => {
  try {
    const response = await axios.post(`${OLLAMA_API}/generate`, {
      model,
      prompt,
      stream: false,
    });
    return response.data;
  } catch (error) {
    console.error('Ollama API Error:', error);
    throw new Error(error.response?.data?.error || 'Failed to fetch from Ollama.');
  }
};