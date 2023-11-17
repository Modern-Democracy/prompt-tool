import type { Config } from '@sveltejs/kit';
import {getFirebaseAdminFirestore} from "$lib/firebase/firebase-admin";
import {getUserConversation} from "../../../lib/util/conversations";
import {json} from "@sveltejs/kit";

export const config: Config = {
    runtime: 'edge'
};

/**
 * server endpoint for chatGpt Stream Chat
 * @param request - request object
 */
export const GET = async ({ url, route, params, request, cookies }) => {
    const web_session_id = cookies.get('web_session_id');
    const conversationId = await url.searchParams.get('conversationId');
    let conversation;
    let isValid = false;

    if (web_session_id) {
        const firestoreDb = getFirebaseAdminFirestore();
        const userRef = firestoreDb.collection('users');
        const userSnapshot = await userRef.where('web_session_id', '==', web_session_id).get();

        if (!userSnapshot.empty) {
            const userDoc = userSnapshot.docs[0];
            const userData = userDoc.data();
            const { user_uid } = userData;
            conversation = await getUserConversation(user_uid, conversationId);
        }
    }

    return json(conversation);
};
