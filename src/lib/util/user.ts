import {getFirebaseAdminAuth} from "../firebase/firebase-admin";
import {parseAuthToken} from "./parse-auth-token";

export async function getUser(authHeader: string) {
    const tokenString = parseAuthToken(authHeader);
    const token = await getFirebaseAdminAuth().verifyIdToken(tokenString)
    return (token) ? getFirebaseAdminAuth().getUser(token.uid) : undefined;
}
