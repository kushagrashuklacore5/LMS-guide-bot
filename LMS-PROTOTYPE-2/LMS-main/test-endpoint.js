/**
 * Direct endpoint test
 */

const token = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjIsInJvbGUiOiJtZW50b3IiLCJuYW1lIjoiTWVudG9yIFVzZXIiLCJlbWFpbCI6Im1lbnRvckBnbWFpbC5jb20iLCJpYXQiOjE3Njk2MjMzMjIsImV4cCI6MTc3MDIyODEyMn0.v9Pg1H4dsEHh-rfp8SWEBHcTwM-2VXBSKXqYzFK3b08';

fetch('http://localhost:5002/api/classrooms/mentor/me', {
  method: 'GET',
  headers: {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json'
  }
})
  .then(r => r.json())
  .then(data => {
    console.log('Response:', JSON.stringify(data, null, 2));
    process.exit(0);
  })
  .catch(err => {
    console.error('Error:', err);
    process.exit(1);
  });
