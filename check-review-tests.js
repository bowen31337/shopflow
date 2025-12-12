const features = require('./feature_list.json');

const failing = features.filter(f => !f.passes);

console.log('=== REVIEW-RELATED FAILING TESTS ===');
const reviewTests = failing.filter(f => f.description.toLowerCase().includes('review') || f.description.toLowerCase().includes('rating'));

reviewTests.forEach((f, i) => {
  console.log(`${i+1}. ${f.description}`);
  console.log(`   Steps: ${f.steps.length}`);
  console.log('');
});