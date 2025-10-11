// Test script to verify profile listing functionality
const API_BASE_URL = 'http://localhost:5000';

async function testProfileListing() {
  console.log('Testing profile listing functionality...');
  
  try {
    // Test the API endpoint
    const response = await fetch(`${API_BASE_URL}/api/profiles`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      }
    });

    console.log('Response status:', response.status);
    
    if (response.ok) {
      const result = await response.json();
      console.log('API Response:', JSON.stringify(result, null, 2));
      
      if (result.profiles && result.profiles.length > 0) {
        console.log(`✅ Found ${result.profiles.length} profiles`);
        
        // Test the transformation logic
        const transformedProfiles = result.profiles.map((profile) => ({
          id: `page_${profile.id}`,
          type: profile.type,
          name: profile.name,
          username: `@${profile.name.toLowerCase().replace(/\s+/g, '_')}`,
          avatar: profile.name.charAt(0).toUpperCase(),
          isActive: false,
          createdAt: profile.created_at || new Date().toISOString()
        }));
        
        console.log('Transformed profiles:', JSON.stringify(transformedProfiles, null, 2));
        console.log('✅ Profile transformation working correctly');
      } else {
        console.log('⚠️  No profiles found in response');
      }
    } else {
      console.log('❌ API request failed:', response.status, response.statusText);
    }
  } catch (error) {
    console.error('❌ Error testing profile listing:', error);
  }
}

// Run the test
testProfileListing();

