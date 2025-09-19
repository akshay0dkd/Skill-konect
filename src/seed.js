import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { db } from './firebase.js';

const seedDatabase = async () => {
  // Seed Skills
  const skills = [
    { name: 'JavaScript', description: 'A versatile scripting language for web development.' },
    { name: 'React', description: 'A popular JavaScript library for building user interfaces.' },
    { name: 'TypeScript', description: 'A statically typed superset of JavaScript.' },
    { name: 'Node.js', description: 'A JavaScript runtime built on Chrome\'s V8 engine.' },
    { name: 'Firebase', description: 'A platform by Google for creating mobile and web applications.' },
  ];

  const skillsCollection = collection(db, 'skills');
  for (const skill of skills) {
    await addDoc(skillsCollection, { ...skill, createdAt: serverTimestamp() });
  }
  console.log('Skills seeded successfully!');

  // Seed Messages
  const messages = [
    {
      from: 'John Doe',
      to: 'Jane Smith',
      text: 'Hi Jane, I saw your request for a React developer. I\'d love to help out!',
    },
    {
      from: 'Jane Smith',
      to: 'John Doe',
      text: 'Hi John, that\'s great to hear! Can you tell me more about your experience?',
    },
  ];

  const messagesCollection = collection(db, 'messages');
  for (const message of messages) {
    await addDoc(messagesCollection, { ...message, timestamp: serverTimestamp() });
  }
  console.log('Messages seeded successfully!');
};

seedDatabase().catch(console.error);
