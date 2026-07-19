import { db } from './firebase';
import { 
  collection, 
  doc, 
  setDoc, 
  deleteDoc, 
  onSnapshot, 
  getDocs, 
  getDoc,
  getDocFromServer,
  query,
  limit
} from 'firebase/firestore';
import { 
  INITIAL_CITIZENS, 
  INITIAL_HOUSEHOLDS, 
  INITIAL_LAND_PLOTS, 
  INITIAL_FARMING_LOGS, 
  INITIAL_PLANS, 
  INITIAL_HANDBOOK, 
  INITIAL_ACCOUNTS, 
  INITIAL_SYSTEM_LOGS 
} from '../data/mockData';
import { Citizen, Household, LandPlot, FarmingLog, LocalPlan, HandbookArticle, UserAccount, SystemLog } from '../types';

// Validate connection on startup as required by guidelines
export async function testConnection() {
  try {
    await getDocFromServer(doc(db, 'test', 'connection'));
    console.log("Firebase connection verified successfully.");
  } catch (error) {
    if (error instanceof Error && error.message.includes('the client is offline')) {
      console.error("Please check your Firebase configuration. Client is offline.");
    } else {
      console.log("Firebase initialized successfully (could not reach test document but server responded).");
    }
  }
}
testConnection();

// Collection definitions
export const COLLECTIONS = {
  CITIZENS: 'citizens',
  HOUSEHOLDS: 'households',
  PLOTS: 'plots',
  FARMING_LOGS: 'farming_logs',
  PLANS: 'plans',
  ARTICLES: 'articles',
  ACCOUNTS: 'accounts',
  SYSTEM_LOGS: 'system_logs'
};

// Seeds all databases on startup if first time
export async function seedDatabase() {
  try {
    const seedStatusRef = doc(db, COLLECTIONS.SYSTEM_LOGS, 'SEED_STATUS');
    const seedStatusSnap = await getDoc(seedStatusRef);
    if (seedStatusSnap.exists()) {
      console.log("Database already seeded. Skipping initial seeding.");
      return;
    }

    console.log("Database not seeded yet. Seeding initial data...");

    const seedItem = async <T extends { id?: string; username?: string }>(
      collectionName: string,
      dataList: T[],
      idField: 'id' | 'username'
    ) => {
      for (const item of dataList) {
        const id = item[idField];
        if (id) {
          await setDoc(doc(db, collectionName, id), item);
        }
      }
    };

    await seedItem(COLLECTIONS.CITIZENS, INITIAL_CITIZENS, 'id');
    await seedItem(COLLECTIONS.HOUSEHOLDS, INITIAL_HOUSEHOLDS, 'id');
    await seedItem(COLLECTIONS.PLOTS, INITIAL_LAND_PLOTS, 'id');
    await seedItem(COLLECTIONS.FARMING_LOGS, INITIAL_FARMING_LOGS, 'id');
    await seedItem(COLLECTIONS.PLANS, INITIAL_PLANS, 'id');
    await seedItem(COLLECTIONS.ARTICLES, INITIAL_HANDBOOK, 'id');
    await seedItem(COLLECTIONS.ACCOUNTS, INITIAL_ACCOUNTS, 'username');
    await seedItem(COLLECTIONS.SYSTEM_LOGS, INITIAL_SYSTEM_LOGS, 'id');

    // Save the seed status flag
    await setDoc(seedStatusRef, { seeded: true, timestamp: new Date().toISOString() });
    console.log("Initial seeding completed successfully!");
  } catch (err) {
    console.error("Error during seedDatabase:", err);
  }
}

// Force restore database to original mock data
export async function forceResetDatabase() {
  console.log("Forcing database reset to initial mock data...");
  const seedItem = async <T extends { id?: string; username?: string }>(
    collectionName: string,
    dataList: T[],
    idField: 'id' | 'username'
  ) => {
    for (const item of dataList) {
      const id = item[idField];
      if (id) {
        await setDoc(doc(db, collectionName, id), item);
      }
    }
  };

  await seedItem(COLLECTIONS.CITIZENS, INITIAL_CITIZENS, 'id');
  await seedItem(COLLECTIONS.HOUSEHOLDS, INITIAL_HOUSEHOLDS, 'id');
  await seedItem(COLLECTIONS.PLOTS, INITIAL_LAND_PLOTS, 'id');
  await seedItem(COLLECTIONS.FARMING_LOGS, INITIAL_FARMING_LOGS, 'id');
  await seedItem(COLLECTIONS.PLANS, INITIAL_PLANS, 'id');
  await seedItem(COLLECTIONS.ARTICLES, INITIAL_HANDBOOK, 'id');
  await seedItem(COLLECTIONS.ACCOUNTS, INITIAL_ACCOUNTS, 'username');
  await seedItem(COLLECTIONS.SYSTEM_LOGS, INITIAL_SYSTEM_LOGS, 'id');

  // Also set the seed status doc
  await setDoc(doc(db, COLLECTIONS.SYSTEM_LOGS, 'SEED_STATUS'), { seeded: true, timestamp: new Date().toISOString() });
}

// Real-time listener helpers
export function subscribeCollection<T>(collectionName: string, callback: (data: T[]) => void) {
  return onSnapshot(collection(db, collectionName), (snapshot) => {
    const list: T[] = [];
    snapshot.forEach((doc) => {
      list.push(doc.data() as T);
    });
    callback(list);
  }, (err) => {
    console.error(`Subscription error in ${collectionName}:`, err);
  });
}

// Database update helpers
export async function saveDocument<T>(collectionName: string, docId: string, data: T) {
  try {
    const cleanData = JSON.parse(JSON.stringify(data)); // strip any undefined values for Firebase
    await setDoc(doc(db, collectionName, docId), cleanData, { merge: true });
  } catch (err) {
    console.error(`Error saving document to ${collectionName}/${docId}:`, err);
    throw err;
  }
}

export async function deleteDocument(collectionName: string, docId: string) {
  try {
    await deleteDoc(doc(db, collectionName, docId));
  } catch (err) {
    console.error(`Error deleting document from ${collectionName}/${docId}:`, err);
    throw err;
  }
}
