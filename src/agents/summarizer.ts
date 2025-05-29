import { createReactAgent } from "@langchain/langgraph/prebuilt";
import { agentStateModifier, runAgentNode } from "./node";
import { getIssuesAndComments } from "./tools/agent_tools";
import { AppState } from "./appState";
import { ChatGoogleGenerativeAI } from "@langchain/google-genai";
import dotenv from "dotenv";
dotenv.config();

// everything seems alright here

// Ensure GOOGLE_API_KEY is loaded from environment variables
const googleApiKey = process.env.GOOGLE_API_KEY;

// Initialize the Gemini 2.0 Flash model
const llm = new ChatGoogleGenerativeAI({
    model: "gemini-2.0-flash", // Specify the Gemini 2.0 Flash model
    apiKey: googleApiKey, // Pass the API key loaded from environment variables
});

const summarizerNode = (state: typeof AppState.State) => {
    const stateModifier = agentStateModifier(
        "You are an assistant which can summarize information from JIRA, use your own internal capabilities for this.",
        [],
        state.team_members ?? ["Summarizer"],
    )
    const summarizerAgent = createReactAgent({
        llm,
        tools: [],
        stateModifier,
    })

    
    return runAgentNode({ state, agent: summarizerAgent, name: "Summarizer" });
};


export { summarizerNode };