import { z } from "zod";
import { HumanMessage, BaseMessage, SystemMessage, AIMessage } from "@langchain/core/messages";
import {
  ChatPromptTemplate,
  MessagesPlaceholder,
} from "@langchain/core/prompts";
import { Runnable } from "@langchain/core/runnables";
import { StructuredToolInterface } from "@langchain/core/tools";
import { MessagesAnnotation } from "@langchain/langgraph";
import { BaseChatModel } from "@langchain/core/language_models/chat_models";

const agentStateModifier = (
  systemPrompt: string,
  tools: StructuredToolInterface[],
  teamMembers: string[],
): ((state: typeof MessagesAnnotation.State) => BaseMessage[]) => {
  const toolNames = tools.map((t) => t.name).join(", ");
  const systemMsgStart = new SystemMessage(systemPrompt +
    "\nWork autonomously according to your specialty, using the tools available to you." +
    " Do not ask for clarification." +
    " Your other team members (and other teams) will collaborate with you with their own specialties." +
    ` You are chosen for a reason! You are one of the following team members: ${teamMembers.join(", ")}.`+
      `Remember, you individually can only use these tools: ${toolNames}` +
      "\n\nEnd if you have already completed the requested task. Communicate the work completed.");

  return (state: typeof MessagesAnnotation.State): any[] => 
    [systemMsgStart, ...state.messages];
}

async function runAgentNode(params: {
  state: any;
  agent: Runnable;
  name: string;
}) {
  const { state, agent, name } = params;
  const result = await agent.invoke({
    messages: state.messages,
  });

  console.log("Agent result:", result);
  const lastMessage = result.messages[result.messages.length - 1];
  console.log("Last message:", lastMessage);
  return {
    messages: [new HumanMessage({ content: lastMessage.content, name })],
  };
}

async function createTeamSupervisor(
  llm: BaseChatModel,
  systemPrompt: string,
  members: string[],
): Promise<Runnable> {

  const options = ["FINISH", ...members];

  const routeTool = {
    name: "route",
    description: "Select the next role.",
    schema: z.object({
      reasoning: z.string(),
      next: z.enum(["FINISH", ...members]),
      instructions: z.string().describe("The specific instructions of the sub-task the next role should accomplish."),
    })
  }

  let prompt = ChatPromptTemplate.fromMessages([
    ["system", systemPrompt],
    new MessagesPlaceholder("messages"),
    [
      "ai",
      "Given the conversation above, who should act next? Or should we FINISH? Select one of: {options}",
    ],
  ]);

  prompt = await prompt.partial({
    options: options.join(", "),
    team_members: members.join(", "),
  });

const supervisor = prompt
    .pipe(
      llm.bindTools([routeTool], {
        tool_choice: "route",
      }),
    )
    // Add a tap here to log x
    .pipe((x) => {
      return x as AIMessage
    })
    // select the first one
    .pipe((x) => (
     {
      next: x.tool_calls[0].args.next,
      instructions: x.tool_calls[0].args.instructions,
    }));

  return supervisor;
}

export { agentStateModifier, runAgentNode, createTeamSupervisor };
// export * from "./createNodes.js";