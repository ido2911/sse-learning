import { FC } from "react";
import { UserContextProvider } from "./context/userContext/userContextProvider";
import { Home } from "./Components/Home";
import { NoteficationContextProvider } from "./context/noteficationContext/noteficationContextProvider";

export const App: FC = () => {
  return (
    <UserContextProvider>
      <NoteficationContextProvider>
        <Home />
      </NoteficationContextProvider>
    </UserContextProvider>
  );
};
