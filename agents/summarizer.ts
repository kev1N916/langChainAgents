import { ChatOpenAI } from "@langchain/openai";
import { createReactAgent } from "@langchain/langgraph/prebuilt";
import {loadInstructionFromFile} from "../util/loadPrompt";
const model = new ChatOpenAI({ modelName: "gpt-4o" });

const summarizerAgent = createReactAgent({
  llm: model,
  tools: [],
  name: "summarizer",
  prompt: loadInstructionFromFile("summarizer_prompt.txt"),
});

export { summarizerAgent };