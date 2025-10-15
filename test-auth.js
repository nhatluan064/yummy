// Test Firebase auth state
import { getAuthClient } from './src/lib/firebase.js';

async function testAuth() {
  try {
    const auth = await getAuthClient();
    console.log('Auth initialized successfully');

    // Check current user
    const user = auth.currentUser;
    if (user) {
      console.log('Current user:', {
        uid: user.uid,
        email: user.email,
        displayName: user.displayName,
        emailVerified: user.emailVerified
      });
    } else {
      console.log('No user currently signed in');
    }

    // Check localStorage
    const adminToken = localStorage.getItem('adminToken');
    const adminUser = localStorage.getItem('adminUser');
    console.log('localStorage adminToken:', adminToken);
    console.log('localStorage adminUser:', adminUser);

  } catch (error) {
    console.error('Auth test failed:', error);
  }
}

testAuth();