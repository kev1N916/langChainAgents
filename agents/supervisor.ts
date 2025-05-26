import { ChatOpenAI } from "@langchain/openai";
import { createSupervisor } from "@langchain/langgraph-supervisor";
import { tool } from "@langchain/core/tools";
import { z } from "zod";
const model = new ChatOpenAI({ modelName: "gpt-4o" });
import { jiraInteractorAgent } from "./jira_interactor";
import { notificationSenderAgent } from "./notification_sender";
import { loadInstructionFromFile } from "../util/loadPrompt";
// Create supervisor workflow
const workflow = createSupervisor({
  agents: [jiraInteractorAgent, notificationSenderAgent],
  llm: model,
  prompt: loadInstructionFromFile("jira_supervisor_prompt.txt"),
   
});

