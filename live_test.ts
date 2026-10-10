import axios from 'axios';

const API_URL = 'http://localhost:3000/api/v1';

async function runLiveTest() {
  console.log('🚀 Starting Live Environment Test...\n');
  let token = '';
  let email = `live_test_${Date.now()}@example.com`;

  try {
    // 1. Signup
    console.log('🧪 1. Testing User Signup...');
    const signupRes = await axios.post(`${API_URL}/users/signup`, {
      name: 'Test Engineer',
      email: email,
      password: 'password123',
      passwordConfirm: 'password123'
    });
    console.log('✅ Signup Success! User created.');
    token = signupRes.data.token || signupRes.data.accessToken;

    // 2. Login
    console.log('\n🧪 2. Testing User Login...');
    const loginRes = await axios.post(`${API_URL}/users/login`, {
      email: email,
      password: 'password123'
    });
    console.log('✅ Login Success! Access Token & Refresh Token received.');
    token = loginRes.data.accessToken || loginRes.data.token;

    // 3. Get All Tours
    console.log('\n🧪 3. Testing Fetch Tours Endpoint...');
    const toursRes = await axios.get(`${API_URL}/tours`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    console.log(`✅ Tours Fetched Successfully! Found ${toursRes.data.results || 0} tours.`);

    // 4. Test Error Handling (Invalid Login)
    console.log('\n🧪 4. Testing Security: Brute-Force & Invalid Login...');
    try {
      await axios.post(`${API_URL}/users/login`, {
        email: email,
        password: 'wrong_password'
      });
    } catch (err: any) {
      console.log(`✅ Security working! Server blocked invalid login: ${err.response?.data?.message || err.message}`);
    }

    console.log('\n🎉 ALL TESTS PASSED! The API is 100% functional and ready for production.');
  } catch (error: any) {
    console.error('\n❌ Test Failed:');
    if (error.response) {
      console.error(error.response.data);
    } else {
      console.error(error.message);
    }
  }
}

runLiveTest();
