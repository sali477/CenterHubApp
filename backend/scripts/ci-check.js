import { generateToken } from '../src/utils/generateToken.js';
import stripe from '../src/config/stripe.js';
import getOpenAI from '../src/config/openai.js';

// Verify CI env defaults allow config modules to load without external services.
if (!process.env.JWT_SECRET) {
  throw new Error('JWT_SECRET must be set in CI');
}

generateToken('000000000000000000000000');

if (stripe !== null) {
  throw new Error('Stripe should be disabled when STRIPE_SECRET_KEY is empty');
}

const openai = await getOpenAI();
if (openai !== null) {
  throw new Error('OpenAI should be disabled when OPENAI_API_KEY is empty');
}

console.log('Backend CI check passed');
