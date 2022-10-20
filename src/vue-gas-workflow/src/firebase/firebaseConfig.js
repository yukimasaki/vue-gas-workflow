import { initializeApp } from 'firebase/app'
import { getFirestore } from 'firebase/firestore'

const firebaseConfig = {
  apiKey: process.env.VUE_APP_APIKEY,
  authDomain: process.env.VUE_APP_AUTHDOMAIN,
  projectId: process.env.VUE_APP_PROJECTID,
  storageBucket: process.env.VUE_APP_STORAGEBUCKET,
  messagingSenderId: process.env.VUE_APP_MESSAGESENDER,
  appId: process.env.VUE_APP_APPID
}

// Firebaseの初期化
const app = initializeApp(firebaseConfig)

//Firestoreの初期化
const db = getFirestore(app)

export default db
