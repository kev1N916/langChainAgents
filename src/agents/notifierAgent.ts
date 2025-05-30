import { createReactAgent } from "@langchain/langgraph/prebuilt";
import { agentStateModifier, runAgentNode } from "./node";
import { sendEmail } from "./tools/agent_tools";
import { AppState } from "./appState";
import { ChatGoogleGenerativeAI } from "@langchain/google-genai";
import { ChatOpenAI } from "@langchain/openai";
import dotenv from "dotenv";
dotenv.config();

// everything seems alright here

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


// Ensure GOOGLE_API_KEY is loaded fom nvironment variables
const googleApiKey = process.env.GOOGLE_API_KEY;

// Initialize the Gemini 2.0 Flash mod
// const llm = new ChatGoogleGeneativeAI({
//     model: "gemini-2.0-flash", // Specify the Gemini 2.0 Flash model
//     apiKey: googleApiKey, // Pass the API key loaded from environment variables
// });

const notifierNode = (state: typeof AppState.State) => {
    const stateModifier = agentStateModifier(
        "You are an assistant who can send notifications to various channels like emails, teams, whatsapp.etc .",
        [sendEmail],
        state.team_members ?? ["Notifier"],
    )
    const researchAgent = createReactAgent({
        llm,
        tools: [sendEmail],
        stateModifier,
    })
    return runAgentNode({ state, agent: researchAgent, name: "Notifier" });
}


export { notifierNode };