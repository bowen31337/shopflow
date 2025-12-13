const features = require('./feature_list.json');

const failing = features.filter(f => !f.passes);

console.log('=== HIGHEST PRIORITY FAILING TESTS ===');
console.log(`Total failing: ${failing.length}`);
console.log('');

console.log('Top 15 failing tests:');
failing.slice(0, 15).forEach((f, i) => {
  console.log(`${i+1}. ${f.description}`);
});