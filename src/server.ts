import express from 'express';
import { Request, Response } from 'express';
import { HumanMessage } from '@langchain/core/messages';
import { createGraph } from './agents/graph';
let agent= null;
// agent.debug = true; // Enable debug mode for the agent
const app = express();
const port = 3000; // You can choose any port

// Middleware to parse JSON bodies (optional, but good practice for POST/PUT requests)
app.use(express.json());

// Define the /message GET endpoint
app.get('/message',async (req: Request, res: Response) => {

    // console.log(agent.odeType)
    // console.log(agent.getName())
    // console.log(agent.nodes)


    try {
        const query=req.body.query;
        // Call the agent with the request body
        const input = {
            messages: [new HumanMessage(query)],
        }
        
        const result = await agent.invoke(input);
        console.log('Agent response:', result);

         const lastMessage = result.messages[result.messages.length - 1];
        // Send the agent's response back to the client
        res.status(200).json(lastMessage.content);
    } catch (error) {
        console.error('Error invoking agent:', error);
        res.status(500).json({ error: 'An error occurred while processing your request.' });
    }
});

// Start the server
app.listen(port, async() => {
    agent =await createGraph();
    agent.debug = true; // Enable debug mode for the agent
    console.log("Agent initialized successfully");
    // console.log(agent.NodeType)
    // console.log(agent.getName())
    // console.log(agent.nodes)
    
  console.log(`Server is running on http://localhost:${port}`);
});

