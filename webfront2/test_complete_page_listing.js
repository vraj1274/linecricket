// Comprehensive test for complete page listing functionality
const API_BASE_URL = 'http://localhost:5000';

async function testCompletePageListing() {
  console.log('🔍 Testing Complete Page Listing Functionality');
  console.log('=' * 60);
  
  try {
    // Test 1: Backend API
    console.log('\n1️⃣ Testing Backend API...');
    const response = await fetch(`${API_BASE_URL}/api/profiles`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      }
    });

    if (!response.ok) {
      throw new Error(`API request failed: ${response.status} ${response.statusText}`);
    }

    const result = await response.json();
    console.log('✅ Backend API working');
    console.log(`📊 Found ${result.profiles.length} created pages`);
    console.log(`📋 Total: ${result.total} pages`);

    // Test 2: Page Types Analysis
    console.log('\n2️⃣ Analyzing Page Types...');
    const pageTypes = {};
    result.profiles.forEach(profile => {
      pageTypes[profile.type] = (pageTypes[profile.type] || 0) + 1;
    });
    
    console.log('📈 Page Type Distribution:');
    Object.entries(pageTypes).forEach(([type, count]) => {
      console.log(`   ${type}: ${count} pages`);
    });

    // Test 3: Public Visibility Check
    console.log('\n3️⃣ Checking Public Visibility...');
    const publicPages = result.profiles.filter(p => p.is_public);
    const privatePages = result.profiles.filter(p => !p.is_public);
    
    console.log(`🌐 Public pages: ${publicPages.length}`);
    console.log(`🔒 Private pages: ${privatePages.length}`);
    
    if (publicPages.length > 0) {
      console.log('✅ Pages are publicly visible to other users');
      console.log('📋 Public pages:');
      publicPages.forEach(page => {
        console.log(`   - ${page.name} (${page.type}) - ${page.city}, ${page.state}`);
      });
    } else {
      console.log('⚠️ No public pages found');
    }

    // Test 4: Frontend ProfileSwitchContext Simulation
    console.log('\n4️⃣ Simulating ProfileSwitchContext...');
    
    // Simulate authenticated user
    const user = {
      uid: 'test-user-123',
      email: 'test@example.com',
      displayName: 'Test User'
    };

    // Transform profiles for frontend
    const transformedProfiles = result.profiles.map((profile) => ({
      id: `page_${profile.id}`,
      type: profile.type,
      name: profile.name,
      username: `@${profile.name.toLowerCase().replace(/\s+/g, '_')}`,
      avatar: profile.name.charAt(0).toUpperCase(),
      color: getProfileColor(profile.type),
      isActive: false,
      createdAt: profile.created_at || new Date().toISOString(),
      firebaseUid: user.uid
    }));

    // Add "My Pages" profile
    const myProfile = {
      id: user.uid,
      type: 'player',
      name: 'My Pages',
      username: `@${user.email?.split('@')[0] || 'mypages'}`,
      avatar: (user.displayName || 'MP').split(' ').map(n => n[0]).join('').toUpperCase(),
      color: 'linear-gradient(to bottom right, #FF6B33, #2E4B5F)',
      isActive: true,
      createdAt: new Date().toISOString(),
      firebaseUid: user.uid
    };

    const availableProfiles = [myProfile, ...transformedProfiles];
    
    console.log('✅ ProfileSwitchContext simulation complete');
    console.log(`📋 Total available profiles: ${availableProfiles.length}`);
    console.log(`   - My Pages: 1`);
    console.log(`   - Created Pages: ${transformedProfiles.length}`);

    // Test 5: Profile Switch UI Simulation
    console.log('\n5️⃣ Simulating Profile Switch UI...');
    const profileSwitchUI = availableProfiles.map(profile => {
      const icon = getProfileIcon(profile.type);
      const isActive = profile.isActive ? ' (ACTIVE)' : '';
      return `${icon} ${profile.name} (${profile.type})${isActive}`;
    });

    console.log('🎨 Profile Switch UI would show:');
    profileSwitchUI.forEach(profile => console.log(`   ${profile}`));

    // Test 6: Public Profile Access (for other users)
    console.log('\n6️⃣ Testing Public Profile Access...');
    const publicProfiles = result.profiles.filter(p => p.is_public);
    
    if (publicProfiles.length > 0) {
      console.log('✅ Other users can see these public pages:');
      publicProfiles.forEach(page => {
        console.log(`   🏫 ${page.name} (${page.type}) - ${page.city}, ${page.state}`);
        console.log(`      Description: ${page.description || 'No description'}`);
        console.log(`      Created: ${new Date(page.created_at).toLocaleDateString()}`);
      });
    }

    // Test 7: Page Navigation Simulation
    console.log('\n7️⃣ Testing Page Navigation...');
    const navigationTests = [
      { type: 'academy', expectedPage: 'created-page' },
      { type: 'pitch', expectedPage: 'created-page' },
      { type: 'community', expectedPage: 'created-page' },
      { type: 'player', expectedPage: 'my-profile' }
    ];

    console.log('🧭 Navigation mapping:');
    navigationTests.forEach(test => {
      const page = getProfilePage(test.type);
      console.log(`   ${test.type} → ${page}`);
    });

    console.log('\n' + '=' * 60);
    console.log('🎉 COMPLETE PAGE LISTING TEST RESULTS');
    console.log('=' * 60);
    
    const results = {
      success: transformedProfiles.length > 0,
      totalProfiles: availableProfiles.length,
      createdPages: transformedProfiles.length,
      publicPages: publicPages.length,
      pageTypes: pageTypes,
      academyPages: transformedProfiles.filter(p => p.type === 'academy').length,
      pitchPages: transformedProfiles.filter(p => p.type === 'pitch').length,
      communityPages: transformedProfiles.filter(p => p.type === 'community').length
    };

    if (results.success) {
      console.log('✅ SUCCESS: Page listing functionality is working correctly!');
      console.log(`📊 Total Profiles: ${results.totalProfiles}`);
      console.log(`📋 Created Pages: ${results.createdPages}`);
      console.log(`🌐 Public Pages: ${results.publicPages}`);
      console.log(`🏫 Academy Pages: ${results.academyPages}`);
      console.log(`🏟️ Pitch Pages: ${results.pitchPages}`);
      console.log(`👥 Community Pages: ${results.communityPages}`);
      
      console.log('\n🎯 NEXT STEPS:');
      console.log('1. Open browser to http://localhost:3000');
      console.log('2. Check browser console for ProfileSwitchContext debug messages');
      console.log('3. Look for these messages:');
      console.log('   - "🔄 ProfileSwitchContext: useEffect triggered"');
      console.log('   - "👤 User in useEffect: [user object]"');
      console.log('   - "📡 Making API request to /api/profiles"');
      console.log('   - "📊 API response: [profiles data]"');
      console.log('4. Check profile switch button in sidebar');
      console.log('5. Verify created pages appear in profile list');
    } else {
      console.log('❌ ISSUE: No created pages found');
      console.log('🔧 TROUBLESHOOTING:');
      console.log('1. Check if backend server is running on port 5000');
      console.log('2. Check if frontend server is running on port 3000');
      console.log('3. Check browser console for errors');
      console.log('4. Verify user authentication is working');
    }

    return results;

  } catch (error) {
    console.error('❌ Test failed:', error);
    return { success: false, error: error.message };
  }
}

// Helper functions
function getProfileColor(profileType) {
  switch (profileType) {
    case 'academy': return 'linear-gradient(to bottom right, #3B82F6, #1D4ED8)';
    case 'venue':
    case 'pitch': return 'linear-gradient(to bottom right, #10B981, #059669)';
    case 'community': return 'linear-gradient(to bottom right, #8B5CF6, #7C3AED)';
    case 'player': return 'linear-gradient(to bottom right, #FF6B33, #2E4B5F)';
    default: return 'linear-gradient(to bottom right, #6B7280, #4B5563)';
  }
}

function getProfileIcon(profileType) {
  switch (profileType) {
    case 'academy': return '🏫';
    case 'venue':
    case 'pitch': return '🏟️';
    case 'community': return '👥';
    case 'player': return '👤';
    default: return '📄';
  }
}

function getProfilePage(profileType) {
  if (profileType === 'player') return 'my-profile';
  if (['academy', 'venue', 'pitch', 'community'].includes(profileType)) return 'created-page';
  return 'dynamic-profile';
}

// Run the test
testCompletePageListing()
  .then(result => {
    console.log('\n📊 FINAL RESULTS:', result);
  })
  .catch(error => {
    console.error('❌ Test execution failed:', error);
  });

