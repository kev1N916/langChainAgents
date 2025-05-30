import { HumanMessage, BaseMessage, SystemMessage, AIMessage } from "@langchain/core/messages";
import { Runnable } from "@langchain/core/runnables";
import { StructuredToolInterface } from "@langchain/core/tools";
import { MessagesAnnotation } from "@langchain/langgraph";

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

export { agentStateModifier, runAgentNode };
// export * from "./createNodes.js";