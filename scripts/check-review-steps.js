const features = require('./feature_list.json');

const failing = features.filter(f => !f.passes);

console.log('=== REVIEW TEST DETAILS ===');
const reviewTests = failing.filter(f => f.description.toLowerCase().includes('review') && (f.description.toLowerCase().includes('edit') || f.description.toLowerCase().includes('delete')));

reviewTests.forEach((f, i) => {
  console.log(`${i+1}. ${f.description}`);
  console.log('   Steps:');
  f.steps.forEach((step, j) => {
    console.log(`   ${j+1}. ${step}`);
  });
  console.log('');
});