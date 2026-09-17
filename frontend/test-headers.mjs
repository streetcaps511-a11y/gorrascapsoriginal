import fs from 'fs';

async function run() {
  const loginRes = await fetch('http://localhost:3000/api/auth/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ correo: "duvann1991@gmail.com", clave: "AdminGM2024!Secure" })
  });
  const { token } = await loginRes.json();
  
  const headersToTest = [
    { 'authorization': `Bearer ${token}` },
    { 'authorization': token },
    { 'x-token': token },
    { 'x-access-token': token },
    { 'x-auth-token': token }
  ];

  const results = {};
  for (const headers of headersToTest) {
    const res = await fetch('http://localhost:3000/api/roles', {
      method: 'GET',
      headers: { 'Content-Type': 'application/json', ...headers }
    });
    const key = Object.keys(headers)[0] + ': ' + (headers[Object.keys(headers)[0]].startsWith('Bearer') ? 'Bearer...' : 'token...');
    results[key] = { status: res.status, body: await res.json().catch(()=>null) };
  }
  
  fs.writeFileSync('test-headers.json', JSON.stringify(results, null, 2));
}
run();
