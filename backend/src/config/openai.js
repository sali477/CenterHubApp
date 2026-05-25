let openaiClient = null;

const isConfigured = () => {
  const key = process.env.OPENAI_API_KEY?.trim();
  if (!key) return false;
  // Ignore placeholder values from .env.example
  if (key.startsWith('your_')) return false;
  return true;
};

export const getOpenAI = async () => {
  if (!isConfigured()) return null;

  if (!openaiClient) {
    const { default: OpenAI } = await import('openai');
    openaiClient = new OpenAI({ apiKey: process.env.OPENAI_API_KEY.trim() });
  }

  return openaiClient;
};

export const requireOpenAI = async () => {
  const client = await getOpenAI();
  if (!client) {
    const error = new Error(
      'OpenAI is not configured. Set OPENAI_API_KEY in your .env file.'
    );
    error.statusCode = 503;
    throw error;
  }
  return client;
};

export default getOpenAI;
