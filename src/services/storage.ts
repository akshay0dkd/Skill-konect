import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import * as firebase from '../firebase';

// Function to upload a file and get its URL
export const uploadFile = async (file: File, path: string): Promise<string> => {
    try {
        const storageRef = ref(firebase.storage, path);
        await uploadBytes(storageRef, file);
        const downloadURL = await getDownloadURL(storageRef);
        return downloadURL;
    } catch (error) {
        console.error("Error uploading file:", error);
        throw error;
    }
};