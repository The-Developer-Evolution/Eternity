import React from "react";

interface ActionButtonProps {
  onClick: () => void;
  children: React.ReactNode;
  variant?: "primary" | "danger";
}

export default function ActionButton({
  onClick,
  children,
  variant = "primary",
}: ActionButtonProps) {
  const baseStyle =
    "text-black hover:text-black transition-colors text-xl p-2 rounded-lg";
  const variants = {
    primary: "bg-[#78CCEE] hover:bg-[#5db4d6]",
    danger: "bg-red-500 hover:bg-red-600 text-white",
  };

  return (
    <button onClick={onClick} className={`${baseStyle} ${variants[variant]}`}>
      {children}
    </button>
  );
}
