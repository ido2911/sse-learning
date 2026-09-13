import "dotenv/config";
import express, { Request, Response } from "express";
import cors from "cors";
import { Notefication } from "./types/types.js";

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());
const activeClients = new Set<Response>();

app.get("/", (req: Request, res: Response) => {
  res.json({ message: "Hello from server" });
});

app.get("/sse", (req: Request, res: Response) => {
  // Set required headers for SSE
  res.setHeader("Content-Type", "text/event-stream");
  res.setHeader("Cache-Control", "no-cache");
  res.setHeader("Connection", "keep-alive");
  res.flushHeaders(); // Flush headers immediately to establish connection

  // Send updates periodically
  const intervalId = setInterval(() => {
    const payload = { time: new Date().toISOString(), message: "Server ping" };

    // Format must follow "data: <content>\n\n"
    res.write(`data: ${JSON.stringify(payload)}\n\n`);
  }, 1000);

  // Clean up resource allocations when the client disconnects
  req.on("close", () => {
    clearInterval(intervalId);
    res.end();
  });
});

app.get("/api/notefications/sse", (req, res) => {
  res.setHeader("Content-Type", "text/event-stream");
  res.setHeader("Cache-Control", "no-cache");
  res.setHeader("Connection", "keep-alive");
  res.flushHeaders();

  activeClients.add(res);

  const heartbeatId = setInterval(() => {
    res.write(": heartbeat\n\n");
  }, 15000);

  req.on("close", () => {
    clearInterval(heartbeatId);
    activeClients.delete(res);
    res.end();
  });
});

app.post("/api/notefications", (req, res) => {
  const { user, time, message } = req.body;

  if (!message) {
    return res.status(400).json({ error: "Message is required" });
  }

  const notification: Notefication = {
    user,
    message,
    time,
  };

  // Push to all active SSE subscribers
  const payload = `data: ${JSON.stringify(notification)}\n\n`;
  activeClients.forEach((client) => client.write(payload));

  return res.status(201).json({ notification });
});

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
