import {
  ConsumerSubscribeConfig,
  IConsumer,
  IKafkaClient,
  IProducer,
  ProducerMessage,
  ProducerSendConfig,
} from "@repo/dto";
import {
  ConsumerConfig,
  ITopicConfig,
  Kafka,
  KafkaConfig,
  ProducerConfig,
} from "kafkajs";

const createTopic = (topic: string): ITopicConfig => ({
  topic,
  numPartitions: 3,
  replicationFactor: 1,
});

export const createKafkaClient = (config: KafkaConfig): IKafkaClient => {
  const kafka = new Kafka(config);

  const createProducer = (config?: ProducerConfig): IProducer => {
    const producer = kafka.producer(config);
    let isConnected = false;

    const connect = async (): Promise<void> => {
      if (!isConnected) {
        await producer.connect();
        isConnected = true;
      }
    };

    const disconnect = async (): Promise<void> => {
      if (isConnected) {
        await producer.disconnect();
        isConnected = false;
      }
    };

    const formatMessages = <T>(messages: ProducerMessage<T>[]) => {
      return messages.map(({ key, value, headers }) => ({
        key,
        value: JSON.stringify(value),
        headers,
      }));
    };

    return {
      send: async <T>({ topic, messages }: ProducerSendConfig<T>) => {
        await connect();
        await producer.send({ topic, messages: formatMessages(messages) });
      },
      disconnect,
    };
  };

  const createConsumer = (config: ConsumerConfig): IConsumer => {
    const consumer = kafka.consumer(config);

    return {
      subscribeAndListen: async <T>({
        topic,
        onMessage,
        fromBeginning,
      }: ConsumerSubscribeConfig<T>) => {
        await consumer.subscribe({ topic, fromBeginning });

        await consumer.run({
          eachMessage: async (payload) => {
            const binaryData = payload.message?.value || "";
            const data = JSON.parse(binaryData.toString("utf-8")) as T;

            // imagine we have a schema for this
            await onMessage({ data, payload });
          },
        });
      },
      disconnect: () => consumer.disconnect(),
    };
  };

  const ensureTopicsExist = async (topics: string[]) => {
    const admin = kafka.admin();

    try {
      await admin.connect();
      const existingTopics = await admin.listTopics();
      const missingTopics = topics.filter(
        (topic) => !existingTopics.includes(topic),
      );

      if (missingTopics.length > 0) {
        await admin.createTopics({
          topics: topics.map(createTopic),
          waitForLeaders: true,
        });
      }
    } finally {
      await admin.disconnect();
    }
  };

  return {
    createProducer,
    createConsumer,
    ensureTopicsExist,
  };
};
