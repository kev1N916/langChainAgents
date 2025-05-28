import { createReactAgent } from "@langchain/langgraph/prebuilt";
import { createTeamSupervisor, agentStateModifier, runAgentNode } from "./createNode";
import { ChatGoogleGenerativeAI } from "@langchain/google-genai";
import { Runnable } from "@langchain/core/runnables";
import { sendEmail,getIssuesAndComments } from "./tools/agent_tools";
import dotenv from "dotenv";
import { AppState } from "./appState";
import { BaseChatModel } from "@langchain/core/language_models/chat_models";
dotenv.config();


// everything seems alright here 

// Ensure GOOGLE_API_KEY is loaded from environment variables
const googleApiKey = process.env.GOOGLE_API_KEY;

// Initialize the Gemini 2.0 Flash model
const llm = new ChatGoogleGenerativeAI({
    model: "gemini-2.0-flash", // Specify the Gemini 2.0 Flash model
    apiKey: googleApiKey, // Pass the API key loaded from environment variables
});


const jiraNode = (state: typeof AppState.State) => {
    const stateModifier = agentStateModifier(
        "You are an assistant who can interact with JIRA and get information from JIRA.",
        [getIssuesAndComments],
        state.team_members ?? ["Jira"],
    )
    const jiraAgent = createReactAgent({
        llm,
        tools: [getIssuesAndComments],
        stateModifier,
    })
    return runAgentNode({ state, agent: jiraAgent, name: "Jira" });
};

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


const createSupervisor = async (llm: BaseChatModel): Promise<Runnable> => {
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

    return supervisorAgent;
};

export {notifierNode, jiraNode, createSupervisor};