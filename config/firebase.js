const { initializeApp } = require('firebase/app');
const { getAuth } = require('firebase/auth');
const { getFirestore } = require('firebase/firestore');
const { getStorage, ref, uploadBytes, getDownloadURL } = require('firebase/storage');

const fs = require('fs').promises;

const uploadToFirebase = async (localPath, storagePath) => {
    try {
        const storage = getStorage();
        const storageRef = ref(storage, storagePath);

        console.log(`Uploading file from ${localPath} to ${storagePath}`);
        // Convertit le fichier en tableau d'octets (Uint8Array)
        const fileData = await fs.readFile(localPath);

        // Upload le tableau d'octets vers Firebase Storage
        await uploadBytes(storageRef, fileData);

        // Récupère l'URL de téléchargement
        const fileUrl = await getDownloadURL(storageRef);

        return fileUrl;
    } catch (error) {
        console.error('Error during Firebase Storage upload:', error);
        throw error; // Propage l'erreur pour qu'elle soit capturée ailleurs
    }
}


const uploadImageToFirebase = (localPath, imageName) => uploadToFirebase(localPath, `PostImages/${imageName}`);
const uploadMediaToFirebase = (localPath, mediaName) => uploadToFirebase(localPath, `MediaContainer/${mediaName}`);
const uploadProfileToFirebase = (localPath, imageName) => uploadToFirebase(localPath, `ProfileImage/${imageName}`);
const uploadStoryToFirebase = (localPath, storyName) => uploadToFirebase(localPath, `StoryContainer/${storyName}`);
const uploadRéelsToFirebase = (localPath, fileName) => uploadToFirebase(localPath, `VideoRéelsContainer/${fileName}`);

const convertImageToArrayBuffer = async (localPath) => {
    try {
        const arrayBuffer = fs.readFileSync(localPath);
        return arrayBuffer;
    } catch (error) {
        throw new Error(`Erreur lors de la conversion de l'image en ArrayBuffer : ${error.message}`);
    }
};

// Configuration Firebase
const firebaseConfig = {
    apiKey: "AIzaSyBrghzEzaaI_HgZbnRzKUlaHGNKizVF2aU",
    authDomain: "myflajooapp-15652.firebaseapp.com",
    projectId: "myflajooapp-15652",
    storageBucket: "myflajooapp-15652.appspot.com",
    messagingSenderId: "210714148369",
    appId: "1:210714148369:web:c2ab1fb38a1bbe53de7bb0",
    measurementId: "G-ZLPG5SHLYZ"
};

// Initialisez l'application Firebase
const app = initializeApp(firebaseConfig);
const firestore = getFirestore(app);
const storage = getStorage(app);

module.exports = {
    firestore,
    storage,
    uploadImageToFirebase,
    uploadMediaToFirebase,
    uploadStoryToFirebase,
    uploadProfileToFirebase,
    uploadRéelsToFirebase,
    convertImageToArrayBuffer
};
