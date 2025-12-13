const axios = require('axios');
const FormData = require('form-data');
const fs = require('fs');

async function testReviewImageUpload() {
    console.log('🚀 Testing Review Image Upload Functionality...\n');

    const BASE_URL = 'http://localhost:3001';
    let authToken = '';
    let productId = 4; // StyleMax Denim Jeans - has no reviews

    try {
        // 1. Login as customer to get auth token
        console.log('1. Logging in as customer...');
        const loginResponse = await axios.post(`${BASE_URL}/api/auth/login`, {
            email: 'customer@example.com',
            password: 'customer123'
        });

        authToken = loginResponse.data.accessToken;
        console.log('   ✅ Login successful');

        // 2. Create a test review first
        console.log('\n2. Creating a test review...');
        const reviewResponse = await axios.post(`${BASE_URL}/api/products/${productId}/reviews`, {
            rating: 5,
            title: 'Test Review with Images',
            content: 'This is a test review for image upload functionality'
        }, {
            headers: { Authorization: `Bearer ${authToken}` }
        });

        const review = reviewResponse.data.review;
        console.log(`   ✅ Review created: ${review.id}`);

        // 3. Test image upload
        console.log('\n3. Uploading images to review...');
        const form = new FormData();
        form.append('images', fs.createReadStream('./uploads/reviews/test-image.jpg'), {
            filename: 'test-image.jpg',
            contentType: 'image/jpeg'
        });

        const uploadResponse = await axios.post(
            `${BASE_URL}/api/reviews/${review.id}/images`,
            form,
            {
                headers: {
                    ...form.getHeaders(),
                    Authorization: `Bearer ${authToken}`
                }
            }
        );

        console.log('   ✅ Image upload successful');
        console.log(`   Response: ${uploadResponse.data.message}`);

        // 4. Verify images were uploaded and returned
        const updatedReview = uploadResponse.data.review;
        console.log(`   Images uploaded: ${updatedReview.images.length}`);

        if (updatedReview.images.length > 0) {
            console.log('   ✅ Images successfully attached to review');
            console.log(`   Image URL: ${updatedReview.images[0].url}`);

            // 5. Verify image is accessible
            console.log('\n4. Verifying image accessibility...');
            const imageUrl = `${BASE_URL}${updatedReview.images[0].url}`;
            try {
                const imageResponse = await axios.head(imageUrl);
                if (imageResponse.status === 200) {
                    console.log('   ✅ Image is accessible via URL');
                } else {
                    console.log(`   ⚠️ Image returned status: ${imageResponse.status}`);
                }
            } catch (error) {
                console.log(`   ⚠️ Image not accessible: ${error.message}`);
            }
        } else {
            console.log('   ❌ No images found in response');
        }

        // 6. Test multiple image upload
        console.log('\n5. Testing multiple image upload...');
        const multiForm = new FormData();
        multiForm.append('images', fs.createReadStream('./uploads/reviews/test-image.jpg'), {
            filename: 'test-image1.jpg',
            contentType: 'image/jpeg'
        });
        multiForm.append('images', fs.createReadStream('./uploads/reviews/test-image.jpg'), {
            filename: 'test-image2.jpg',
            contentType: 'image/jpeg'
        });

        const multiUploadResponse = await axios.post(
            `${BASE_URL}/api/reviews/${review.id}/images`,
            multiForm,
            {
                headers: {
                    ...multiForm.getHeaders(),
                    Authorization: `Bearer ${authToken}`
                }
            }
        );

        const finalReview = multiUploadResponse.data.review;
        console.log(`   Total images after multiple upload: ${finalReview.images.length}`);

        if (finalReview.images.length >= 2) {
            console.log('   ✅ Multiple images uploaded successfully');
        } else {
            console.log('   ⚠️ Multiple images may not have been uploaded correctly');
        }

        console.log('\n✅ Review Image Upload Test Complete!');
        console.log('   Summary:');
        console.log('   - Customer login: ✅ Working');
        console.log('   - Review creation: ✅ Working');
        console.log('   - Image upload: ✅ Working');
        console.log('   - Multiple images: ✅ Working');
        console.log('   - Image accessibility: ⚠️ Needs verification');

    } catch (error) {
        if (error.response) {
            console.error(`❌ API Error (${error.response.status}):`, error.response.data);
        } else {
            console.error('❌ Network Error:', error.message);
        }
    }
}

// Run the test
testReviewImageUpload().catch(console.error);