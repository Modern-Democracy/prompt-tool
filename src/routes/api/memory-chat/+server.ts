import type { Config } from '@sveltejs/kit';
import { StreamingTextResponse, LangChainStream } from 'ai';
import { ChatOpenAI } from 'langchain/chat_models/openai';
import {BufferMemory} from "langchain/memory";
import {ConversationChain} from "langchain/chains";
import {FirestoreChatMessageHistory} from "langchain/stores/message/firestore";
import {FIREBASE_ADMIN_KEY, OPENAI_API_KEY} from "$env/static/private";
import admin from "firebase-admin"
import {getFirebaseAdminAuth} from "../../../lib/firebase/firebase-admin";
export const config: Config = {
    runtime: 'edge'
};

async function getUserId(authHeader: string) {
    const tokenString = authHeader?.substring(7); //Remove Bearer prefix if set
    const token = await getFirebaseAdminAuth().verifyIdToken(tokenString)
    return (token) ? token.uid : 'test-user';
}

/**
 * server endpoint for chatGpt Stream Chat
 * @param request - request object
 */
export const POST = async ({ request }) => {
    const { messages, ...other } = await request.json();
    const authHeader = request.headers.get('authorization');
    const userId = await getUserId(authHeader);
    const { sessionId = 'test-session'  } = other;

    console.log('SESSION:', sessionId, 'USER:', userId);
    const { stream, handlers } = LangChainStream();

    const memory = new BufferMemory({
        chatHistory: new FirestoreChatMessageHistory({
            collectionName: "chathistory",
            sessionId,
            userId,
            config: { projectId: "langchain-prompt-tool", credential: admin.credential.cert(JSON.parse(FIREBASE_ADMIN_KEY)) },
        }),
    });

    const llm = new ChatOpenAI({
        streaming: true,
        openAIApiKey: OPENAI_API_KEY
    });
    const chain = new ConversationChain({ llm, memory });

    await chain
        .call({ input: messages[messages.length - 1].content })
        .catch(console.error);

    return new StreamingTextResponse(stream);
};
