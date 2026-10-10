import mongoose from 'mongoose';
import dotenv from 'dotenv';
dotenv.config();

import User from './src/modules/users/user.model.js';

const DB = process.env.MONGO_URI || 'mongodb://localhost:27017/natours';

mongoose.connect(DB).then(async () => {
  const users = await User.find({ email: { $in: ['user@test.com', 'admin@test.com'] } }).select('+password');
  console.log(users.map(u => ({ email: u.email, pass: u.password, active: u.is_active })));
  process.exit();
});
