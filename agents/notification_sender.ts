import { ChatOpenAI } from "@langchain/openai";
import { createReactAgent } from "@langchain/langgraph/prebuilt";
import { sendEmail } from "./tools/agent_tools";
const model = new ChatOpenAI({ modelName: "gpt-4o" });

const notificationSenderAgent = createReactAgent({
  llm: model,
  tools: [sendEmail],
  name: "notifier",
  prompt: "You are a math expert. Always use one tool at a time."
});

export { notificationSenderAgent };