import type {Config} from '@sveltejs/kit';
import {getFirebaseAdminFirestore} from "$lib/firebase/firebase-admin";
import {parseAuthToken} from "$lib/util/parse-auth-token";
import {generateSlug} from "$lib/util/slug";
import {getUser} from "$lib/util/user";

export const config: Config = {
    runtime: 'edge'
};

/**
 * server endpoint for chatGpt Stream Chat
 * @param request - request object
 */
export const POST = async ({request}) => {
    const authHeader = request.headers.get('authorization');
    const sessionHeader = request.headers.get('session-id');
    const user = await getUser(authHeader);
    let session_id;
    const auth_token = parseAuthToken(authHeader);

    if (user) {
        const firestoreDb = getFirebaseAdminFirestore();
        const userDocRef = await firestoreDb.collection("users").doc(user.uid);
        const userDoc = await userDocRef.get();
        const userChatHistory = await userDocRef.collection('chathistory').doc(sessionHeader).get();

        if (!userChatHistory.exists) {
            session_id = generateSlug();
            await userDocRef.set({
                user_name: user?.displayName,
                user_email: user?.email,
                user_photo_url: user?.photoURL,
                user_metadata: user?.metadata,
                user_provider_data: user?.providerData,
                user_uid: user?.uid,
                session_id,
                auth_token,
            }, {merge: true});
        } else {
            session_id = await userDoc.data()?.session_id;
        }

        return {
            user_name: user?.displayName,
            user_email: user?.email,
            user_photo_url: user?.photoURL,
            user_metadata: user?.metadata,
            user_provider_data: user?.providerData,
            user_uid: user?.uid,
            session_id,
        };
    } else {
        return {
            error: "User not found"
        }
    }
};
