import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { storage } from '@/lib/firebase';


export const uploadToFirebaseStorage = async (file: Blob | File, folder: string = 'uploads'): Promise<string> => {
  try {
    const ext = file.type === 'image/webp' ? 'webp' : 'png';
    const filename = `${folder}/${Date.now() + Math.random().toString(36).substring(2, 15)}.${ext}`;
    const storageRef = ref(storage, filename);
    const snapshot = await uploadBytes(storageRef, file);
    const downloadURL = await getDownloadURL(snapshot.ref);
    return downloadURL;
  } catch (error) {
    console.error("Error uploading to Firebase Storage:", error);
    throw error;
  }
};
