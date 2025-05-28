import { createSupervisor } from "@langchain/langgraph-supervisor";
import { jiraInteractorAgent } from "./jira_interactor";
import { summarizerAgent } from "./summarizer";
import { notificationSenderAgent } from "./notification_sender";
import { loadInstructionFromFile } from "../util/loadPrompt";
import { BaseMessage } from "@langchain/core/messages";
import { ChatGoogleGenerativeAI } from "@langchain/google-genai";
import dotenv from "dotenv";
import { createReactAgent, ToolNode } from "@langchain/langgraph/prebuilt";
import { z } from "zod";
import { Annotation ,BinaryOperatorAggregate,messagesStateReducer} from "@langchain/langgraph";
dotenv.config();

// Ensure GOOGLE_API_KEY is loaded from environment variables
const googleApiKey = process.env.GOOGLE_API_KEY;

import "@langchain/langgraph/zod";

const AgentState = z.object({
  messages: z
    .array(z.string())
    .default(() => [])
    .langgraph.reducer(
      (a, b) => a.concat(Array.isArray(b) ? b : [b]),
      z.union([z.string(), z.array(z.string())])
    ),
});

// Initialize the Gemini 2.0 Flash model
const model = new ChatGoogleGenerativeAI({
  model: "gemini-2.0-flash", // Specify the Gemini 2.0 Flash model
  apiKey: googleApiKey, // Pass the API key loaded from environment variables
});


// model.bindTools([]);
const SummarizerInputSchema = z.object({
  text: z.string().describe("The text content to be summarized."),
});

const notifierTool = notificationSenderAgent.asTool({
  schema: AgentState
});
const jiraTool = jiraInteractorAgent.asTool({
  schema: AgentState
});

const summarizerTool = summarizerAgent.asTool({
  schema: AgentState
});

const supervisor = createReactAgent({
  tools: [summarizerTool,notifierTool,jiraTool],
  llm: model,
    // outputMode: "full_hstory",
  prompt: loadInstructionFromFile("jira_supervisor_prompt.txt"),
});


export { supervisor }