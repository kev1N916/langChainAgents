import { END, START, StateGraph } from "@langchain/langgraph";
import { AppState } from "./appState";
import { ChatGoogleGenerativeAI } from "@langchain/google-genai";
import { createSupervisor } from "./supervisor";
import dotenv from "dotenv";
import { notifierNode } from "./notifierAgent";
import { jiraNode } from "./jiraAgent";
import { summarizerNode } from "./summarizer";
dotenv.config();

// everything seems alright here

// Ensure GOOGLE_API_KEY is loaded from environment variables
const googleApiKey = process.env.GOOGLE_API_KEY;

// Initialize the Gemini 2.0 Flash model
const llm = new ChatGoogleGenerativeAI({
    model: "gemini-2.0-flash", // Specify the Gemini 2.0 Flash model
    apiKey: googleApiKey, // Pass the API key loaded from environment variables
});

const createGraph = async () => {

    const supervisorAgent = await createSupervisor(llm);

    const researchGraph = new StateGraph(AppState)
        .addNode("Notifier", notifierNode)
        .addNode("supervisor", supervisorAgent)
        .addNode("Jira", jiraNode)
        .addNode("Summarizer", summarizerNode)
        .addEdge("Jira", "supervisor")
        .addEdge("Notifier", "supervisor")
        .addEdge("Summarizer", "supervisor")
        .addConditionalEdges("supervisor", (x) => x.next, {
            Jira: "Jira",
            Notifier: "Notifier",
            Summarizer: "Summarizer",
            FINISH: END,
        })
        .addEdge(START, "supervisor");

    const researchChain = researchGraph.compile();
    return researchChain

    // researchChain.
};

export { createGraph};