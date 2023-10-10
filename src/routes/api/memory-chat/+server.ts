import type { Config } from '@sveltejs/kit';
import { StreamingTextResponse, LangChainStream } from 'ai';
import { ChatOpenAI } from 'langchain/chat_models/openai';
import {AIMessage, FunctionMessage, HumanMessage, SystemMessage} from 'langchain/schema';
import {BufferMemory} from "langchain/memory";
import {ConversationChain} from "langchain/chains";
import {FirestoreChatMessageHistory} from "langchain/dist/stores/message/firestore";
import {FIREBASE_ADMIN_KEY, OPENAI_API_KEY} from "$env/static/private";
import admin from "firebase-admin"
export const config: Config = {
    runtime: 'edge'
};

/**
 * server endpoint for chatGpt Stream Chat
 * @param request - request object
 */
export const POST = async ({ request }) => {
    const { messages, sessionId = 'test-session', userId = 'test-user' } = await request.json();
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
    const chain = new ConversationChain({ llm, memory: new BufferMemory() });

    await chain
        .call(
            messages.map((m) => {
                switch(m.role) {
                    case 'system': return new SystemMessage(m.content);
                    case 'user': return new HumanMessage(m.content);
                    case 'function': return new FunctionMessage(m.content);
                    default: return new AIMessage(m.content);
                }
            }
            ),
            {},
        )
        .catch(console.error);

    return new StreamingTextResponse(stream);
};
