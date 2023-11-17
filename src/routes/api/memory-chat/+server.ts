import type { Config } from '@sveltejs/kit';
import { ChatOpenAI } from 'langchain/chat_models/openai';
import {BufferMemory} from "langchain/memory";
import {ConversationChain} from "langchain/chains";
import {FIREBASE_ADMIN_KEY, OPENAI_API_KEY} from "$env/static/private";
import admin from "firebase-admin"
import {json} from "@sveltejs/kit";
import {FirestoreChatMessageHistory} from "$lib/firebase/firestore-history";
import {getUser} from "../../../lib/util/user";
export const config: Config = {
    runtime: 'edge'
};

/**
 * server endpoint for chatGpt Stream Chat
 * @param request - request object
 */
export const POST = async ({ request }) => {
    const { messages, ...other } = await request.json();
    const authHeader = request.headers.get('authorization');
    const sessionHeader = request.headers.get('session');
    const user = await getUser(authHeader);
    const sessionId = (sessionHeader) ? sessionHeader : 'test-session'

    if (!user) {
        throw new Error("User not found");
    }
    const memory = new BufferMemory({
        chatHistory: new FirestoreChatMessageHistory({
            collectionName: "chathistory",
            sessionId,
            userId: user.uid,
            config: {
                projectId: "langchain-prompt-tool",
                credential: admin.credential.cert(JSON.parse(FIREBASE_ADMIN_KEY))
            },
            organizeByUser: true,
        }),
    });

    const llm = new ChatOpenAI({
        streaming: true,
        openAIApiKey: OPENAI_API_KEY
    });
    const chain = new ConversationChain({ llm, memory });

    const response = await chain
        .call({ input: messages[messages.length - 1].content })
        .catch(console.error);

    return json(response?.response as string);
};
