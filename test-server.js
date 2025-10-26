async function testServerEndpoints() {
  try {
    console.log('� Testing Running Server on port 10000\n');
    
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
    console.log('   Response:', JSON.stringify(signupResult, null, 2));
    
    if (signupResponse.ok) {
      console.log('   ✅ Registration successful!');
      console.log('   � Check your SERVER TERMINAL for email sending logs...');
    } else {
      console.log('   ❌ Registration failed');
    }
    
    // Test 3: Test login if registration was successful
    if (signupResponse.ok) {
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
        console.log('   ✅ Login successful!');
        console.log('   Token received:', loginResult.token ? 'Yes' : 'No');
        console.log('   User role:', loginResult.role);
      } else {
        console.log('   ❌ Login failed:', loginResult);
      }
    }
    
    console.log('\n� Server testing completed!');
    
  } catch (error) {
    console.error('❌ Test failed:', error.message);
    console.log('� Make sure your server is running on port 10000');
  }
}

testServerEndpoints();
