import { FC, ReactNode, useEffect, useState } from "react";
import { Notefication } from "../../types";
import { noteficationContext } from "./noteficationContext";
import { subscribeEvent } from "../../utils/subscribeEvent";

export const NoteficationContextProvider: FC<{ children: ReactNode }> = ({
  children,
}) => {
  const [notefications, setNotefications] = useState<Notefication[]>([]);

  useEffect(() => {
    return subscribeEvent<Notefication>({
      url: "/api/notefications/sse",
      onEvent: (newNotefication) => {
        setNotefications((prev) => [newNotefication, ...prev]);
      },
    });
  }, []);

  const setNewNotefications = (arr: Notefication[]) => {
    setNotefications(arr);
  };

  return (
    <noteficationContext.Provider
      value={{
        notefications,
        setNotefications: setNewNotefications,
      }}
    >
      {children}
    </noteficationContext.Provider>
  );
};
