const features = require('./feature_list.json');

const passing = features.filter(f => f.passes);
const failing = features.filter(f => !f.passes);

console.log('=== TEST STATUS SUMMARY ===');
console.log(`Total tests: ${features.length}`);
console.log(`Passing: ${passing.length} (${(passing.length/features.length*100).toFixed(1)}%)`);
console.log(`Failing: ${failing.length} (${(failing.length/features.length*100).toFixed(1)}%)`);
console.log('');