import { FC, ReactNode, useState } from "react";
import { userContext } from "./userContext";
import { User } from "@repo/dto";

export const UserContextProvider: FC<{ children: ReactNode }> = ({
  children,
}) => {
  const [users, _setUsers] = useState<User[]>([
    { name: "ido" },
    { name: "brano" },
    { name: "gal" },
    { name: "emma" },
  ]);
  const [currentUser, setCurrentUser] = useState<User>(users[0]);

  const setNewCurrentUser = (name: string) => {
    const newUser = users.find((user) => user.name === name);

    if (!newUser) {
      setCurrentUser(users[0]);
    }

    setCurrentUser(newUser);
  };

  return (
    <userContext.Provider
      value={{
        users,
        currentUser,
        setCurrentUser: setNewCurrentUser,
      }}
    >
      {children}
    </userContext.Provider>
  );
};
