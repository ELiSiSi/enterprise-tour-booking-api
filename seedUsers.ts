import mongoose from 'mongoose';
import dotenv from 'dotenv';
dotenv.config();

import User from './src/modules/users/user.model.js';

const DB = process.env.MONGO_URI || 'mongodb://localhost:27017/natours';

mongoose.connect(DB).then(() => console.log('DB connection successful!'));

const users = [
  {
    name: 'Normal User',
    email: 'user@test.com',
    password: 'password123',
    passwordConfirm: 'password123',
    role: 'user',
    active: true
  },
  {
    name: 'Admin User',
    email: 'admin@test.com',
    password: 'password123',
    passwordConfirm: 'password123',
    role: 'admin',
    active: true
  }
];

const importUsers = async () => {
  try {
    // Check if they already exist and delete them to avoid duplicates
    await User.deleteMany({ email: { $in: ['user@test.com', 'admin@test.com'] } });
    
    await User.create(users);
    console.log('✅ Users successfully created!');
  } catch (err) {
    console.log('❌ Error creating users:', err);
  }
  process.exit();
};

importUsers();
