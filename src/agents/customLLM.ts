import { ChatOpenAI } from "@langchain/openai";
import { BaseLLM } from "@langchain/core/language_models/llms";
import { BaseChatModel } from "@langchain/core/language_models/chat_models";
import { BaseMessage, HumanMessage, SystemMessage, AIMessage } from "@langchain/core/messages";
import { CallbackManagerForLLMRun } from "@langchain/core/callbacks/manager";
import { ChatResult, ChatGeneration } from "@langchain/core/outputs";
import { LLMResult, Generation } from "@langchain/core/outputs";

// Method 1: Using ChatOpenAI with custom base URL (Recommended if OpenAI-compatible)
function createCustomChatOpenAI() {
    return new ChatOpenAI({
        modelName: "gpt-4o",
        configuration: {
            baseURL: "http://prod0-intuitionx-llm-router-v2.sprinklr.com",
            defaultHeaders: {
                "Content-Type": "application/json"
            }
        },
        modelKwargs: {
            client_identifier: "spr-ui-dev"
        }
    });
}

// // Method 2: Custom LLclass exendig BaseLLM
// interface SprinklrLLMParams {
//     endpointUrl?: string;
//     modelName?: string;
//     clientIdentifier?: string;
//     timeout?: number;
// }

// export class CustomSprinklrLLM extends BaseLLM {
//     private endpointUrl: string;
//     private modelName: string;
//     private clientIdentifier: string;
//     private timeout: number;

//     constructor(params: SprinklrLLMParams = {}) {
//         super({});
//         this.endpointUrl = params.endpointUrl || "http://prod0-intuitionx-llm-router-v2.sprinklr.com/chat-completion";
//         this.modelName = params.modelName || "gpt-4o";
//         this.clientIdentifier = params.clientIdentifier || "spr-ui-dev";
//         this.timeout = params.timeout || 30000;
//     }

//     _llmType(): string {
//         return "custom_sprinklr";
//     }

//     async _generate(
//         prompts: string[],
//         options?: { stop?: string[] },
//         runManager?: CallbackManagerForLLMRun
//     ): Promise<LLMResult> {
//         const generations: Generation[][] = [];

//         for (const prompt of prompts) {
//             try {
//                 const response = await this.callAPI(prompt, options?.stop);
//                 generations.push([{ text: response }]);
//             } catch (error) {
//                 throw new Error(`Error calling Sprinklr LLM: ${error}`);
//             }
//         }

//         return { generations };
//     }

//     private async callAPI(prompt: string, stop?: string[]): Promise<string> {
//         const payload = {
//             model: this.modelName,
//             messages: [
//                 { role: "user", content: prompt }
//             ],
//             client_identifier: this.clientIdentifier,
//             ...(stop && { stop })
//         };

//         const controller = new AbortController();
//         const timeoutId = setTimeout(() => controller.abort(), this.timeout);

//         try {
//             const response = await fetch(this.endpointUrl, {
//                 method: "POST",
//                 headers: {
//                     "Content-Type": "application/json"
//                 },
//                 body: JSON.stringify(payload),
//                 signal: controller.signal
//             });

//             clearTimeout(timeoutId);

//             if (!response.ok) {
//                 throw new Error(`HTTP error! status: ${response.status}`);
//             }

//             const result = await response.json();
            
//             // Adjust this based on your API's response structure
//             // Assuming OpenAI-like response format
//             return result?.choices?.[0]?.message?.content || "";
            
//         } catch (error) {
//             clearTimeout(timeoutId);
//             throw error;
//         }
//     }
// }

// // Method 3: Custom Chat Model extending BaseChatModel
// interface SprinklrChatModelParams {
//     endpointUrl?: string;
//     modelName?: string;
//     clientIdentifier?: string;
//     timeout?: number;
// }

// export class CustomSprinklrChatModel extends BaseChatModel {
//     private endpointUrl: string;
//     private modelName: string;
//     private clientIdentifier: string;
//     private timeout: number;

//     constructor(params: SprinklrChatModelParams = {}) {
//         super({});
//         this.endpointUrl = params.endpointUrl || "http://prod0-intuitionx-llm-router-v2.sprinklr.com/chat-completion";
//         this.modelName = params.modelName || "gpt-4o";
//         this.clientIdentifier = params.clientIdentifier || "spr-ui-dev";
//         this.timeout = params.timeout || 30000;
//     }

//     _llmType(): string {
//         return "custom_sprinklr_chat";
//     }

//     async _generate(
//         messages: BaseMessage[],
//         options?: { stop?: string[] },
//         runManager?: CallbackManagerForLLMRun
//     ): Promise<ChatResult> {
//         try {
//             const response = await this.callChatAPI(messages, options?.stop);
            
