/**
 * Test script to check available routes on the backend
 */

const API_BASE_URL = 'http://localhost:5000/api';

async function testRoutes() {
    console.log('🔍 Testing available backend routes...');
    console.log('=' * 50);
    
    const routes = [
        '/health',
        '/test',
        '/firebase/verify-token',
        '/firebase/signup',
        '/firebase/login',
        '/firebase/me',
        '/auth/login',
        '/auth/register',
        '/users/profile',
        '/posts',
        '/matches'
    ];
    
    for (const route of routes) {
        try {
            const response = await fetch(`${API_BASE_URL}${route}`, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json'
                }
            });
            console.log(`${route}: ${response.status} ${response.statusText}`);
        } catch (error) {
            console.log(`${route}: Error - ${error.message}`);
        }
    }
    
    console.log('\n🔍 Testing POST routes...');
    for (const route of routes.filter(r => r.includes('firebase') || r.includes('auth'))) {
        try {
            const response = await fetch(`${API_BASE_URL}${route}`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ test: true })
            });
            console.log(`POST ${route}: ${response.status} ${response.statusText}`);
        } catch (error) {
            console.log(`POST ${route}: Error - ${error.message}`);
        }
    }
    
    console.log('\n✅ Route testing completed!');
}

testRoutes();

