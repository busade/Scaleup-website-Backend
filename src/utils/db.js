import mongoose from 'mongoose';
import logger from './logger.js';

const connectDB = async () => {
  const uri = process.env.MONGO_URI;

  try {
    await mongoose.connect(uri);
    logger.info(`Connected to MongoDB database: ${mongoose.connection.name}`);
  } catch (err) {
    logger.error('MongoDB connection error:', err);
    process.exit(1);
  }
};

export default connectDB;
