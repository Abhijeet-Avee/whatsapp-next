import firebase from 'firebase';

const firebaseConfig = {
    apiKey: "AIzaSyABIb7JFYv53fWn-rajQDD-niRIsPd50VM",
    authDomain: "whatsapp-next-b861c.firebaseapp.com",
    projectId: "whatsapp-next-b861c",
    storageBucket: "whatsapp-next-b861c.appspot.com",
    messagingSenderId: "857016124579",
    appId: "1:857016124579:web:3eef6f9303a783d3d0eb16"
  };

//Check if already active do not reinitalize !!
const app = !firebase.apps.length ? 
                firebase.initializeApp(firebaseConfig) : firebase.app();

const db = app.firestore();
const auth = app.auth();
const provider = new firebase.auth.GoogleAuthProvider();

export {db, auth, provider};