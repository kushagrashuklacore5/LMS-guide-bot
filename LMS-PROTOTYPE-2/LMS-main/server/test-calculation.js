// Test the exact calculation that's happening in frontend
const expiresAt = '2026-05-06T06:46:23.695Z';
const serverTime = new Date().toISOString(); // Current server time
const currentTime = new Date(); // What frontend uses

console.log('🧪 Testing timer calculation...');
console.log('📅 Expires At:', expiresAt);
console.log('🕐 Current Time:', currentTime.toISOString());
console.log('🕐 Server Time:', serverTime);

const expiry = new Date(expiresAt);
const diff = expiry - currentTime;

console.log('📊 Raw diff (ms):', diff);
console.log('📊 Raw diff (hours):', diff / (1000 * 60 * 60));

const days = Math.floor(diff / (1000 * 60 * 60 * 24));
const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
const seconds = Math.floor((diff % (1000 * 60)) / 1000);

console.log('⏰ Final Result:');
console.log('   Days:', days);
console.log('   Hours:', hours);
console.log('   Minutes:', minutes);
console.log('   Seconds:', seconds);
console.log('   Text:', `${days}d ${hours}h ${minutes}m ${seconds}s left`);
