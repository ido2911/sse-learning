import { Notefication } from "@repo/dto";
import { createContext, useContext } from "react";

interface NoteficationContext {
  notefications: Notefication[];
  setNotefications: (arr: Notefication[]) => void;
}

export const noteficationContext = createContext<NoteficationContext>({
  notefications: [],
  setNotefications: () => {},
});

export const useNoteficationContext = () => useContext(noteficationContext);
