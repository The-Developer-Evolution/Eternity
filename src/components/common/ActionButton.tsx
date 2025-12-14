import React from "react";

interface ActionButtonProps {
  onClick: () => void;
  children: React.ReactNode;
}

export default function ActionButton({
  onClick,
  children,
}: ActionButtonProps) {
  const baseStyle =
    "w-full justify-start rounded-lg px-3 py-2 text-lg md:text-2xl bg-[#78CCEE] text-black font-impact font-medium flex items-center gap-4 hover:bg-[#5AA8D6]";

  return (
    <button onClick={onClick} className={`${baseStyle}`}>
      {children}
    </button>
  );
}
