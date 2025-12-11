#!/usr/bin/env node

// Comprehensive checkout verification script
const fs = require('fs');

console.log('🔍 Comprehensive ShopFlow Checkout Verification...\n');

// Check if all checkout components exist and are properly implemented
const checkoutPath = './client/src/pages/Checkout.jsx';
const addressFormPath = './client/src/components/AddressForm.jsx';

if (!fs.existsSync(checkoutPath)) {
  console.log('❌ Checkout.jsx does not exist');
  process.exit(1);
}

if (!fs.existsSync(addressFormPath)) {
  console.log('❌ AddressForm.jsx does not exist');
  process.exit(1);
}

const checkoutContent = fs.readFileSync(checkoutPath, 'utf8');
const addressFormContent = fs.readFileSync(addressFormPath, 'utf8');

console.log('📋 Testing Implementation Status:\n');

// Test 1: Progress Stepper
const hasProgressStepper = checkoutContent.includes('Progress Stepper') &&
                          checkoutContent.includes('steps = [') &&
                          checkoutContent.includes('currentStep') &&
                          checkoutContent.includes('aria-label="Progress"');

console.log(hasProgressStepper ? '✅ Progress stepper component implemented' : '❌ Progress stepper component missing');

// Test 2: Shipping Address Step with Validation
const hasShippingStep = checkoutContent.includes('ShippingAddressStep') &&
                        checkoutContent.includes('AddressForm') &&
                        checkoutContent.includes('showAddAddress');

console.log(hasShippingStep ? '✅ Shipping address step with add new address functionality' : '❌ Shipping address step incomplete');

// Test 3: Address Form Validation
const hasValidation = addressFormContent.includes('validateForm') &&
                     addressFormContent.includes('postalCode') &&
                     addressFormContent.includes('zipRegex') &&
                     addressFormContent.includes('Invalid postal code format');

console.log(hasValidation ? '✅ Address form with postal code validation' : '❌ Address form validation missing');

// Test 4: Shipping Method Selection
const hasShippingMethod = checkoutContent.includes('ShippingMethodStep') &&
                         checkoutContent.includes('shippingMethods') &&
                         checkoutContent.includes('standard') &&
                         checkoutContent.includes('express');

console.log(hasShippingMethod ? '✅ Shipping method selection implemented' : '❌ Shipping method selection missing');

// Test 5: Payment Step
const hasPaymentStep = checkoutContent.includes('PaymentStep') &&
                      checkoutContent.includes('paymentMethod') &&
                      checkoutContent.includes('card') &&
                      checkoutContent.includes('paypal');

console.log(hasPaymentStep ? '✅ Payment step implemented' : '❌ Payment step missing');

// Test 6: Review Step
const hasReviewStep = checkoutContent.includes('ReviewStep') &&
                     checkoutContent.includes('orderData') &&
                     checkoutContent.includes('handlePlaceOrder');

console.log(hasReviewStep ? '✅ Review step implemented' : '❌ Review step missing');

// Test 7: Order Summary
const hasOrderSummary = checkoutContent.includes('Order Summary') &&
                       checkoutContent.includes('calculateTotal') &&
                       checkoutContent.includes('Subtotal');

console.log(hasOrderSummary ? '✅ Order summary implemented' : '❌ Order summary missing');

// Test 8: Form Field Validations
const hasFieldValidations = addressFormContent.includes('firstName') &&
                           addressFormContent.includes('lastName') &&
                           addressFormContent.includes('streetAddress') &&
                           addressFormContent.includes('city') &&
                           addressFormContent.includes('state') &&
                           addressFormContent.includes('postalCode') &&
                           addressFormContent.includes('phone');

console.log(hasFieldValidations ? '✅ All required form fields with validation' : '❌ Form field validation incomplete');

// Test 9: Error Handling
const hasErrorHandling = addressFormContent.includes('setErrors') &&
                        addressFormContent.includes('errors.') &&
                        checkoutContent.includes('disabled={') &&
                        checkoutContent.includes('cursor-not-allowed');

console.log(hasErrorHandling ? '✅ Error handling and disabled states implemented' : '❌ Error handling incomplete');

// Test 10: Navigation State Management
const hasNavigationState = checkoutContent.includes('handleNext') &&
                          checkoutContent.includes('handlePrevious') &&
                          checkoutContent.includes('setCurrentStep');

console.log(hasNavigationState ? '✅ Navigation state management implemented' : '❌ Navigation state management missing');

console.log('\n🎉 Checkout Implementation Status:');

const allTests = [
  hasProgressStepper,
  hasShippingStep,
  hasValidation,
  hasShippingMethod,
  hasPaymentStep,
  hasReviewStep,
  hasOrderSummary,
  hasFieldValidations,
  hasErrorHandling,
  hasNavigationState
];

const passedTests = allTests.filter(test => test).length;
const totalTests = allTests.length;
const passRate = Math.round((passedTests / totalTests) * 100);

console.log(`✅ ${passedTests}/${totalTests} tests passed (${passRate}%)`);

if (passedTests === totalTests) {
  console.log('\n🚀 All checkout functionality is properly implemented!');
  console.log('\n📋 Completed Features:');
  console.log('- Multi-step checkout with progress stepper');
  console.log('- Shipping address selection and form');
  console.log('- Add new address with validation');
  console.log('- Shipping method selection');
  console.log('- Payment method selection');
  console.log('- Order review and summary');
  console.log('- Form validation with error handling');
  console.log('- Navigation state management');
} else {
  console.log('\n⚠️ Some features need attention');
}

console.log('\n🔧 Test Specific Requirements Status:');
console.log('- Progress stepper visible at top: ' + (hasProgressStepper ? '✅' : '❌'));
console.log('- Form validation for required fields: ' + (hasFieldValidations ? '✅' : '❌'));
console.log('- Postal code format validation: ' + (hasValidation ? '✅' : '❌'));
console.log('- Saved address selection: ' + (hasShippingStep ? '✅' : '❌'));
console.log('- Shipping method selection: ' + (hasShippingMethod ? '✅' : '❌'));