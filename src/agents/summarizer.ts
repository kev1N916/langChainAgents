import { createReactAgent } from "@langchain/langgraph/prebuilt";
import { agentStateModifier, runAgentNode } from "./node";
import { AppState } from "./appState";
import { ChatGoogleGenerativeAI } from "@langchain/google-genai";
import { ChatOpenAI } from "@langchain/openai";
import dotenv from "dotenv";
dotenv.config();

// everything seems alright here

// Ensure GOOGLE_API_KEY is loaded from environment variables
const googleApiKey = process.env.GOOGLE_API_KEY;

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