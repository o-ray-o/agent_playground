import {
    ActionExample,
    Content,
    generateText,
    HandlerCallback,
    IAgentRuntime,
    Memory,
    ModelClass,
    State,
    type Action,
} from "@elizaos/core";

interface NewsParams {
    searchTerm: string;
}

export const getCurrentNews: Action = {
    name: "GET_CURRENT_NEWS",
    similes: [
        "NEWS",
        "CURRENT_NEWS",
        "LATEST_NEWS",
        "FETCH_NEWS",
        "GET_NEWS",
        "CHECK_NEWS",
        "NEWS_UPDATE",
    ],
    validate: async (_runtime: IAgentRuntime, _message: Memory) => {
        return true;
    },
    description: "Get the current news for a given search term by the user",
    handler: async (
        _runtime: IAgentRuntime,
        _message: Memory,
        _state: State,
        _options: { [key: string]: unknown },
        _callback: HandlerCallback
    ): Promise<boolean> => {
        async function _getCurrentNews(searchTerm: string) {
            const news = await fetch(
                `https://newsapi.org/v2/everything?q=${searchTerm}&apiKey=${process.env.NEWS_API_KEY}`
            );
            // return the first 5 news articles, with the title and description and content
            const data = await news.json();
            return data.articles
                .slice(0, 5)
                .map(
                    (article) =>
                        `${article.title}.\n${article.description}.\n${article.content.slice(0, 1000)}`
                )
                .join("\n\n");
        }

        const context = `Extract ONLY the topic to search news for from this message.
        Ignore any casual conversation or greetings.
        The message is: ${_message.content.text}

        Only output the exact search terms, no other text.
        For example:
        If message is "Hey what's up, can you check news about Bitcoin?" -> output: "Bitcoin"
        If message is "Yo tell me about Tesla stock" -> output: "Tesla stock"`;

        const searchTerm = await generateText({
            runtime: _runtime,
            context,
            modelClass: ModelClass.SMALL,
            stop: ["\n"],
        });

        console.log("Generated searchTerm:", searchTerm);

        const news = await _getCurrentNews(searchTerm);

        const responseText =
            "The current news for the search term " + searchTerm + "is " + news;

        const newMemory: Memory = {
            content: {
                text: responseText,
                action: "CURRENT_NEWS_RESPONSE",
                source: _message.content?.source,
            } as Content,
            userId: _message.userId,
            agentId: _message.agentId,
            roomId: _message.roomId,
        };

        await _runtime.messageManager.createMemory(newMemory);

        _callback(newMemory.content);
        return true;
    },
    examples: [
        [
            {
                user: "{{user1}}",
                content: {
                    text: "What's the latest news about Trump and Crypto?",
                    params: {
                        searchTerm: "Trump Crypto",
                    },
                },
            },
            {
                user: "{{user2}}",
                content: {
                    text: "Let me check the latest SpaceX news for you",
                    action: "GET_CURRENT_NEWS",
                    params: {
                        searchTerm: "SpaceX",
                    },
                },
            },
        ],

        [
            {
                user: "{{user1}}",
                content: {
                    text: "Tell me what's happening with artificial intelligence",
                    params: {
                        searchTerm: "artificial intelligence",
                    },
                },
            },
            {
                user: "{{user2}}",
                content: {
                    text: "I'll fetch the current AI news",
                    action: "GET_CURRENT_NEWS",
                    params: {
                        searchTerm: "artificial intelligence",
                    },
                },
            },
        ],

        [
            {
                user: "{{user1}}",
                content: {
                    text: "Any updates on climate change?",
                    params: {
                        searchTerm: "climate change",
                    },
                },
            },
            {
                user: "{{user2}}",
                content: {
                    text: "Let me get the latest climate change news",
                    action: "GET_CURRENT_NEWS",
                    params: {
                        searchTerm: "climate change",
                    },
                },
            },
        ],

        [
            {
                user: "{{user1}}",
                content: {
                    text: "What's happening in the crypto market?",
                    params: {
                        searchTerm: "cryptocurrency news",
                    },
                },
            },
            {
                user: "{{user2}}",
                content: {
                    text: "I'll check the latest crypto news",
                    action: "GET_CURRENT_NEWS",
                    params: {
                        searchTerm: "cryptocurrency news",
                    },
                },
            },
        ],
    ] as ActionExample[][],
} as Action;
