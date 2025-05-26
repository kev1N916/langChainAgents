import { ChatOpenAI } from "@langchain/openai";
import { createReactAgent } from "@langchain/langgraph/prebuilt";
import {getIssuesAndComments } from "./tools/agent_tools";

const model = new ChatOpenAI({ modelName: "gpt-4o" });
const jiraInteractorAgent = createReactAgent({
  llm: model,
  tools: [getIssuesAndComments],
  name: "jira_interactor",
  prompt: "You are a world class researcher with access to web search. Do not do any math."
});


export { jiraInteractorAgent };