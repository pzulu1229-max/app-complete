async function testActualRoutes() {
  console.log('í¾¯ Testing Routes Defined in final-server.js\n');
  
  const testCases = [
    { method: 'GET', path: '/' },
    { method: 'POST', path: '/api/register' },
  ];

  for (const testCase of testCases) {
    try {
      const options = {
        method: testCase.method,
      };
      
      if (testCase.method === 'POST') {
        options.headers = { 'Content-Type': 'application/json' };
        options.body = JSON.stringify({
          email: `test${Date.now()}@example.com`,
          password: 'password123',
          name: 'Test User'
        });
      }
      
      const response = await fetch(`http://localhost:10000${testCase.path}`, options);
      
      let responseText = '';
      try {
        responseText = await response.text();
        // Try to parse as JSON
        try {
          const jsonData = JSON.parse(responseText);
          responseText = JSON.stringify(jsonData);
        } catch {
          responseText = responseText.substring(0, 200);
        }
      } catch {
        responseText = 'Could not read response';
      }
      
      console.log(`${testCase.method.padEnd(6)} ${testCase.path.padEnd(25)} -> ${response.status}`);
      if (responseText) {
        console.log(`       Response: ${responseText}`);
      }
      
      if (testCase.method === 'POST' && testCase.path === '/api/register' && response.ok) {
        console.log('       í³§ Check SERVER TERMINAL for email sending logs!');
      }
      
    } catch (error) {
      console.log(`${testCase.method.padEnd(6)} ${testCase.path.padEnd(25)} -> ERROR: ${error.message}`);
    }
    
    console.log(''); // Empty line for readability
  }
}

testActualRoutes();
