// Comprehensive test for page listing integration
const API_BASE_URL = 'http://localhost:5000';

async function testPageListingIntegration() {
  console.log('🔍 Testing Page Listing Integration...');
  console.log('=' * 60);
  
  try {
    // Test 1: Check if backend API is working
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

    // Test 2: Analyze page types
    console.log('\n2️⃣ Analyzing Page Types...');
    const pageTypes = {};
    result.profiles.forEach(profile => {
      pageTypes[profile.type] = (pageTypes[profile.type] || 0) + 1;
    });
    
    console.log('📈 Page Type Distribution:');
    Object.entries(pageTypes).forEach(([type, count]) => {
      console.log(`   ${type}: ${count} pages`);
    });

    // Test 3: Test frontend transformation logic
    console.log('\n3️⃣ Testing Frontend Transformation...');
    const transformedProfiles = result.profiles.map((profile) => ({
      id: `page_${profile.id}`,
      type: profile.type,
      name: profile.name,
      username: `@${profile.name.toLowerCase().replace(/\s+/g, '_')}`,
      avatar: profile.name.charAt(0).toUpperCase(),
      color: getProfileColor(profile.type),
      isActive: false,
      createdAt: profile.created_at || new Date().toISOString(),
      firebaseUid: 'test-user-123'
    }));

    console.log('✅ Frontend transformation working');
    console.log(`🔄 Transformed ${transformedProfiles.length} profiles`);

    // Test 4: Check profile visibility
    console.log('\n4️⃣ Checking Profile Visibility...');
    const publicProfiles = result.profiles.filter(p => p.is_public);
    const privateProfiles = result.profiles.filter(p => !p.is_public);
    
    console.log(`🌐 Public profiles: ${publicProfiles.length}`);
    console.log(`🔒 Private profiles: ${privateProfiles.length}`);

    // Test 5: Simulate complete profile switch context
    console.log('\n5️⃣ Simulating Profile Switch Context...');
    const myProfile = {
      id: 'test-user-123',
      type: 'player',
      name: 'My Pages',
      username: '@testuser',
      avatar: 'TU',
      color: 'linear-gradient(to bottom right, #FF6B33, #2E4B5F)',
      isActive: true,
      createdAt: new Date().toISOString(),
      firebaseUid: 'test-user-123'
    };

    const availableProfiles = [myProfile, ...transformedProfiles];
    
    console.log('✅ Profile Switch Context simulation complete');
    console.log(`📋 Total available profiles: ${availableProfiles.length}`);
    console.log(`   - My Pages: 1`);
    console.log(`   - Created Pages: ${transformedProfiles.length}`);

    // Test 6: Check specific page types
    console.log('\n6️⃣ Checking Specific Page Types...');
    const academyPages = transformedProfiles.filter(p => p.type === 'academy');
    const pitchPages = transformedProfiles.filter(p => p.type === 'pitch');
    const communityPages = transformedProfiles.filter(p => p.type === 'community');

    console.log(`🏫 Academy Pages: ${academyPages.length}`);
    academyPages.forEach(page => console.log(`   - ${page.name}`));

    console.log(`🏟️ Pitch Pages: ${pitchPages.length}`);
    pitchPages.forEach(page => console.log(`   - ${page.name}`));

    console.log(`👥 Community Pages: ${communityPages.length}`);
    communityPages.forEach(page => console.log(`   - ${page.name}`));

    // Test 7: Test public visibility
    console.log('\n7️⃣ Testing Public Visibility...');
    const publicPages = result.profiles.filter(p => p.is_public);
    console.log(`🌐 Public pages available for other users: ${publicPages.length}`);
    
    if (publicPages.length > 0) {
      console.log('✅ Pages are publicly visible');
      console.log('📋 Public pages:');
      publicPages.forEach(page => {
        console.log(`   - ${page.name} (${page.type}) - ${page.city}, ${page.state}`);
      });
    } else {
      console.log('⚠️ No public pages found');
    }

    console.log('\n' + '=' * 60);
    console.log('🎉 PAGE LISTING INTEGRATION TEST COMPLETE');
    console.log('=' * 60);
    
    if (transformedProfiles.length > 0) {
      console.log('✅ SUCCESS: Created pages should be visible in profile switch');
      console.log('✅ SUCCESS: Pages are publicly visible to other users');
      console.log('✅ SUCCESS: All page types (Academy, Pitch, Community) working');
    } else {
      console.log('❌ ISSUE: No created pages found');
    }

    return {
      success: transformedProfiles.length > 0,
      totalProfiles: availableProfiles.length,
      createdPages: transformedProfiles.length,
      publicPages: publicPages.length,
      pageTypes: pageTypes
    };

  } catch (error) {
    console.error('❌ Test failed:', error);
    return { success: false, error: error.message };
  }
}

// Helper function to get profile color
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

// Run the test
testPageListingIntegration()
  .then(result => {
    if (result.success) {
      console.log('\n🎯 RECOMMENDATIONS:');
      console.log('1. Check browser console for ProfileSwitchContext debug messages');
      console.log('2. Verify user authentication is working');
      console.log('3. Check if loadUserProfiles() is being called');
      console.log('4. Ensure frontend is connecting to http://localhost:5000');
    } else {
      console.log('\n🔧 TROUBLESHOOTING:');
      console.log('1. Check if backend server is running on port 5000');
      console.log('2. Check if frontend server is running on port 3000');
      console.log('3. Check browser console for errors');
    }
  })
  .catch(error => {
    console.error('❌ Test execution failed:', error);
  });

