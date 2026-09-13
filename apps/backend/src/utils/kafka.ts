import { KafkaClient, Notefication } from "@repo/dto";
import { Kafka } from "kafkajs";

const topic = "notifications.created";

type NotificationCreatedEvent = Omit<Notefication, "time"> & {
  time: string;
};

export const createNotificationMessaging = async (
  brokers: string[],
  onNotification: (notification: Notefication) => void,
): Promise<KafkaClient> => {
  const kafka = new Kafka({
    clientId: "sse-learning-backend",
    brokers
  });

  const producer = kafka.producer();
  const consumer = kafka.consumer({
    groupId: "sse-notification-gateway",
  });

  const admin = kafka.admin();
  await admin.connect();

  try {
    await admin.createTopics({
      waitForLeaders: true,
      topics: [
        {
          topic,
          numPartitions: 3,
          replicationFactor: 1,
        },
      ],
    });
  } finally {
    await admin.disconnect();
  }

  await producer.connect();

  await consumer.connect();
  await consumer.subscribe({ topic, fromBeginning: false });

  await consumer.run({
    eachMessage: async ({ message }) => {
      if (!message.value) return;

      const event = JSON.parse(
        message.value.toString(),
      ) as NotificationCreatedEvent;

      onNotification({
        ...event,
        time: new Date(event.time),
      });
    },
  });

  return {
    publish: async (notification: Notefication) => {
      await producer.send({
        topic,
        messages: [
          {
            key: notification.user,
            value: JSON.stringify(notification),
          },
        ],
      });
    },

    disconnect: async () => {
      await consumer.disconnect();
      await producer.disconnect();
    },
  };
};
