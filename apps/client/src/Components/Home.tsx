import { FC, useEffect, useState } from "react";
import { appFetch } from "../utils/appFetch";
import { subscribeEvent } from "../utils/subscribeEvent";
import { useUserContext } from "../context/userContext/userContext";
import { Dropdown } from "./Dropdown";
import { NoteficationForm } from "./NoteficationForm";
import { useNoteficationContext } from "../context/noteficationContext/noteficationContext";
import { NoteficationComponent } from "./NoteficationComponent";

interface SSEdata {
  time: Date;
  message: string;
}

export const Home: FC = () => {
  const { currentUser } = useUserContext();
  const { notefications } = useNoteficationContext();
  const [message, setMessage] = useState<string>("");
  const [sseData, setSseData] = useState<SSEdata>();
  const { users, setCurrentUser } = useUserContext();
  const [options, setOptions] = useState<string[]>([]);

  useEffect(() => {
    setOptions(users.map(({ name }) => name));
  }, [users]);

  useEffect(() => {
    const fetchMessage = async () => {
      const fetched = await appFetch<{ message: string }>({ url: "/" });

      if (fetched.data) {
        setMessage(fetched.data.message);
      }
    };

    fetchMessage();
  }, []);

  useEffect(() => {
    return subscribeEvent<SSEdata>({
      url: "/sse",
      onEvent: (data) => setSseData(data),
      onError: (error) => console.log("sse error: ", error),
    });
  }, []);

  return (
    <>
      <Dropdown options={options} onClick={setCurrentUser} />
      <div>{message}</div>
      <div>current user: {currentUser.name}</div>
      <div>sse: {JSON.stringify(sseData)}</div>
      <NoteficationForm key={currentUser.name} />

      <div>
        notefications:
        {notefications.length &&
          notefications.map((notefication) => (
            <NoteficationComponent notefication={notefication} />
          ))}
      </div>
    </>
  );
};
