import {getFirebaseAdminFirestore} from "../firebase/firebase-admin";

export type Conversation = {
    id: string;
    title: string;
    messages?: Message[];
};

export enum MessageType {
    human = 'human',
    system = 'system',
    ai = 'ai',
    func = 'function',
}
export type Message = {
    type: MessageType;
    data: MessageData;
    createdAt?: number;
    createdBy: string;
};

export type MessageData = {
    content: string;
};

async function retrieveConversationData(conversationDocRef: FirebaseFirestore.DocumentReference): Promise<Conversation> {
        const document = await conversationDocRef.get();
        const conversation = document.data();
        const title = (conversation.title) ? conversation.title : 'new chat';
        return {id: conversation.id, title};
}

export async function getUserConversation(userUid: string, conversationId: string) {
    const firestoreDb = getFirebaseAdminFirestore();
    const userDocRef = firestoreDb.collection("users").doc(userUid);
    const userDoc = await userDocRef.get();
    // Retrieve the conversation using conversationId as the id from the user document's chathistory subcollection
    const conversationDoc = userDoc.ref.collection("chathistory").doc(conversationId);
    const conversation: Conversation = await retrieveConversationData(conversationDoc);
    const messagesDocs = await conversationDoc.collection("messages").listDocuments();
    const messages: Message[] = [];
    await Promise.all(messagesDocs.map(async (messageDoc) => {
        const documentSnapshot = await messageDoc.get();
        const message = documentSnapshot.data();

        messages.push({
            id: documentSnapshot.id,
            role: message.type,
            content: message.data.content,
            createdBy: message.createdBy,
            createdAt: new Date(),
        });
    }));
    conversation.messages = messages;
    return conversation;
}

export async function getUserConversations(userUid: string) {
    const firestoreDb = getFirebaseAdminFirestore();
    const userDocRef = firestoreDb.collection("users").doc(userUid);
    const userDoc = await userDocRef.get();
    // Retrieve the list of conversations from the user document's chathistory subcollection
    const conversationDocs = await userDoc.ref.collection("chathistory").listDocuments();
    const conversations: Conversation[] = [];
    //For each conversation document, retrieve the conversation id and optional title properties from that document, and also retrieve the type, createdAt, createdBy, and data.content fields from each messages document found in the conversation document's messages collection. Then add the resulting fully-populated Conversation object from the returned results for each conversation to the conversations array as a new object using Promies.all
    await Promise.all(conversationDocs.map(async (conversationDoc) => {
        const conversation = await retrieveConversationData(conversationDoc);
        const messagesDocs = await conversationDoc.collection("messages").listDocuments();
        const messages: Message[] = [];
        await Promise.all(messagesDocs.map(async (messageDoc) => {
            const documentSnapshot = await messageDoc.get();
            const message = documentSnapshot.data();

            messages.push({
                type: message.type,
                data:  {
                    ...message.data
                },
                createdBy: message.createdBy,
            });
        }));
        conversation.messages = messages;
        conversations.push(conversation);
    }));
    return conversations;
}
