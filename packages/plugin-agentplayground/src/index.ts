import { Plugin } from "@elizaos/core";
import { getCurrentNews } from "./actions/currentNews.ts";

export * as actions from "./actions/index.ts";
export * as evaluators from "./evaluators/index.ts";
export * as providers from "./providers/index.ts";

export const agentPlaygroundPlugin: Plugin = {
    name: "playground",
    description: "Agent playground",
    actions: [getCurrentNews],
};
