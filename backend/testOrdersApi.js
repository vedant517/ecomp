import https from 'https';
import http from 'http';

const TOKEN = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjY5ZDc5NjA3YjkwZjMzN2E5MDU3NGY1MiIsInJvbGUiOiJhZG1pbiIsImlhdCI6MTc3NTk5NjE0NywiZXhwIjoxNzc2NjAwOTQ3fQ.5dwg-IHO37Bi1xDZREXR51NsDVcz4v6gv0wGFYZcBW0';

const options = {
  hostname: 'localhost',
  port: 5000,
  path: '/api/orders',
  method: 'GET',
  headers: {
    'Authorization': `Bearer ${TOKEN}`,
    'Content-Type': 'application/json'
  }
};

const req = http.request(options, (res) => {
  let data = '';
  res.on('data', chunk => data += chunk);
  res.on('end', () => {
    console.log('Status:', res.statusCode);
    const parsed = JSON.parse(data);
    if (parsed.success) {
      console.log('✅ SUCCESS - Orders count:', parsed.data?.length);
      console.log('Sample order:', JSON.stringify(parsed.data?.[0]?.orderId));
    } else {
      console.log('❌ FAILED:', parsed.message);
    }
  });
});

req.on('error', e => console.error('Request error:', e.message));
req.end();
