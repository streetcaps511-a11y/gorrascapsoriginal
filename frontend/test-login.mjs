import fs from 'fs';
async function run() {
  try {
    const loginRes = await fetch('http://localhost:3000/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ correo: "duvann1991@gmail.com", clave: "AdminGM2024!Secure" })
    });
    const loginData = await loginRes.json();
    const token = loginData.token || (loginData.data && loginData.data.token);

    const rolesRes = await fetch('http://localhost:3000/api/roles', {
      method: 'GET',
      headers: { 
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      }
    });

    const rolesData = await rolesRes.json().catch(() => null);
    fs.writeFileSync('test-login-output.json', JSON.stringify({
      status: rolesRes.status,
      data: rolesData
    }, null, 2));

  } catch (err) {
    console.error(err);
  }
}
run();
