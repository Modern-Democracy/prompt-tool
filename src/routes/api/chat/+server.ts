import type { Config } from '@sveltejs/kit';
import { StreamingTextResponse, LangChainStream } from 'ai';
import { ChatOpenAI } from 'langchain/chat_models/openai';
import { AIMessage, HumanMessage } from 'langchain/schema';
import { OPENAI_API_KEY } from "$env/static/private";

export const config: Config = {
    runtime: 'edge'
};

/**
 * server endpoint for chatGpt Stream Chat
 * @param request - request object
 */
export const POST = async ({ request }) => {
    const { messages } = await request.json();
    const { stream, handlers } = LangChainStream();

    const llm = new ChatOpenAI({
        streaming: true,
        openAIApiKey: OPENAI_API_KEY
    });

    llm
        .call(
            messages.map((m) =>
                m.role == 'user' ?
                    new HumanMessage(m.content)
                    : new AIMessage(m.content)
            ),
            {},
            [handlers]
        )
        .catch(console.error);

    return new StreamingTextResponse(stream);
};
