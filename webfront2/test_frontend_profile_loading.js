// Test script to simulate frontend profile loading behavior
const API_BASE_URL = 'http://localhost:5000';

// Simulate the ProfileSwitchContext loadUserProfiles function
async function simulateLoadUserProfiles() {
  console.log('🔄 Simulating ProfileSwitchContext.loadUserProfiles()...');
  
  // Simulate user object
  const user = {
    uid: 'test-user-123',
    email: 'test@example.com',
    displayName: 'Test User'
  };
  
  console.log('👤 User:', user);
  
  try {
    // Load profiles directly from the API (same as frontend)
    const response = await fetch(`${API_BASE_URL}/api/profiles`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      }
    });

    console.log('📡 API Response Status:', response.status);
    
    let createdProfiles = [];
    
    if (response.ok) {
      const result = await response.json();
      console.log('📊 API Response:', JSON.stringify(result, null, 2));
      
      if (result.profiles && result.profiles.length > 0) {
        // Transform API profiles to UserProfile format (same as frontend)
        createdProfiles = result.profiles.map((profile) => ({
          id: `page_${profile.id}`, // Prefix with 'page_' to distinguish from user profile
          type: profile.type,
          name: profile.name,
          username: `@${profile.name.toLowerCase().replace(/\s+/g, '_')}`,
          avatar: profile.name.charAt(0).toUpperCase(),
          color: getProfileColor(profile.type),
          isActive: false,
          createdAt: profile.created_at || new Date().toISOString(),
          firebaseUid: user.uid
        }));
        
        console.log('🔄 Transformed profiles:', JSON.stringify(createdProfiles, null, 2));
      }
    } else {
      console.log('❌ API request failed:', response.status, response.statusText);
    }

    // Always add a "My Pages" option at the beginning (same as frontend)
    const myProfile = {
      id: user.uid, // Use Firebase UID as the actual profile ID
      type: 'player',
      name: 'My Pages',
      username: `@${user.email?.split('@')[0] || 'mypages'}`,
      avatar: (user.displayName || 'MP').split(' ').map(n => n[0]).join('').toUpperCase(),
      color: 'linear-gradient(to bottom right, #FF6B33, #2E4B5F)',
      isActive: true,
      createdAt: new Date().toISOString(),
      firebaseUid: user.uid
    };

    const availableProfiles = [myProfile, ...createdProfiles];
    
    console.log('📋 Final available profiles:', JSON.stringify(availableProfiles, null, 2));
    console.log(`✅ Total profiles available: ${availableProfiles.length}`);
    console.log(`   - My Pages: 1`);
    console.log(`   - Created Pages: ${createdProfiles.length}`);
    
    return availableProfiles;
    
  } catch (error) {
    console.error('❌ Error loading user profiles:', error);
    return [];
  }
}

// Helper function to get profile color (same as frontend)
function getProfileColor(profileType) {
  switch (profileType) {
    case 'academy':
      return 'linear-gradient(to bottom right, #3B82F6, #1D4ED8)';
    case 'venue':
    case 'pitch':
      return 'linear-gradient(to bottom right, #10B981, #059669)';
    case 'community':
      return 'linear-gradient(to bottom right, #8B5CF6, #7C3AED)';
    case 'player':
      return 'linear-gradient(to bottom right, #FF6B33, #2E4B5F)';
    default:
      return 'linear-gradient(to bottom right, #6B7280, #4B5563)';
  }
}

// Run the simulation
simulateLoadUserProfiles()
  .then(profiles => {
    console.log('\n🎉 Profile loading simulation completed!');
    console.log(`📊 Found ${profiles.length} total profiles`);
    
    if (profiles.length > 1) {
      console.log('✅ Profile listing should work in the frontend!');
    } else {
      console.log('⚠️  Only "My Pages" profile found - no created pages');
    }
  })
  .catch(error => {
    console.error('❌ Simulation failed:', error);
  });

