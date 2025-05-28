import { END, START, StateGraph } from "@langchain/langgraph";
import { AppState } from "./appState";
import { Runnable } from "@langchain/core/runnables";
import { createTeamSupervisor } from "./createNode";
import { ChatGoogleGenerativeAI } from "@langchain/google-genai";
import dotenv from "dotenv";
import { notifierNode, jiraNode, } from "./createTeam";
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

        const supervisorAgent = await createTeamSupervisor(
        llm,
        "You are a supervisor tasked with managing a conversation between the" +
        " following workers:  {team_members}. Given the following user request," +
        " respond with the worker to act next. Each worker will perform a" +
        " task and respond with their results and status. When finished," +
        " respond with FINISH.\n\n" +
        " Select strategically to minimize the number of steps taken.",
        ["Jira", "Notifier"], // These are the worker names the supervisor will manage
    );

    const researchGraph = new StateGraph(AppState)
        .addNode("Notifier", notifierNode)
        .addNode("supervisor", supervisorAgent)
        .addNode("Jira", jiraNode)
        .addEdge("Jira", "supervisor")
        .addEdge("Notifier", "supervisor")
        .addConditionalEdges("supervisor", (x) => x.next, {
            Jira: "Jira",
            Notifier: "Notifier",
            FINISH: END,
        })
        .addEdge(START, "supervisor");

    const researchChain = researchGraph.compile();
    return researchChain

    // researchChain.
};

export { createGraph};