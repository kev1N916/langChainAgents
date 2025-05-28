// import { createReactAgent } from "@langchain/langgraph/prebuilt";
// import { sendEmail } from "./tools/agent_tools";
// import {loadInstructionFromFile} from "../util/loadPrompt";
// import { ChatGoogleGenerativeAI} from "@langchain/google-genai";
// import dotenv from "dotenv";

// dotenv.config();
// // Ensure GOOGLE_API_KEY is loaded from environment variables
// const googleApiKey = process.env.GOOGLE_API_KEY;

// // Initialize the Gemini 2.0 Flash model
// const model = new ChatGoogleGenerativeAI({
//   model: "gemini-2.0-flash", // Specify the Gemini 2.0 Flash model
//   apiKey: googleApiKey, // Pass the API key loaded from environment variables
// });


// const notificationSenderAgent = createReactAgent({
//   llm: model,
//   tools: [sendEmail],
//   name: "notifier",
//   prompt: loadInstructionFromFile("notification_sender_prompt.txt"),
// });

// export { notificationSenderAgent };