(async () => {
  try {
    const loginRes = await fetch('http://localhost:5002/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'mentor@gmail.com', password: '12345678' })
    });
    const loginJson = await loginRes.json();
    if (!loginJson.token) {
      console.error('Login failed', loginJson);
      process.exit(1);
    }
    const token = loginJson.token;
    console.log('TOKEN:', token);

    const start = new Date().toISOString();
    const end = new Date(Date.now() + 30 * 60000).toISOString();

    const body = {
      courseId: 1,
      title: 'Automated Test Class',
      description: 'Created by automated test',
      scheduledStartTime: start,
      scheduledEndTime: end
    };

    const res = await fetch('http://localhost:5002/api/live-classes', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
      body: JSON.stringify(body)
    });

    const json = await res.json();
    console.log('SCHEDULE RESULT:', JSON.stringify(json, null, 2));
  } catch (err) {
    console.error('Error:', err);
    process.exit(1);
  }
})();
