import { FC } from "react";
import { Notefication } from "../types";

interface NoteficationProps {
    notefication: Notefication
}

export const NoteficationComponent: FC<NoteficationProps> = ({notefication}) => {
    return (
        <div>[{new Date(notefication.time).toISOString()}] {notefication.user}: {notefication.message}</div>
    )
}