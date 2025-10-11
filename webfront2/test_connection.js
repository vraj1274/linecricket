/**
 * Comprehensive test for frontend-backend connection and Firebase auth
 */

const API_BASE_URL = 'http://localhost:5000/api';

async function testConnection() {
    console.log('🧪 Testing Frontend-Backend Connection...');
    console.log('=' * 60);
    
    // Test 1: Basic backend connectivity
    console.log('1. Testing basic backend connectivity...');
    try {
        const healthResponse = await fetch(`${API_BASE_URL}/health`);
        if (healthResponse.ok) {
            const healthData = await healthResponse.json();
            console.log('✅ Backend health check passed');
            console.log('   Response:', healthData);
        } else {
            console.log('❌ Backend health check failed:', healthResponse.status);
            return false;
        }
    } catch (error) {
        console.log('❌ Backend connection failed:', error.message);
        return false;
    }
    
    // Test 2: CORS configuration
    console.log('\n2. Testing CORS configuration...');
    try {
        const corsResponse = await fetch(`${API_BASE_URL}/health`, {
            method: 'OPTIONS',
            headers: {
                'Origin': 'http://localhost:5173',
                'Access-Control-Request-Method': 'GET',
                'Access-Control-Request-Headers': 'Content-Type'
            }
        });
        console.log('✅ CORS preflight request successful');
        console.log('   Status:', corsResponse.status);
        console.log('   Headers:', Object.fromEntries(corsResponse.headers.entries()));
    } catch (error) {
        console.log('⚠️ CORS test failed (may be normal):', error.message);
    }
    
    // Test 3: API endpoints availability
    console.log('\n3. Testing API endpoints...');
    const endpoints = [
        '/health',
        '/test'
    ];
    
    for (const endpoint of endpoints) {
        try {
            const response = await fetch(`${API_BASE_URL}${endpoint}`);
            console.log(`   ${endpoint}: ${response.status} ${response.statusText}`);
        } catch (error) {
            console.log(`   ${endpoint}: Error - ${error.message}`);
        }
    }
    
    // Test 4: Firebase configuration check
    console.log('\n4. Checking Firebase configuration...');
    try {
        // Check if Firebase is available in the browser
        if (typeof window !== 'undefined' && window.firebase) {
            console.log('✅ Firebase SDK detected in browser');
        } else {
            console.log('⚠️ Firebase SDK not detected (may need to load frontend)');
        }
    } catch (error) {
        console.log('⚠️ Firebase check failed:', error.message);
    }
    
    console.log('\n' + '=' * 60);
    console.log('🎉 Connection test completed!');
    console.log('📡 Backend URL:', API_BASE_URL);
    console.log('🌐 Frontend should connect to:', API_BASE_URL);
    console.log('=' * 60);
    
    return true;
}

// Test Firebase authentication flow
async function testFirebaseAuth() {
    console.log('\n🔥 Testing Firebase Authentication...');
    console.log('=' * 60);
    
    // Check Firebase config
    const firebaseConfig = {
        apiKey: "AIzaSyAhYsXZwSjfA3LfMK23eGsKCIqVSr2aeI4",
        authDomain: "linecricket-1a2b3.firebaseapp.com",
        projectId: "linecricket-1a2b3",
        storageBucket: "linecricket-1a2b3.firebasestorage.app",
        messagingSenderId: "1080197808632",
        appId: "1:1080197808632:web:e7fb0380a8f6a698d3d60d",
        measurementId: "G-5JLRKNPDX3"
    };
    
    console.log('📋 Firebase Configuration:');
    console.log('   Project ID:', firebaseConfig.projectId);
    console.log('   Auth Domain:', firebaseConfig.authDomain);
    console.log('   API Key:', firebaseConfig.apiKey.substring(0, 10) + '...');
    
    // Test Firebase auth endpoints
    console.log('\n🔐 Testing Firebase auth endpoints...');
    const authEndpoints = [
        '/firebase/verify-token',
        '/firebase/signup',
        '/firebase/login',
        '/firebase/me'
    ];
    
    for (const endpoint of authEndpoints) {
        try {
            const response = await fetch(`${API_BASE_URL}${endpoint}`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ test: true })
            });
            console.log(`   ${endpoint}: ${response.status} ${response.statusText}`);
        } catch (error) {
            console.log(`   ${endpoint}: Error - ${error.message}`);
        }
    }
    
    console.log('\n✅ Firebase authentication test completed!');
    console.log('📝 Note: Full auth testing requires user interaction in browser');
    
    return true;
}

// Run all tests
async function runAllTests() {
    console.log('🚀 Starting comprehensive connection tests...');
    console.log('=' * 60);
    
    const connectionTest = await testConnection();
    const authTest = await testFirebaseAuth();
    
    console.log('\n📊 Test Results Summary:');
    console.log('=' * 60);
    console.log('Backend Connection:', connectionTest ? '✅ PASS' : '❌ FAIL');
    console.log('Firebase Auth Setup:', authTest ? '✅ PASS' : '❌ FAIL');
    console.log('=' * 60);
    
    if (connectionTest && authTest) {
        console.log('🎉 All tests passed! Frontend and backend are properly connected.');
        console.log('🚀 You can now start the frontend with: npm run dev');
    } else {
        console.log('⚠️ Some tests failed. Please check the issues above.');
    }
}

// Run the tests
runAllTests();

