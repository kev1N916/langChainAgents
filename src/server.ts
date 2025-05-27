import express from 'express';
import { Request, Response } from 'express';
import { supervisor } from './agents/supervisor';

const agent = supervisor.compile()

const app = express();
const port = 3000; // You can choose any port

// Middleware to parse JSON bodies (optional, but good practice for POST/PUT requests)
app.use(express.json());

// Define the /message GET endpoint
app.get('/message',async (req: Request, res: Response) => {

    try {
        // Call the agent with the request body
        const result = await agent.invoke(req.body);
        console.log('Agent response:', result);
        
        // Send the agent's response back to the client
        res.status(200).json(result);
    } catch (error) {
        console.error('Error invoking agent:', error);
        res.status(500).json({ error: 'An error occurred while processing your request.' });
    }
});

// Start the server
app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});