import {BaseListChatMessageHistory, BaseMessage, mapStoredMessageToChatMessage} from "langchain/schema";
import type {StoredMessage} from "langchain/schema";
import {firestore} from "firebase-admin";
import type {AppOptions} from "firebase-admin";
import type {DocumentData, Firestore} from "firebase-admin/lib/firestore";
import DocumentReference = firestore.DocumentReference;
import FieldValue = firestore.FieldValue;
import {getFirebaseAdminFirestore} from "./firebase-admin";

/**
 * Transforms an array of `StoredMessage` instances into an array of
 * `BaseMessage` instances. It uses the `mapV1MessageToStoredMessage`
 * function to ensure all messages are in the `StoredMessage` format, then
 * creates new instances of the appropriate `BaseMessage` subclass based
 * on the type of each message. This function is used to prepare stored
 * messages for use in a chat context.
 */
export function mapStoredMessagesToChatMessages(
    messages: StoredMessage[]
): BaseMessage[] {
    return messages.map(mapStoredMessageToChatMessage);
}

/**
 * Transforms an array of `BaseMessage` instances into an array of
 * `StoredMessage` instances. It does this by calling the `toDict` method
 * on each `BaseMessage`, which returns a `StoredMessage`. This function
 * is used to prepare chat messages for storage.
 */
export function mapChatMessagesToStoredMessages(
    messages: BaseMessage[]
): StoredMessage[] {
    return messages.map((message) => message.toDict());
}

/**
 * Interface for FirestoreDBChatMessageHistory. It includes the collection
 * name, session ID, user ID, and optionally, the app index and
 * configuration for the Firebase app.
 */
export interface FirestoreDBChatMessageHistory {
    collectionName: string;
    sessionId: string;
    userId: string;
    appIdx?: number;
    config?: AppOptions;
    organizeByUser?: boolean;
}

/**
 * Class for managing chat message history using Google's Firestore as a
 * storage backend. Extends the BaseListChatMessageHistory class.
 */
export class FirestoreChatMessageHistory extends BaseListChatMessageHistory {
    lc_namespace = ["langchain", "stores", "message", "firestore"];

    private collectionName: string;

    private sessionId: string;

    private userId: string;

    private appIdx: number;

    private config: AppOptions;

    private organizeByUser: boolean;

    private firestoreClient: Firestore;

    private document: DocumentReference<DocumentData> | null;

    constructor({
                    collectionName,
                    sessionId,
                    userId,
                    appIdx = 0,
                    config = {},
                    organizeByUser = false,
                }: FirestoreDBChatMessageHistory) {
        super();
        this.collectionName = collectionName;
        this.sessionId = sessionId;
        this.userId = userId;
        this.document = null;
        this.appIdx = appIdx;
        this.config = config;
        this.organizeByUser = organizeByUser;

        try {
            this.ensureFirestore();
        } catch (error) {
            throw new Error(`Unknown response type`);
        }
    }

    private ensureFirestore(): void {
        this.firestoreClient = getFirebaseAdminFirestore();

        if (this.organizeByUser) {
            this.document = this.firestoreClient
                .collection('users')
                .doc(this.userId)
                .collection(this.collectionName)
                .doc(this.sessionId);
        } else {
            this.document = this.firestoreClient
                .collection(this.collectionName)
                .doc(this.sessionId);
        }
    }

    /**
     * Method to retrieve all messages from the Firestore collection
     * associated with the current session. Returns an array of BaseMessage
     * objects.
     * @returns Array of stored messages
     */
    async getMessages(): Promise<BaseMessage[]> {
        if (!this.document) {
            throw new Error("Document not initialized");
        }

        const querySnapshot = await this.document
            .collection("messages")
            .orderBy("createdAt", "asc")
            .get()
            .catch((err) => {
                throw new Error(`Unknown response type: ${err.toString()}`);
            });

        const response: StoredMessage[] = [];
        querySnapshot.forEach((doc) => {
            const {type, data} = doc.data();
            response.push({type, data});
        });

        return mapStoredMessagesToChatMessages(response);
    }

    /**
     * Method to add a new message to the Firestore collection. The message is
     * passed as a BaseMessage object.
     * @param message The message to be added as a BaseMessage object.
     */
    public async addMessage(message: BaseMessage) {
        const messages = mapChatMessagesToStoredMessages([message]);
        await this.upsertMessage(messages[0]);
    }

    private async upsertMessage(message: StoredMessage): Promise<void> {
        if (!this.document) {
            throw new Error("Document not initialized");
        }
        await this.document.set(
            {
                id: this.sessionId,
                user_id: this.userId,
            },
            {merge: true}
        );
        await this.document
            .collection("messages")
            .add({
                type: message.type,
                data: message.data,
                createdBy: this.userId,
                createdAt: FieldValue.serverTimestamp(),
            })
            .catch((err) => {
                throw new Error(`Unknown response type: ${err.toString()}`);
            });
    }

    /**
     * Method to delete all messages from the Firestore collection associated
     * with the current session.
     */
    public async clear(): Promise<void> {
        if (!this.document) {
            throw new Error("Document not initialized");
        }
        await this.document
            .collection("messages")
            .get()
            .then((querySnapshot) => {
                querySnapshot.docs.forEach((snapshot) => {
                    snapshot.ref.delete().catch((err) => {
                        throw new Error(`Unknown response type: ${err.toString()}`);
                    });
                });
            })
            .catch((err) => {
                throw new Error(`Unknown response type: ${err.toString()}`);
            });
        await this.document.delete().catch((err) => {
            throw new Error(`Unknown response type: ${err.toString()}`);
        });
    }
}
