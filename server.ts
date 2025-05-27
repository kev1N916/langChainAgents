// src/server.ts
import * as net from 'net'; // Import the net module for TCP networking
import { supervisor } from './agents/supervisor';
const PORT: number = 3000; // The port on which the server will listen
const HOST: string = '127.0.0.1'; // The IP address the server will listen on


const app = supervisor.compile()
// Create a new TCP server instance
const server: net.Server = net.createServer((socket: net.Socket) => {
    // 'connection' event: Fired when a new client connects to the server
    console.log(`Client connected: ${socket.remoteAddress}:${socket.remotePort}`);

    // 'data' event: Fired when data is received from the client
    socket.on('data', async (data: Buffer) => {
        const receivedData: string = data.toString().trim();
        console.log(`Received from client ${socket.remoteAddress}:${socket.remotePort}: ${receivedData}`);

        const result = await app.invoke({
            messages: [
                {
                    role: "user",
                    content: "what's the combined headcount of the FAANG companies in 2024??"
                }
            ]
        });        // Echo the received data back to the client
        socket.write(`Server received: ${receivedData}\n`);

        // Example: Close connection if client sends "exit"
        if (receivedData.toLowerCase() === 'exit') {
            console.log(`Client ${socket.remoteAddress}:${socket.remotePort} requested exit. Closing connection.`);
            socket.end('Goodbye!\n'); // Sends data and then closes the socket
        }
    });

    // 'end' event: Fired when the other end of the socket sends a FIN packet,
    // indicating that it is ending the connection.
    socket.on('end', () => {
        console.log(`Client disconnected: ${socket.remoteAddress}:${socket.remotePort}`);
    });

    // 'error' event: Fired when an error occurs on the socket
    socket.on('error', (err: Error) => {
        console.error(`Socket error for ${socket.remoteAddress}:${socket.remotePort}: ${err.message}`);
    });

    // 'close' event: Fired once the socket is fully closed.
    socket.on('close', (hadError: boolean) => {
        console.log(`Connection to ${socket.remoteAddress}:${socket.remotePort} closed. Had error: ${hadError}`);
    });
});

// 'error' event: Fired when an error occurs on the server itself (e.g., port in use)
server.on('error', (err: Error) => {
    console.error(`Server error: ${err.message}`);
    if ((err as NodeJS.ErrnoException).code === 'EADDRINUSE') {
        console.error(`Port ${PORT} is already in use. Please close the other application or choose a different port.`);
    }
    process.exit(1); // Exit with an error code
});

// Start listening for incoming connections
server.listen(PORT, HOST, () => {
    console.log(`TCP server listening on ${HOST}:${PORT}`);
    console.log('To connect, use: nc 127.0.0.1 3000'); // Example for netcat
});

// Handle graceful shutdown
process.on('SIGINT', () => {
    console.log('\nSIGINT received. Shutting down server...');
    server.close(() => {
        console.log('Server gracefully shut down.');
        process.exit(0);
    });
});