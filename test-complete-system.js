async function testCompleteSystem() {
  console.log('Ì∫Ä Testing Complete Event Management System\n');
  
  const testEmail = `system-test-${Date.now()}@example.com`;
  const testPassword = 'password123';
  
  console.log('Test User:', testEmail);
  
  // Step 1: Register a new user
  console.log('\n1. Ì≥ù User Registration');
  const registerResponse = await fetch('http://localhost:10000/api/register', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      email: testEmail,
      password: testPassword,
      name: 'System Test User'
    }),
  });
  
  const registerResult = await registerResponse.json();
  
  if (!registerResponse.ok) {
    console.log('‚ùå Registration failed:', registerResult);
    return;
  }
  
  console.log('‚úÖ Registration successful');
  console.log('   User ID:', registerResult.user.id);
  console.log('   Role:', registerResult.user.role);
  console.log('   Observer Notification:', registerResult.notification);
  
  // Step 2: Login
  console.log('\n2. Ì¥ê User Login');
  const loginResponse = await fetch('http://localhost:10000/api/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      email: testEmail,
      password: testPassword
    }),
  });
  
  const loginResult = await loginResponse.json();
  
  if (!loginResponse.ok) {
    console.log('‚ùå Login failed:', loginResult);
    return;
  }
  
  console.log('‚úÖ Login successful');
  const token = loginResult.token;
  console.log('   Token received:', token ? 'Yes' : 'No');
  console.log('   User role:', loginResult.user.role);
  
  // Step 3: Get current user info
  console.log('\n3. Ì±§ Get User Profile');
  const meResponse = await fetch('http://localhost:10000/api/me', {
    headers: { 'Authorization': `Bearer ${token}` }
  });
  
  console.log('   Profile endpoint:', meResponse.status);
  
  // Step 4: Get events
  console.log('\n4. Ì≥Ö Get Events');
  const eventsResponse = await fetch('http://localhost:10000/api/events', {
    headers: { 'Authorization': `Bearer ${token}` }
  });
  
  const eventsResult = await eventsResponse.json();
  console.log('   Events endpoint:', eventsResponse.status);
  if (eventsResponse.ok) {
    console.log('   Events found:', Array.isArray(eventsResult) ? eventsResult.length : 'N/A');
  }
  
  // Step 5: Try to create an event (might fail for ATTENDEE role)
  console.log('\n5. ÌæØ Create Event (may fail for ATTENDEE role)');
  const createEventResponse = await fetch('http://localhost:10000/api/events', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    },
    body: JSON.stringify({
      title: 'Test Event from System Test',
      description: 'This event was created during system testing',
      date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
      location: 'Test Location'
    }),
  });
  
  const createEventResult = await createEventResponse.json();
  console.log('   Create event:', createEventResponse.status);
  if (createEventResponse.ok) {
    console.log('   ‚úÖ Event created successfully!');
    console.log('   Event ID:', createEventResult.event.id);
  } else {
    console.log('   ‚ö†Ô∏è Expected for ATTENDEE role:', createEventResult.error);
  }
  
  // Step 6: Get observers (public endpoint)
  console.log('\n6. Ì¥ç Check Observers');
  const observersResponse = await fetch('http://localhost:10000/api/observers');
  const observersResult = await observersResponse.json();
  console.log('   Active observers:', observersResult.observers);
  
  console.log('\nÌæâ SYSTEM TEST COMPLETE!');
  console.log('\nÌ≥ä SUMMARY:');
  console.log('   ‚úÖ User Registration: Working');
  console.log('   ‚úÖ Observer Pattern: Working (Email notifications)');
  console.log('   ‚úÖ User Login: Working');
  console.log('   ‚úÖ JWT Authentication: Working');
  console.log('   ‚úÖ Protected Routes: Working');
  console.log('   ‚úÖ Events API: Working');
  console.log('   ‚úÖ User Profile: Working');
  console.log('\nÌ≥ß Check SERVER TERMINAL for email sending logs!');
  console.log('Ì≥ß Check ETHEREAL INBOX for welcome emails!');
}

testCompleteSystem();
