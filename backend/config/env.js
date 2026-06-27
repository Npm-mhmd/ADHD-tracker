require('dotenv').config();

const isProduction = process.env.NODE_ENV === 'production';

const REQUIRED_SECRET_MIN_LENGTH = 16;

const readSecret = (name) => {
  const value = process.env[name];

  if (!value || value.trim().length === 0) {
    throw new Error(
      `Missing required environment variable "${name}". ` +
        'Refer to .env.example and set it before starting the server.'
    );
  }

  if (value.length < REQUIRED_SECRET_MIN_LENGTH) {
    throw new Error(
      `Environment variable "${name}" is too short. ` +
        `Use at least ${REQUIRED_SECRET_MIN_LENGTH} characters for security.`
    );
  }

  return value;
};

const readMongoUri = () => {
  const value = process.env.MONGODB_URI;

  if (value && value.trim().length > 0) {
    return value;
  }

  if (isProduction) {
    throw new Error('Missing required environment variable "MONGODB_URI" in production.');
  }

  return 'mongodb://127.0.0.1:27017/adhd-monitoring';
};

const parseOrigins = () => {
  const raw = process.env.CLIENT_ORIGIN;

  if (!raw || raw.trim().length === 0) {
    return isProduction ? [] : ['http://localhost:3000', 'http://localhost:5173'];
  }

  return raw
    .split(',')
    .map((origin) => origin.trim())
    .filter(Boolean);
};

const config = {
  isProduction,
  nodeEnv: process.env.NODE_ENV || 'development',
  port: Number.parseInt(process.env.PORT, 10) || 5000,
  mongoUri: readMongoUri(),
  jwtSecret: readSecret('JWT_SECRET'),
  jwtExpiresIn: process.env.JWT_EXPIRES_IN || '7d',
  encryptionKey: readSecret('ENCRYPTION_KEY'),
  clientOrigins: parseOrigins(),
};

module.exports = config;
