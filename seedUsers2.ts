import axios from 'axios';

const API_URL = 'http://localhost:3000/api/v1';

async function seed() {
  try {
    console.log('Seeding normal user...');
    await axios.post(`${API_URL}/users/signup`, {
      name: 'Normal User',
      email: 'user2@test.com',
      password: 'password123',
      passwordConfirm: 'password123',
      role: 'user'
    });
    console.log('✅ Normal user created (user2@test.com)');

    console.log('Seeding admin user...');
    await axios.post(`${API_URL}/users/signup`, {
      name: 'Admin User',
      email: 'admin2@test.com',
      password: 'password123',
      passwordConfirm: 'password123',
      role: 'admin'
    });
    console.log('✅ Admin user created (admin2@test.com)');
    
  } catch (err: any) {
    console.error('Error seeding:', err.response?.data || err.message);
  }
}

seed();
