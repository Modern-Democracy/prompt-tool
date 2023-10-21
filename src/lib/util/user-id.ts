import {getFirebaseAdminAuth} from "../firebase/firebase-admin";

export async function getUserId(authHeader: string) {
    const tokenString = authHeader?.substring(7); //Remove Bearer prefix if set
    const token = await getFirebaseAdminAuth().verifyIdToken(tokenString)
    return (token) ? token.uid : 'test-user';
}
