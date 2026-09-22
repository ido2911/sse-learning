import {
  Consumer,
  ConsumerConfig,
  EachMessagePayload,
  KafkaConfig,
  Producer,
  ProducerConfig,
} from "kafkajs";

export type KafkaFactoryProps = KafkaConfig;

export interface ProducerMessage<T> {
  key?: string;
  value: T;
  headers?: Record<string, string>;
}

export interface ProducerSendConfig<T> {
  topic: string;
  messages: ProducerMessage<T>[];
}

export interface IProducer {
  send: <T>(config: ProducerSendConfig<T>) => Promise<void>;
  disconnect: () => Promise<void>;
}

export interface ConsumerOnMessageConfig<T> {
  data: T;
  payload: EachMessagePayload;
}

export interface ConsumerSubscribeConfig<T> {
  topic: string;
  onMessage: (config: ConsumerOnMessageConfig<T>) => Promise<void> | void;
  fromBeginning?: boolean;
}

export interface IConsumer {
  subscribeAndListen: <T>(config: ConsumerSubscribeConfig<T>) => Promise<void>;
  disconnect: () => Promise<void>;
}

export interface IKafkaClient {
  createProducer: (config?: ProducerConfig) => IProducer;
  createConsumer: (config: ConsumerConfig) => IConsumer;
  ensureTopicsExist: (topics: string[]) => void;
}
