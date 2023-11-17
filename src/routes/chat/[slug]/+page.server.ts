import type {Message} from "ai";
import {getFirebaseAdminFirestore} from "../../../lib/firebase/firebase-admin";
import {getUserConversation} from "../../../lib/util/conversations";

export const load = async ({ params, cookies }) => {
	const { slug } = params;
	const web_session_id = cookies?.get('web_session_id');

	let messages: Message[] = [];

	if (web_session_id) {
		const firestoreDb = getFirebaseAdminFirestore();
		const userRef = firestoreDb.collection('users');
		const userSnapshot = await userRef.where('web_session_id', '==', web_session_id).get();

		if (!userSnapshot.empty) {
			const userDoc = userSnapshot.docs[0];
			const userData = userDoc.data();
			const { auth_token, issued_at, expires_at, user_uid } = userData;

			const conversation= await getUserConversation(user_uid, slug);

			return {
				slug,
				user_uid,
				conversation,
			};
		}

	} else {
		return {
			error: "User not found"
		}
	}
	// await fetch(`/api/conversation?conversationId=${slug}`, {
	// 	headers: {
	// 		'Authorization': `Bearer ${$userState?.token}`,
	// 	},
	// })
	// 	.then(response => response.json())
	// 	.then(data => {
	// 		messages = data.messages
	// 	}).catch(error => {
	// 		console.log(error);
	// 	});
	// return {
	// 	slug,
	// 	messages,
	// };
};
