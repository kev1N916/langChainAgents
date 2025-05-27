import { createSupervisor } from "@langchain/langgraph-supervisor";
import { jiraInteractorAgent } from "./jira_interactor";
import { summarizerAgent } from "./summarizer";
import { notificationSenderAgent } from "./notification_sender";
import { loadInstructionFromFile } from "../util/loadPrompt";
import { ChatGoogleGenerativeAI } from "@langchain/google-genai";
import dotenv from "dotenv";

dotenv.config();

// Ensure GOOGLE_API_KEY is loaded from environment variables
const googleApiKey = process.env.GOOGLE_API_KEY;

// Initialize the Gemini 2.0 Flash model
const model = new ChatGoogleGenerativeAI({
  model: "gemini-2.0-flash", // Specify the Gemini 2.0 Flash model
  apiKey: googleApiKey, // Pass the API key loaded from environment variables
});

const supervisor = createSupervisor({
    agents: [jiraInteractorAgent, notificationSenderAgent,summarizerAgent],
    llm: model,
    outputMode: "full_history",
    prompt: loadInstructionFromFile("jira_supervisor_prompt.txt"),
    addHandoffBackMessages: true,
});


export { supervisor }