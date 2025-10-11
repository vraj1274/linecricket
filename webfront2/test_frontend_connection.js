/**
 * Test script to verify frontend can connect to localhost backend
 */

const API_BASE_URL = 'http://localhost:5000/api';

async function testBackendConnection() {
    console.log('🧪 Testing Frontend -> Backend Connection...');
    console.log('=' * 50);
    
    try {
        // Test health endpoint
        console.log('1. Testing health endpoint...');
        const healthResponse = await fetch(`${API_BASE_URL}/health`);
        
        if (healthResponse.ok) {
            const healthData = await healthResponse.json();
            console.log('✅ Health check passed');
            console.log('   Response:', healthData);
        } else {
            console.log('❌ Health check failed:', healthResponse.status, healthResponse.statusText);
            return false;
        }
        
        // Test root endpoint
        console.log('\n2. Testing root endpoint...');
        const rootResponse = await fetch('http://localhost:5000/');
        
        if (rootResponse.ok) {
            const rootData = await rootResponse.json();
            console.log('✅ Root endpoint working');
            console.log('   API Version:', rootData.version);
            console.log('   Available endpoints:', Object.keys(rootData.endpoints).length);
        } else {
            console.log('❌ Root endpoint failed:', rootResponse.status, rootResponse.statusText);
        }
        
        // Test API endpoints
        console.log('\n3. Testing API endpoints...');
        const apiResponse = await fetch(`${API_BASE_URL}`);
        
        if (apiResponse.ok) {
            console.log('✅ API endpoints accessible');
        } else {
            console.log('❌ API endpoints failed:', apiResponse.status, apiResponse.statusText);
        }
        
        console.log('\n' + '=' * 50);
        console.log('🎉 Frontend connection test completed!');
        console.log('🌐 Backend is accessible from frontend');
        console.log('📡 API base URL:', API_BASE_URL);
        console.log('=' * 50);
        
        return true;
        
    } catch (error) {
        console.error('❌ Connection test failed:', error);
        console.log('\n🔧 Troubleshooting tips:');
        console.log('1. Make sure the backend is running on localhost:5000');
        console.log('2. Check if there are any CORS issues');
        console.log('3. Verify the backend is accessible in your browser');
        return false;
    }
}

// Run the test
testBackendConnection();

