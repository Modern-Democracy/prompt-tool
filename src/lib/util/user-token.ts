import {getFirebaseAdminAuth} from "../firebase/firebase-admin";
import {parseAuthToken} from "./parse-auth-token";

export async function getUserToken(authHeader: string) {
    const tokenString = parseAuthToken(authHeader);
    return await getFirebaseAdminAuth().verifyIdToken(tokenString)
}
