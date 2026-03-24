(async () => {
  try {
    const base = 'http://localhost:5002';
    const loginRes = await fetch(base + '/api/auth/login', {
      method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ email: 'mentor@gmail.com', password: '12345678' })
    });
    const loginJson = await loginRes.json();
    if (!loginJson.token) { console.error('Login failed', loginJson); process.exit(1); }
    const token = loginJson.token;
    console.log('TOKEN:', token.slice(0,20) + '...');

    const start = new Date().toISOString();
    const end = new Date(Date.now() + 30*60000).toISOString();
    const scheduleRes = await fetch(base + '/api/live-classes', {
      method: 'POST', headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
      body: JSON.stringify({ courseId: 1, title: 'E2E Test', description: 'e2e', scheduledStartTime: start, scheduledEndTime: end })
    });
    const schedJson = await scheduleRes.json();
    console.log('Scheduled:', JSON.stringify(schedJson, null, 2));

    const liveId = schedJson.liveClass && (schedJson.liveClass.id || schedJson.liveClass._id);
    if (!liveId) { console.error('No live id'); process.exit(1); }

    // Start
    const startRes = await fetch(`${base}/api/live-classes/${liveId}/start`, {
      method: 'PUT', headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
      body: JSON.stringify({ actualStartTime: new Date().toISOString(), status: 'active' })
    });
    const startJson = await startRes.json();
    console.log('Start:', JSON.stringify(startJson, null, 2));

    // Get course classes
    const listRes = await fetch(`${base}/api/live-classes/course/1`, { headers: { Authorization: `Bearer ${token}` } });
    const listJson = await listRes.json();
    console.log('List after start:', JSON.stringify(listJson, null, 2));

    // Delete
    const delRes = await fetch(`${base}/api/live-classes/${liveId}`, { method: 'DELETE', headers: { Authorization: `Bearer ${token}` } });
    const delJson = await delRes.json();
    console.log('Delete:', JSON.stringify(delJson, null, 2));

    const listAfterDel = await fetch(`${base}/api/live-classes/course/1`, { headers: { Authorization: `Bearer ${token}` } });
    console.log('Final list:', JSON.stringify(await listAfterDel.json(), null, 2));
  } catch (err) {
    console.error(err);
  }
})();
