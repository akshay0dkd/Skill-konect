
import admin from 'firebase-admin';
import { getFirestore } from 'firebase-admin/firestore';

// Initialize Firebase Admin SDK
admin.initializeApp();

const db = getFirestore();

async function main() {
  // Add skills
  const skillsCollection = db.collection('skills');
  await skillsCollection.add({
    name: 'React',
    category: 'Frontend Development',
    addedBy: 'user1',
    createdAt: admin.firestore.FieldValue.serverTimestamp(),
  });
  await skillsCollection.add({
    name: 'Node.js',
    category: 'Backend Development',
    addedBy: 'user2',
    createdAt: admin.firestore.FieldValue.serverTimestamp(),
  });

  console.log('Added 2 sample skills.');

  // Add requests
  const requestsCollection = db.collection('requests');
  await requestsCollection.add({
    fromUser: 'user1',
    toUser: 'user2',
    skillRequested: 'Node.js',
    status: 'pending',
    createdAt: admin.firestore.FieldValue.serverTimestamp(),
  });
  await requestsCollection.add({
    fromUser: 'user2',
    toUser: 'user1',
    skillRequested: 'React',
    status: 'pending',
    createdAt: admin.firestore.FieldValue.serverTimestamp(),
  });

  console.log('Added 2 sample requests.');
}

main().catch(console.error);
