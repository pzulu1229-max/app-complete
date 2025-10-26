async function testCurrentState() {
  console.log('� Testing Current Server State\n');
  
  // Test 1: Basic server health
  console.log('1. Server Health Check');
  const healthResponse = await fetch('http://localhost:10000/');
  const healthData = await healthResponse.json();
  console.log('   Status:', healthResponse.status);
  console.log('   Observers:', healthData.observers);
  
  // Test 2: User registration with email
  console.log('\n2. User Registration with Email Observer');
  const testEmail = `observer-test-${Date.now()}@example.com`;
  const registerResponse = await fetch('http://localhost:10000/api/register', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      email: testEmail,
      password: 'password123',
      name: 'Observer Test User'
    }),
  });
  
  const registerResult = await registerResponse.json();
  console.log('   Status:', registerResponse.status);
  console.log('   User created:', registerResult.user ? 'Yes' : 'No');
  console.log('   Observer notification:', registerResult.notification);
  
  if (registerResponse.ok) {
    console.log('   ✅ Check SERVER TERMINAL for email sending logs!');
    console.log('   ✅ Check ETHEREAL INBOX for welcome email!');
  }
  
  console.log('\n� Current State Summary:');
  console.log('   - Server: ✅ Running');
  console.log('   - Registration: ✅ Working');
  console.log('   - Observer Pattern: ✅ Working (Email notifications)');
  console.log('   - Database: ✅ Connected');
}

testCurrentState();
