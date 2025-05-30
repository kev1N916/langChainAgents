import { BinaryOperatorAggregate, END, START, StateDefinition, StateGraph, StateType, UpdateType } from "@langchain/langgraph";
import { AppState } from "./appState";
import { ChatGoogleGenerativeAI } from "@langchain/google-genai";
import { createSupervisor } from "./supervisor";
import { ChatOpenAI } from "@langchain/openai";
import dotenv from "dotenv";
import { notifierNode } from "./notifierAgent";
import { jiraNode } from "./jiraAgent";
import { summarizerNode } from "./summarizer";
import { BaseMessage } from "@langchain/core/messages";
dotenv.config();

// Ensure GOOGLE_API_KEY is loaded from environment variables
const googleApiKey = process.env.GOOGLE_API_KEY;

class Graph {
    private llm: ChatGoogleGenerativeAI
    private graph: StateGraph<{ 
        messages: BinaryOperatorAggregate<BaseMessage[], BaseMessage[]>; 
        team_members: BinaryOperatorAggregate<string[], string[]>; 
        next: BinaryOperatorAggregate<string, string>; 
        instructions: BinaryOperatorAggregate<string, string>; }, 
        StateType<{ 
            messages: BinaryOperatorAggregate<BaseMessage[], BaseMessage[]>; 
            team_members: BinaryOperatorAggregate<string[], string[]>; 
            next: BinaryOperatorAggregate<string, string>; 
            instructions: BinaryOperatorAggregate<string, string>; 
        }>, 
        UpdateType<{ 
        messages: BinaryOperatorAggregate<BaseMessage[], BaseMessage[]>; 
        team_members: BinaryOperatorAggregate<string[], string[]>; 
        next: BinaryOperatorAggregate<string, string>; 
        instructions: BinaryOperatorAggregate<string, string>; }>, 
        "__start__", { 
            messages: BinaryOperatorAggregate<BaseMessage[], BaseMessage[]>; 
            team_members: BinaryOperatorAggregate<string[], string[]>; 
            next: BinaryOperatorAggregate<string, string>; 
            instructions: BinaryOperatorAggregate<string, string>; 
        }, 
        { messages: BinaryOperatorAggregate<BaseMessage[], BaseMessage[]>; 
            team_members: BinaryOperatorAggregate<string[], string[]>; 
            next: BinaryOperatorAggregate<string, string>; 
            instructions: BinaryOperatorAggregate<string, string>; 
        }, StateDefinition>


    constructor() {
        this.llm = new ChatGoogleGenerativeAI({
            model: "gemini-2.0-flash", // Specify the Gemini 2.0 Flash model
            apiKey: googleApiKey, // Pass the API key loaded from environment variables
        });
        this.graph=new StateGraph(AppState)
    }

    public addNode(nodeName:string,node:any ){

        this.graph.addNode(nodeName,node)

    }

    public addEdge(startNode:any,endNode:any ){

        this.graph.addEdge(startNode,endNode)

    }
}


// Initialize the Gemini 2.0 Flash model
// const llm = new ChatGoogletiveAI({
//     model: "gemini-2.0-flash", // Specify the Gemini 2.0 Flash model
//     apiKey: googleApiKey, // Pass the API key loaded from environment variables
// });

const llm =new ChatOpenAI({
        modelName: "gpt-4o",
        apiKey: "",
        configuration: {
            baseURL: "http://prod0-intuitionx-llm-router-v2.sprinklr.com/chat-completion",
            defaultHeaders: {
                "Content-Type": "application/json"
            }
        },
        modelKwargs: {
            client_identifier: "spr-ui-dev"
        }
    });

const createGraph = async () => {

    const supervisorAgent = await createSupervisor(llm);

    const researchGraph = new StateGraph(AppState)
        .addNode("Notifier", notifierNode)
        .addNode("supervisor", supervisorAgent)
        .addNode("Jira", jiraNode)
        .addNode("Summarizer", summarizerNode)
        .addEdge("Jira", "supervisor")
        .addEdge("Notifier", "supervisor")
        .addEdge("Summarizer", "supervisor")
        .addConditionalEdges("supervisor", (x) => x.next, {
            Jira: "Jira",
            Notifier: "Notifier",
            Summarizer: "Summarizer",
            FINISH: END,
        })
        .addEdge(START, "supervisor");

    const researchChain = researchGraph.compile();
    return researchChain

};

export { createGraph };