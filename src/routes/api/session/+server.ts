import type { Config } from '@sveltejs/kit';
import {getUserId} from "../../../lib/util/user-id";
import {getFirebaseAdminFirestore} from "../../../lib/firebase/firebase-admin";
import {getUser} from "../../../lib/util/user";
import {generateSlug} from "../../../lib/util/slug";

export const config: Config = {
    runtime: 'edge'
};

/**
 * server endpoint for chatGpt Stream Chat
 * @param request - request object
 */
export const POST = async ({ request }) => {
    const authHeader = request.headers.get('authorization');
    const user = await getUser(authHeader);
    let sessionId;

    if (user) {
        const firestoreDb = getFirebaseAdminFirestore();
        const userDoc= await firestoreDb.collection("users").doc(user.uid);
        userDoc.get().then((doc) => {
            if (!doc.exists) {
                sessionId = generateSlug();
                userDoc.set({
                    user_name: user?.displayName,
                    user_email: user?.email,
                    user_photo_url: user?.photoURL,
                    user_metadata: user?.metadata,
                    user_provider_data: user?.providerData,
                    user_uid: user?.uid,
                    session_id: sessionId,
                }, {merge: true});
            } else {
                sessionId = doc.data()?.session_id;
            }
        });
        return {
            user_name: user?.displayName,
            user_email: user?.email,
            user_photo_url: user?.photoURL,
            user_metadata: user?.metadata,
            user_provider_data: user?.providerData,
            user_uid: user?.uid,
            session_id: sessionId,
        };
    } else {
        return {
            error: "User not found"
        }
    }
};
