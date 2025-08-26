import mongoose from 'mongoose';

export const connectDB = async () => {
  try {
    await mongoose.connect(process.env.VITE_MONGODB_URI || process.env.MONGODB_URI || '', {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    } as any);
    console.log('✅ Connected to MongoDB');
  } catch (error) {
    console.error('❌ Error connecting to MongoDB:', error);
    process.exit(1);
  }
};
