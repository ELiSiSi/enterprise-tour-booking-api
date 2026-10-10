import mongoose from 'mongoose';
import dotenv from 'dotenv';
dotenv.config();

import Tour from './src/modules/tours/tour.model.js';

const DB = process.env.MONGO_URI || 'mongodb://localhost:27017/natours';

mongoose.connect(DB).then(() => console.log('DB connection successful!'));

const tours = [
  {
    name: 'The Forest Hiker',
    duration: 5,
    maxGroupSize: 25,
    difficulty: 'easy',
    price: 397,
    summary: 'Breathtaking hike through the Canadian Banff National Park',
    description: 'Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.',
    imageCover: 'tour-1-cover.jpg',
    startLocation: { type: 'Point', coordinates: [-115.570154, 51.178456], address: 'Banff, Canada' }
  },
  {
    name: 'The Sea Explorer',
    duration: 7,
    maxGroupSize: 15,
    difficulty: 'medium',
    price: 497,
    summary: 'Exploring the jaw-dropping US east coast by foot and by boat',
    description: 'Consectetur adipisicing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.',
    imageCover: 'tour-2-cover.jpg',
    startLocation: { type: 'Point', coordinates: [-80.128473, 25.781842], address: 'Miami, USA' }
  },
  {
    name: 'The Snow Adventurer',
    duration: 4,
    maxGroupSize: 10,
    difficulty: 'difficult',
    price: 997,
    summary: 'Exciting adventure in the snow with snowboarding and skiing',
    description: 'Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam.',
    imageCover: 'tour-3-cover.jpg',
    startLocation: { type: 'Point', coordinates: [-111.828826, 40.643323], address: 'Aspen, USA' }
  },
  {
    name: 'The City Wanderer',
    duration: 9,
    maxGroupSize: 20,
    difficulty: 'easy',
    price: 1197,
    summary: 'Living the life of Wanderlust in the US biggest cities',
    description: 'Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.',
    imageCover: 'tour-4-cover.jpg',
    startLocation: { type: 'Point', coordinates: [-74.005941, 40.712784], address: 'New York, USA' }
  },
  {
    name: 'The Star Gazer',
    duration: 14,
    maxGroupSize: 8,
    difficulty: 'medium',
    price: 2997,
    summary: 'The most remote and stunningly beautiful places for seeing the night sky',
    description: 'Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur.',
    imageCover: 'tour-5-cover.jpg',
    startLocation: { type: 'Point', coordinates: [-112.074037, 33.448377], address: 'Phoenix, USA' }
  },
  {
    name: 'The Northern Lights',
    duration: 3,
    maxGroupSize: 12,
    difficulty: 'easy',
    price: 1497,
    summary: 'Enjoy the Northern Lights in one of the best places in the world',
    description: 'Voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident.',
    imageCover: 'tour-6-cover.jpg',
    startLocation: { type: 'Point', coordinates: [18.955323, 69.649205], address: 'Tromso, Norway' }
  }
];

const importData = async () => {
  try {
    await Tour.deleteMany(); // Clear old data to avoid duplicates
    await Tour.create(tours);
    console.log('✅ 6 Dummy Tours successfully loaded into the database!');
  } catch (err) {
    console.log('❌ Error loading data:', err);
  }
  process.exit();
};

importData();
