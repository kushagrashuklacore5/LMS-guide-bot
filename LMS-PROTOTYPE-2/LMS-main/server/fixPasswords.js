const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
require('dotenv').config();

const User = require('./models/User');

mongoose.connect(process.env.MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true
}).then(async () => {
  try {
    // Hash the correct password
    const correctPassword = '12345678';
    const hashedPassword = await bcrypt.hash(correctPassword, 10);
    
    console.log('Updating all users with password: 12345678');
    
    // Update all users to have the correct password
    const result = await User.updateMany(
      {},
      { password: hashedPassword }
    );
    
    console.log('Updated users:', result.modifiedCount);
    
    // Verify
    const users = await User.find();
    console.log('\nVerifying passwords...');
    for (const user of users) {
      const isMatch = await bcrypt.compare('12345678', user.password);
      console.log(user.email + ' (Role: ' + user.role + '):', isMatch ? '✅ OK' : '❌ FAIL');
    }
    
    console.log('\n✅ All passwords have been reset to: 12345678');
    
  } catch (err) {
    console.error('Error:', err.message);
  }
  process.exit(0);
}).catch(err => {
  console.error('Connection Error:', err.message);
  process.exit(1);
})
