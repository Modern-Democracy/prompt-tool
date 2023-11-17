import { getUser } from '$lib/util/user';
import {getFirebaseAdminFirestore} from "$lib/firebase/firebase-admin";
import {getUserConversations} from "../lib/util/conversations";

export async function load({ cookies }) {
    const web_session_id = cookies.get('web_session_id');
    let conversations = [];
    let isValid = false;

    if (web_session_id) {
        const firestoreDb = getFirebaseAdminFirestore();
        const userRef = firestoreDb.collection('users');
        const userSnapshot = await userRef.where('web_session_id', '==', web_session_id).get();

        if (!userSnapshot.empty) {
            const userDoc = userSnapshot.docs[0];
            const userData = userDoc.data();
            const { auth_token, issued_at, expires_at, user_uid } = userData;
            conversations = await getUserConversations(user_uid);

            if (expires_at > Date.now()) {
                isValid = true
                try {
                    const userRecord = await getUser(auth_token);
                    if (userRecord?.uid === user_uid) {
                        return {
                            session: {
                                web_session_id,
                                isValid: true,
                                conversations,
                            },
                        };
                    }
                } catch (error) {
                    console.error('Error verifying token:', error);
                }
            } else {
                // token expired, so clear data in database
                await userDoc.ref.set({
                    auth_token: null,
                    issued_at: null,
                    expires_at: null,
                }, { merge: true });
            }
        }
    }

    return {
        session: {
            isValid: false,
            conversations,
        },
    };
}
