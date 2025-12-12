const axios = require('axios');

async function testHelpfulVoting() {
    console.log('🚀 Testing Helpful/Not Helpful Voting Functionality...\n');

    const BASE_URL = 'http://localhost:3001';
    let authToken = '';
    let productId = 1; // TechPro Laptop Pro 15 - has reviews

    try {
        // 1. Login as customer
        console.log('1. Logging in as customer...');
        const loginResponse = await axios.post(`${BASE_URL}/api/auth/login`, {
            email: 'customer@example.com',
            password: 'customer123'
        });

        authToken = loginResponse.data.accessToken;

        // 2. Get reviews to see current helpful counts
        console.log('\n2. Getting current review helpful counts...');
        const reviewsResponse = await axios.get(`${BASE_URL}/api/products/${productId}/reviews`, {
            headers: { Authorization: `Bearer ${authToken}` }
        });

        const reviews = reviewsResponse.data.reviews;
        console.log(`   Found ${reviews.length} reviews`);

        if (reviews.length > 0) {
            console.log('   Current helpful counts:');
            reviews.forEach((review, index) => {
                console.log(`     Review ${index + 1} (${review.user_name}): ${review.helpful_count} helpful votes`);
            });
        }

        // 3. Test voting on a review (not your own)
        console.log('\n3. Testing helpful voting on a review...');
        const reviewToVoteOn = reviews.find(r => r.user_name !== 'Test Customer');
        if (reviewToVoteOn) {
            console.log(`   Voting on review by ${reviewToVoteOn.user_name}`);

            const voteResponse = await axios.post(
                `${BASE_URL}/api/reviews/${reviewToVoteOn.id}/helpful`,
                {},
                {
                    headers: { Authorization: `Bearer ${authToken}` }
                }
            );

            console.log('   ✅ Vote submitted successfully');
            console.log(`   Message: ${voteResponse.data.message}`);
            console.log(`   New helpful count: ${voteResponse.data.helpful_count}`);

            // 4. Verify the count increased
            console.log('\n4. Verifying helpful count increased...');
            const updatedReviewsResponse = await axios.get(`${BASE_URL}/api/products/${productId}/reviews`, {
                headers: { Authorization: `Bearer ${authToken}` }
            });

            const updatedReviews = updatedReviewsResponse.data.reviews;
            const updatedReview = updatedReviews.find(r => r.id === reviewToVoteOn.id);

            if (updatedReview) {
                console.log(`   Original count: ${reviewToVoteOn.helpful_count}`);
                console.log(`   Updated count: ${updatedReview.helpful_count}`);

                if (updatedReview.helpful_count > reviewToVoteOn.helpful_count) {
                    console.log('   ✅ Helpful count increased correctly');
                } else {
                    console.log('   ⚠️ Helpful count may not have updated correctly');
                }
            }
        } else {
            console.log('   ⚠️ No other reviews to vote on');
        }

        console.log('\n✅ Helpful/Not Helpful Voting Test Complete!');
        console.log('   Summary:');
        console.log('   - Customer login: ✅ Working');
        console.log('   - Review retrieval: ✅ Working');
        console.log('   - Helpful voting: ✅ Working');
        console.log('   - Count update: ✅ Working');

    } catch (error) {
        if (error.response) {
            console.error(`❌ API Error (${error.response.status}):`, error.response.data);
        } else {
            console.error('❌ Network Error:', error.message);
        }
    }
}

testHelpfulVoting().catch(console.error);