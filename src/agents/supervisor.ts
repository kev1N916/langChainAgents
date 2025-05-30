import { z } from "zod";
import { AIMessage } from "@langchain/core/messages";
import {
  ChatPromptTemplate,
  MessagesPlaceholder,
} from "@langchain/core/prompts";
import { Runnable } from "@langchain/core/runnables";
import { BaseChatModel } from "@langchain/core/language_models/chat_models";
import { convertToOpenAITool } from "@langchain/core/utils/function_calling";
import { ChatOpenAI } from "@langchain/openai";

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
      llm.bindTools([convertToOpenAITool(routeTool)], {
        tool_choice: "route",
      }),
    )
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


const createSupervisor = async (llm: BaseChatModel): Promise<Runnable> => {
    const supervisorAgent = await createTeamSupervisor(
        llm,
        "You are a supervisor tasked with managing a conversation between the" +
        " following workers:  {team_members}. Given the following user request," +
        " respond with the worker to act next. Each worker will perform a" +
        " task and respond with their results and status. When finished," +
        " respond with FINISH. \n" +
        " Select strategically to minimize the number of steps taken.",
        ["Jira", "Notifier","Summarizer"], // These are the wrker names the supervisor will manage
    );

    return supervisorAgent;
};

export {createSupervisor};