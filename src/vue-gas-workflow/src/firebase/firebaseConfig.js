import { initializeApp } from 'firebase/app'

const firebaseConfig = {
  apiKey: process.env.VUE_APP_APIKEY,
  authDomain: process.env.VUE_APP_AUTHDOMAIN,
  projectId: process.env.VUE_APP_PROJECTID,
  storageBucket: process.env.VUE_APP_STORAGEBUCKET,
  messagingSenderId: process.env.VUE_APP_MESSAGESENDER,
  appId: process.env.VUE_APP_APPID
}
const firebase = initializeApp(firebaseConfig)

export default firebase