//             const message = new AIMessage(response);
//             const generation = new ChatGeneration({ message });
//             return new ChatResult({ generations: [generation] });
            
//         } catch (error) {
//             throw new Error(`Error calling Sprinklr Chat LLM: ${error}`);
//         }
//     }

//     private async callChatAPI(messages: BaseMessage[], stop?: string[]): Promise<string> {
//         // Convert LangChain messages to API format
//         const apiMessages = messages.map(msg => ({
//             role: this.getMessageRole(msg),
//             content: msg.content
//         }));

//         const payload = {
//             model: this.modelName,
//             messages: apiMessages,
//             client_identifier: this.clientIdentifier,
//             ...(stop && { stop })
//         };

//         const controller = new AbortController();
//         const timeoutId = setTimeout(() => controller.abort(), this.timeout);

//         try {
//             const response = await fetch(this.endpointUrl, {
//                 method: "POST",
//                 headers: {
//                     "Content-Type": "application/json"
//                 },
//                 body: JSON.stringify(payload),
//                 signal: controller.signal
//             });

//             clearTimeout(timeoutId);

//             if (!response.ok) {
//                 throw new Error(`HTTP error! status: ${response.status}`);
//             }

//             const result = await response.json();
            
//             // Adjust this based on your API's response structure
//             return result?.choices?.[0]?.message?.content || "";
            
//         } catch (error) {
//             clearTimeout(timeoutId);
//             throw error;
//         }
//     }

//     private getMessageRole(message: BaseMessage): string {
//         if (message instanceof SystemMessage) return "system";
//         if (message instanceof HumanMessage) return "user";
//         if (message instanceof AIMessage) return "assistant";
//         return "user"; // default fallback
//     }
// }

// Usage examples
// async function demonstrateUsage() {
//     console.log("=== Method 1: Using ChatOpenAI (if OpenAI-compatible) ===");
//     try {
//         const llm1 = createCustomChatOpenAI();
//         const messages1 = [
//             new SystemMessage("You are a helpful assistant."),
//             new HumanMessage("Hello!")
//         ];
//         const response1 = await llm1.invoke(messages1);
//         console.log(`Response: ${response1.content}`);
//     } catch (error) {
//         console.log(`Method 1 failed: ${error}`);
//     }

//     console.log("\n=== Method 2: Custom LLM Class ===");
//     try {
//         const llm2 = new CustomSprinklrLLM();
//         const response2 = await llm2.invoke("Hello!");
//         console.log(`Response: ${response2}`);
//     } catch (error) {
//         console.log(`Method 2 failed: ${error}`);
//     }

    // console.log("\n=== Method 3: Custom Chat Model ===");
    // try {
    //     const llm3 = new CustomSprinklrChatModel();
    //     const messages3 = [
    //         new SystemMessage("You are a helpful assistant."),
    //         new HumanMessage("Hello!")
    //     ];
    //     const response3 = await llm3.invoke(messages3);
    //     console.log(`Response: ${response3.content}`);
    // } catch (error) {
    //     console.log(`Method 3 failed: ${error}`);
    // }
// }

// // Integration with LangChain chains example
// import { LLMChain } from "langchain/chains";
// import { PromptTemplate } from "@langchain/core/prompts";

// async function chainExample() {
//     const llm = new CustomSprinklrLLM();
    
//     const prompt = PromptTemplate.fromTemplate(
//         "Answer the following question: {question}"
//     );
    
//     const chain = new LLMChain({ llm, prompt });
    
//     try {
//         const result = await chain.call({ question: "What is the capital of France?" });
//         console.log("Chain result:", result.text);
//     } catch (error) {
//         console.error("Chain error:", error);
//     }
// }

// // For chat chains
// import { ConversationChain } from "langchain/chains";
// import { BufferMemory } from "langchain/memory";

// async function chatChainExample() {
//     const chatModel = new CustomSprinklrChatModel();
    
//     const memory = new BufferMemory();
//     const chain = new ConversationChain({
//         llm: chatModel,
//         memory: memory,
//     });
    
//     try {
//         const result1 = await chain.call({ input: "Hi, I'm John!" });
//         console.log("Response 1:", result1.response);
        
//         const result2 = await chain.call({ input: "What's my name?" });
//         console.log("Response 2:", result2.response);
//     } catch (error) {
//         console.error("Chat chain error:", error);
//     }
// }

// const result =await demonstrateUsage()
// Export everything fodr use
export {
    createCustomChatOpenAI,
};