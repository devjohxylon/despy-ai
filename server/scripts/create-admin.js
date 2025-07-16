const fetch = require('node-fetch');

const createAdmin = async () => {
  try {
    const response = await fetch('http://localhost:3001/api/admin/setup', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        username: 'admin',
        password: 'admin123' // You should change this password immediately after logging in
      }),
    });

    const data = await response.json();
    console.log('Response:', data);
  } catch (error) {
    console.error('Error:', error);
  }
};

createAdmin(); 