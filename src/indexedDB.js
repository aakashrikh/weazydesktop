import { openDB } from 'idb';

const DB_NAME = 'WeazyAuth';
const DB_VERSION = 3;
const STORE_NAME = 'AuthLogin';

// Open the database and create an object store for users
const dbPromise = openDB(DB_NAME, DB_VERSION, {
  upgrade(db) {
    if (!db.objectStoreNames.contains(STORE_NAME)) {
      db.createObjectStore(STORE_NAME, { keyPath: 'id' });
    }
  }
});

// Function to save user data in IndexedDB
export const saveUserData = async (user) => {
  const db = await dbPromise;
  await db.put(STORE_NAME, user);
};

// Function to get user data from IndexedDB
export const getUserData = async () => {
  try {
    const db = await dbPromise; // Open the database
    const tx = db.transaction(STORE_NAME, 'readonly'); // Start a readonly transaction
    const store = tx.objectStore(STORE_NAME); // Get the object store
    
    // Use `getAll()` to fetch all records from the object store
    const allUsers = await store.getAll(); 
    return allUsers; // Return the retrieved data
  } catch (error) {
    const allUsers=[];
    return allUsers;
  }
};

// Function to remove user data from IndexedDB (e.g., on logout)
export const removeUserData = async () => {
  try {
  const db = await dbPromise;
  const tx = db.transaction(STORE_NAME, 'readwrite');
  const store = tx.objectStore(STORE_NAME);


  await store.clear();
  await tx.done;
} catch (error) {
  console.log("aakash",error)
  return error;
}
};
