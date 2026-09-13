import { Notefication } from "@repo/dto";

export type NotificationCreatedEvent = Omit<Notefication, "time"> & {
  time: string;
};
