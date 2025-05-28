// import { createReactAgent } from "@langchain/langgraph/prebuilt";
// import {getIssuesAndComments } from "./tools/agent_tools";
// import { loadInstructionFromFile } from "../util/loadPrompt";
// import { ChatGoogleGenerativeAI } from "@langchain/google-genai";
// import dotenv from "dotenv";

// dotenv.config();
// // Ensure GOOGLE_API_KEY is loaded from environment variables
// const googleApiKey = process.env.GOOGLE_API_KEY;

// // Initialize the Gemini 2.0 Flash model
// const model = new ChatGoogleGenerativeAI({
//   model: "gemini-2.0-flash", // Specify the Gemini 2.0 Flash model
//   apiKey: googleApiKey, // Pass the API key loaded from environment variables
// });


// const jiraInteractorAgent = createReactAgent({
//   llm: model,
//   tools: [getIssuesAndComments],
//   name: "jira_interactor",
//   prompt: loadInstructionFromFile("jira_interactor_prompt.txt"),
// });


// export { jiraInteractorAgent };