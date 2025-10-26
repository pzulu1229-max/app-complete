import dotenv from 'dotenv';
dotenv.config();

async function testServerEndpoints() {
  try {
    console.log('Ì∑™ Testing Running Server on port 10000\n');
    
    // Test 1: Check if server is responding
    console.log('1. Testing server health...');
    const healthResponse = await fetch('http://localhost:10000/');
    console.log('   Status:', healthResponse.status);
    console.log('   OK:', healthResponse.ok);
    
    // Test 2: Test user registration with email
    const testEmail = `test${Date.now()}@example.com`;
    console.log('\n2. Testing user registration...');
    console.log('   Test email:', testEmail);
    
    const signupResponse = await fetch('http://localhost:10000/auth/signup', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email: testEmail,
        password: 'password123'
      }),
    });
    
    const signupResult = await signupResponse.json();
    console.log('   Status:', signupResponse.status);
    console.log('   Response:', signupResult);
    
    if (signupResponse.ok) {
      console.log('   ‚úÖ Registration successful!');
      console.log('   Ì≥ß Check server logs for email sending...');
    }
    
    // Test 3: Test login
    console.log('\n3. Testing user login...');
    const loginResponse = await fetch('http://localhost:10000/auth/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email: testEmail,
        password: 'password123'
      }),
    });
    
    const loginResult = await loginResponse.json();
    console.log('   Status:', loginResponse.status);
    
    if (loginResponse.ok) {
      console.log('   ‚úÖ Login successful!');
      console.log('   Token:', loginResult.token ? 'Received' : 'Missing');
      console.log('   Role:', loginResult.role);
      
      // Test 4: Test protected endpoint with the token
      console.log('\n4. Testing protected endpoint...');
      const eventsResponse = await fetch('http://localhost:10000/events', {
        headers: {
          'Authorization': `Bearer ${loginResult.token}`
        }
      });
      
      console.log('   Events endpoint status:', eventsResponse.status);
    } else {
      console.log('   ‚ùå Login failed:', loginResult);
    }
    
    console.log('\nÌæâ Server testing completed!');
    
  } catch (error) {
    console.error('‚ùå Test failed:', error.message);
    console.log('Ì≤° Make sure your server is running on port 10000');
  }
}

testServerEndpoints();
