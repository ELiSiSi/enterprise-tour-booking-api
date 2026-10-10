import mongoose from 'mongoose';
import dotenv from 'dotenv';
import User from './src/modules/users/user.model.js';

dotenv.config();

const makeAdmin = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('DB Connection Successful!');

    const user = await User.findOneAndUpdate(
      { email: 'admin2@test.com' },
      { role: 'admin' },
      { new: true }
    );

    console.log('Updated User:', user?.email, user?.role);
    process.exit(0);
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
};

makeAdmin();
