import { FC, useState } from "react";

interface DropdownProps {
  options: string[];
  onClick: (value: string) => void;
}

export const Dropdown: FC<DropdownProps> = ({ options, onClick }) => {
  const [isOpen, setIsOpen] = useState<boolean>(false);

  return (
    <nav
      style={{
        backgroundColor: "#222",
        padding: "10px 20px",
        display: "flex",
        alignItems: "center",
      }}
    >
      <div style={{ position: "relative" }}>
        <button
          onClick={() => setIsOpen(!isOpen)}
          style={{
            backgroundColor: "#444",
            color: "#fff",
            border: "none",
            padding: "8px 16px",
            fontSize: "14px",
            cursor: "pointer",
            borderRadius: "4px",
          }}
        >
          Menu {isOpen ? "▴" : "▾"}
        </button>

        {isOpen && (
          <ul
            style={{
              position: "absolute",
              top: "100%",
              left: 0,
              backgroundColor: "#fff",
              border: "1px solid #ccc",
              borderRadius: "4px",
              listStyle: "none",
              margin: "4px 0 0 0",
              padding: "4px 0",
              minWidth: "120px",
              boxShadow: "0 4px 6px rgba(0, 0, 0, 0.1)",
            }}
          >
            {options.map((option) => (
              <li
                key={option}
                style={{
                  padding: "8px 12px",
                  color: "#333",
                  cursor: "pointer",
                }}
                onClick={() => {
                  onClick(option);
                  setIsOpen(false);
                }}
              >
                {option}
              </li>
            ))}
          </ul>
        )}
      </div>
    </nav>
  );
};
