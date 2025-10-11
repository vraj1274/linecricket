/**
 * Test script for profile creation API integration
 */

const API_BASE_URL = 'http://localhost:5000/api';

async function testProfileCreation() {
    console.log('🧪 Testing Profile Creation API...');
    console.log('=' * 50);
    
    const testProfiles = [
        {
            name: 'Player Profile Test',
            data: {
                profile_type: 'player',
                name: 'John Doe',
                role: 'batsman',
                level: 'intermediate',
                bio: 'Passionate cricket player'
            }
        },
        {
            name: 'Coach Profile Test',
            data: {
                profile_type: 'coach',
                name: 'Coach Smith',
                specialization: 'batting',
                experience: '10',
                bio: 'Professional cricket coach'
            }
        },
        {
            name: 'Venue Profile Test',
            data: {
                profile_type: 'venue',
                name: 'Mumbai Cricket Ground',
                type: 'cricket_ground',
                location: 'Mumbai, India',
                description: 'Premium cricket facility'
            }
        },
        {
            name: 'Academy Profile Test',
            data: {
                profile_type: 'academy',
                name: 'Elite Cricket Academy',
                type: 'cricket_academy',
                level: 'all_levels',
                description: 'Professional cricket training'
            }
        },
        {
            name: 'Community Profile Test',
            data: {
                profile_type: 'community',
                name: 'Cricket Enthusiasts',
                type: 'local_club',
                location: 'Delhi',
                description: 'Local cricket community'
            }
        }
    ];
    
    for (const test of testProfiles) {
        try {
            console.log(`\n📝 Testing ${test.name}...`);
            
            const response = await fetch(`${API_BASE_URL}/profiles/create`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(test.data)
            });
            
            const result = await response.json();
            
            if (response.ok && result.success) {
                console.log(`✅ ${test.name} - SUCCESS`);
                console.log(`   Profile ID: ${result.profile.id}`);
                console.log(`   Message: ${result.message}`);
            } else {
                console.log(`❌ ${test.name} - FAILED`);
                console.log(`   Error: ${result.error || 'Unknown error'}`);
            }
            
        } catch (error) {
            console.log(`❌ ${test.name} - ERROR`);
            console.log(`   Error: ${error.message}`);
        }
    }
    
    console.log('\n' + '=' * 50);
    console.log('🎯 API Integration Test Complete');
    console.log('=' * 50);
    
    console.log('\n📋 Next Steps:');
    console.log('1. Open http://localhost:3000 in your browser');
    console.log('2. Navigate to "Add Profile" or "New Profile"');
    console.log('3. Test creating profiles through the UI');
    console.log('4. Check browser console for API calls');
    console.log('5. Verify profiles are created successfully');
}

// Run the test
testProfileCreation();
