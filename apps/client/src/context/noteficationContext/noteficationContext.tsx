import { createContext, useContext } from "react";
import { Notefication } from "../../types";

interface NoteficationContext {
  notefications: Notefication[];
  setNotefications: (arr: Notefication[]) => void;
}

export const noteficationContext = createContext<NoteficationContext>({
  notefications: [],
  setNotefications: () => {},
});

export const useNoteficationContext = () => useContext(noteficationContext);
