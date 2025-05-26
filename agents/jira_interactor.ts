import { ChatOpenAI } from "@langchain/openai";
import { createReactAgent } from "@langchain/langgraph/prebuilt";
import {getIssuesAndComments } from "./tools/agent_tools";
import { loadInstructionFromFile } from "../util/loadPrompt";

const model = new ChatOpenAI({ modelName: "gpt-4o" });
const jiraInteractorAgent = createReactAgent({
  llm: model,
  tools: [getIssuesAndComments],
  name: "jira_interactor",
  prompt: loadInstructionFromFile("jira_interactor_prompt.txt"),
});


export { jiraInteractorAgent };