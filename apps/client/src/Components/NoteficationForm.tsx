import { FC, useEffect, useState } from "react";
import { useForm, SubmitHandler } from "react-hook-form";
import { useUserContext } from "../context/userContext/userContext";
import { Notefication } from "../types";
import { appFetch } from "../utils/appFetch";

export const NoteficationForm: FC = () => {
  const { currentUser } = useUserContext();
  const [currentDate, setCurrentDate] = useState<Date>(new Date());

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentDate(new Date());
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<Notefication>({
    defaultValues: {
      user: currentUser.name,
      time: currentDate,
      message: "",
    },
  });

  const onSubmit: SubmitHandler<Notefication> = async (data) => {
    await appFetch<Notefication>({
      url: "/api/notefications",
      method: "POST",
      body: data,
    });
  };

  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      style={{
        display: "flex",
        flexDirection: "column",
        gap: "16px",
        width: "280px",
      }}>
      <div>
        <label style={{ display: "block", marginBottom: "4px" }}>Message</label>
        <textarea
          {...register("message", { required: "Message is required" })}
          style={{
            width: "100%",
            padding: "8px",
            borderRadius: "4px",
            border: "1px solid #ccc",
            boxSizing: "border-box",
          }}
        />
        {errors.message && (
          <span style={{ color: "red", fontSize: "12px" }}>
            {errors.message.message}
          </span>
        )}
      </div>

      <button
        type="submit"
        style={{
          padding: "8px 16px",
          backgroundColor: "#007bff",
          color: "#fff",
          border: "none",
          borderRadius: "4px",
          cursor: "pointer",
        }}>
        Submit
      </button>
    </form>
  );
};
