import { createReactAgent } from "@langchain/langgraph/prebuilt";
import { agentStateModifier, runAgentNode } from "./node";
import { getIssuesAndComments } from "./tools/agent_tools";
import { AppState } from "./appState";
import { ChatGoogleGenerativeAI } from "@langchain/google-genai";
import { ChatOpenAI } from "@langchain/openai";
import { createCustomChatOpenAI } from "./customLLM";
import dotenv from "dotenv";
dotenv.config();

// everything seems alright here

// Ensure GOOGLE_API_KEY is loaded from environment variables
const googleApiKey = process.env.GOOGLE_API_KEY;

// Initialize the Gemini 2.0 Flash model
// const llm = new ChatGoogleGenerativeAI({
//     model: "gemini-2.0-flash", // Specify the Gemini 2.0 Flash model
//     apiKey: googleApiKey, // Pass the API key loaded from environment variables
// });

const llm =new ChatOpenAI({
        modelName: "gpt-4o",
        apiKey: "",
        configuration: {
            baseURL: "http://prod0-intuitionx-llm-router-v2.sprinklr.com/chat-completion",
            defaultHeaders: {
                "Content-Type": "application/json"
            }
        },
        modelKwargs: {
            client_identifier: "spr-ui-dev"
        }
    });

const jiraNode = (state: typeof AppState.State) => {
    const stateModifier = agentStateModifier(
        "You are an assistant who can interact with JIRA and get information from JIRA.",
        [getIssuesAndComments],
        state.team_members ?? ["Jira"],
    )
    const jiraAgent = createReactAgent({
        llm:llm,
        tools: [getIssuesAndComments],
        stateModifier,
    })

    
    return runAgentNode({ state, agent: jiraAgent, name: "Jira" });
};


export { jiraNode };