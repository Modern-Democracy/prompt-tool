import type { Config } from '@sveltejs/kit';
import {getFirebaseAdminFirestore} from "$lib/firebase/firebase-admin";
import {getUser} from "$lib/util/user";

export const config: Config = {
    runtime: 'edge'
};

/**
 * server endpoint for chatGpt Stream Chat
 * @param request - request object
 */
export const GET = async ({ request }) => {
    const authHeader = request.headers.get('authorization');
    const user = await getUser(authHeader);

    const firestoreDb = getFirebaseAdminFirestore();
    return await firestoreDb
        .collection("users")
        .doc(user?.uid)
        .collection("chathistory")
        .listDocuments()
        .then((documents) => {
            let history = [];
            documents.forEach((document) => {
                document.get().then((doc) => {
                    const data = doc.data();
                    if (data?.user_id === user?.uid) {
                        history.push(data);
                    }
                });
            });
            return {
                history
            };
        });

};
