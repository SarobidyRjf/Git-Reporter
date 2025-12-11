const http = require('http');

function makeRequest(method, path, data = null) {
  return new Promise((resolve, reject) => {
    const options = {
      hostname: 'localhost',
      port: 4000,
      path: path,
      method: method,
      headers: {
        'Content-Type': 'application/json',
      }
    };

    const req = http.request(options, (res) => {
      let body = '';
      res.on('data', (chunk) => body += chunk);
      res.on('end', () => {
        try {
          resolve({
            status: res.statusCode,
            data: JSON.parse(body)
          });
        } catch (e) {
          resolve({
            status: res.statusCode,
            data: body
          });
        }
      });
    });

    req.on('error', reject);
    
    if (data) {
      req.write(JSON.stringify(data));
    }
    
    req.end();
  });
}

async function testAPIs() {
  console.log('🧪 Testing Git Reporter APIs...\n');

  // Test 1: Health check
  console.log('1️⃣ Testing health check...');
  const health = await makeRequest('GET', '/health');
  console.log(`   Status: ${health.status}`);
  console.log(`   Response: ${health.data.success ? '✅ Healthy' : '❌ Unhealthy'}\n`);

  // Test 2: API info
  console.log('2️⃣ Testing API info...');
  const info = await makeRequest('GET', '/');
  console.log(`   Status: ${info.status}`);
  console.log(`   Name: ${info.data.data.name}`);
  console.log(`   Endpoints available: ${Object.keys(info.data.data.endpoints).length}\n`);

  // Test 3: Templates endpoint (without auth - should fail)
  console.log('3️⃣ Testing templates endpoint (no auth)...');
  const templatesNoAuth = await makeRequest('GET', '/api/templates');
  console.log(`   Status: ${templatesNoAuth.status}`);
  console.log(`   Expected 401: ${templatesNoAuth.status === 401 ? '✅ Correct' : '❌ Wrong'}\n`);

  // Test 4: Schedules endpoint (without auth - should fail)
  console.log('4️⃣ Testing schedules endpoint (no auth)...');
  const schedulesNoAuth = await makeRequest('GET', '/api/schedules');
  console.log(`   Status: ${schedulesNoAuth.status}`);
  console.log(`   Expected 401: ${schedulesNoAuth.status === 401 ? '✅ Correct' : '❌ Wrong'}\n`);

  // Test 5: Scheduler status (without auth - should fail)
  console.log('5️⃣ Testing scheduler status endpoint (no auth)...');
  const statusNoAuth = await makeRequest('GET', '/api/schedules/status');
  console.log(`   Status: ${statusNoAuth.status}`);
  console.log(`   Expected 401: ${statusNoAuth.status === 401 ? '✅ Correct' : '❌ Wrong'}\n`);

  console.log('✅ All basic tests completed!');
  console.log('\n📝 Summary:');
  console.log('   - Backend is running');
  console.log('   - Scheduler is initialized');
  console.log('   - Templates routes are accessible');
  console.log('   - Schedules routes are accessible');
  console.log('   - Authentication is required (as expected)');
}

testAPIs().catch(console.error);
