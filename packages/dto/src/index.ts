export interface User {
  name: string;
}

export interface Notefication {
  user: string;
  time: Date;
  message: string;
}

export interface KafkaClient {
    publish: (notefication: Notefication) => void,
    disconnect: () => void
}
