import type { Config } from '@sveltejs/kit';
import { ChatOpenAI } from 'langchain/chat_models/openai';
import {BufferMemory} from "langchain/memory";
import {ConversationChain} from "langchain/chains";
import {FIREBASE_ADMIN_KEY, OPENAI_API_KEY} from "$env/static/private";
import admin from "firebase-admin"
import {json} from "@sveltejs/kit";
import {PromptTemplate} from "langchain/prompts";
import {getFirebaseAdminAuth} from "$lib/firebase/firebase-admin";
import {FirestoreChatMessageHistory} from "$lib/firebase/firestore-history";
export const config: Config = {
    runtime: 'edge'
};

async function getUserId(authHeader: string) {
    const tokenString = authHeader?.substring(7); //Remove Bearer prefix if set
    const token = await getFirebaseAdminAuth().verifyIdToken(tokenString)
    return (token) ? token.uid : 'test-user';
}

const formatMessage = (message: { role: any; content: any; }) => {
    return `${message.role}: ${message.content}`;
};

const TEMPLATE = `Provide information in a direct, formal style without preambles, summaries, or using explanatory canned responses.

If you need clarification, ask before forming a response.

If my prompt lacks detail, list the details that are missing, organized by category and hierarchy.

Use existing models. Give clear options for me to choose.

Think carefully and logically, explaining your answer.

Use Legistics Paragraphing.

Create footnotes at the end of the response if necessary for additional clarity, using [1] as a marker template.

Keep footnote numbering sequential across all conversation responses. The exception is to reuse values from previous response when asked to make changes.

Current conversation:
{chat_history}

User: {input}
AI:`;

/**
 * server endpoint for chatGpt Stream Chat
 * @param request - request object
 */
export const POST = async ({ request }) => {
    const { messages, ...other } = await request.json();
    const formattedPreviousMessages = messages.slice(0, -1).map(formatMessage);
    const currentMessageContent = messages[messages.length - 1].content;

    const authHeader = request.headers.get('authorization');
    const sessionHeader = request.headers.get('session');
    const userId = await getUserId(authHeader);
    const sessionId = (sessionHeader) ? sessionHeader : 'test-session'

    console.log('SESSION:', sessionId, 'USER:', userId);

    const memory = new BufferMemory({
        chatHistory: new FirestoreChatMessageHistory({
            collectionName: "chathistory",
            sessionId,
            userId,
            config: { projectId: "langchain-prompt-tool", credential: admin.credential.cert(JSON.parse(FIREBASE_ADMIN_KEY)) },
            organizeByUser: true,
        }),
    });

    const prompt = PromptTemplate.fromTemplate(TEMPLATE);

    const llm = new ChatOpenAI({
        streaming: true,
        openAIApiKey: OPENAI_API_KEY
    });
    const chain = new ConversationChain({ llm, memory, prompt });

    const response = await chain
        .call({
            chat_history: formattedPreviousMessages.join("\n"), // TODO: Adding this causes an issue with the FirestoreChatMessageHistory code complaining about too many parameters.
            input: currentMessageContent,
        })
        .catch(console.error);

    return json(response?.response as string);
};
