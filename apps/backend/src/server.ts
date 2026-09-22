import "dotenv/config";
import express, { Request, Response } from "express";
import cors from "cors";
import { Notefication } from "@repo/dto";
import { createKafkaClient } from "@repo/utils";

const createPayload = (payload: unknown): string =>
  `data: ${JSON.stringify(payload)}\n\n`;

const startServer = async () => {
  const PORT = process.env.PORT || 3000;
  const NOTEFICATION_TOPIC = "notefications-events";

  const app = express();

  app.use(cors());
  app.use(express.json());

  const brokers = (process.env.KAFKA_BROKERS ?? "localhost:9092")
    .split(",")
    .map((broker) => broker.trim());

  const activeClients = new Set<Response>();

  const kafka = await createKafkaClient({ clientId: "server", brokers });
  await kafka.ensureTopicsExist([NOTEFICATION_TOPIC]);

  const producer = kafka.createProducer();
  const consumer = kafka.createConsumer({
    groupId: "notefication-processing",
  });

  consumer.subscribeAndListen<Notefication>({
    topic: NOTEFICATION_TOPIC,
    onMessage: ({ data }) => {
      console.log("DATA: ", data);
      activeClients.forEach((res) => res.write(createPayload(data)));
    },
  });

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
      const payload = {
        time: new Date().toISOString(),
        message: "Server ping",
      };

      // Format must follow "data: <content>\n\n"
      res.write(createPayload(payload));
    }, 1000);

    // Clean up resource allocations when the client disconnects
    req.on("close", () => {
      clearInterval(intervalId);
      res.end();
    });
  });

  app.get("/api/notefications/sse", async (req, res) => {
    res.setHeader("Content-Type", "text/event-stream");
    res.setHeader("Cache-Control", "no-cache");
    res.setHeader("Connection", "keep-alive");
    res.flushHeaders();

    const heartbeatId = setInterval(() => {
      res.write(": heartbeat\n\n");
    }, 15000);

    activeClients.add(res);

    req.on("close", () => {
      clearInterval(heartbeatId);
      activeClients.delete(res);
      res.end();
    });
  });

  app.post("/api/notefications", async (req, res) => {
    const { user, time, message } = req.body;

    if (!message) {
      return res.status(400).json({ error: "Message is required" });
    }

    const notification: Notefication = {
      id: crypto.randomUUID(),
      user,
      message,
      time: new Date(time),
    };

    await producer.send<Notefication>({
      topic: NOTEFICATION_TOPIC,
      messages: [{ key: notification.id, value: notification }],
    });

    return res.status(201).json({ notification });
  });

  const server = app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
  });

  const shutdown = async () => {
    console.log("shutting down server");

    server.close(async () => {
      await producer.disconnect();
      await consumer.disconnect();
      console.log("killed producer and consumer");

      process.exit(0);
    });
  };

  process.on("SIGINT", () => shutdown);
  process.on("SIGTERM", () => shutdown);
};

startServer();
