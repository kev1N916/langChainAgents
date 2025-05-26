import { ChatOpenAI } from "@langchain/openai";
import { createSupervisor } from "@langchain/langgraph-supervisor";
import { jiraInteractorAgent } from "./jira_interactor";
import { summarizerAgent } from "./summarizer";
import { notificationSenderAgent } from "./notification_sender";
import { loadInstructionFromFile } from "../util/loadPrompt";
// Create supervisor workflow

const model = new ChatOpenAI({ modelName: "gpt-4o" });
const supervisor = createSupervisor({
    agents: [jiraInteractorAgent, notificationSenderAgent,summarizerAgent],
    llm: model,
    prompt: loadInstructionFromFile("jira_supervisor_prompt.txt"),
    addHandoffBackMessages: true,
});


export { supervisor }