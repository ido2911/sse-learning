import { createContext, useContext } from "react";
import { User } from "../../types";

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
