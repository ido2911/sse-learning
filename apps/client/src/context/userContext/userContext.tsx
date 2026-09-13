import { User } from "@repo/dto";
import { createContext, useContext } from "react";

interface UserContext {
  users: User[];
  currentUser: User;
  setCurrentUser: (name: string) => void;
}

export const userContext = createContext<UserContext>({
  users: [],
  currentUser: null,
  setCurrentUser: () => {},
});

export const useUserContext = () => useContext(userContext);
