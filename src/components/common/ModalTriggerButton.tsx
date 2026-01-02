"use client";

import { ReactNode } from "react";

interface ModalTriggerButtonProps {
  onClick: () => void;
  children: ReactNode;
  icon?: ReactNode;
  className?: string;
}

export default function ModalTriggerButton({ 
  onClick, 
  children, 
  icon,
  className = ""
}: ModalTriggerButtonProps) {
  return (
    <button
      onClick={onClick}
      className={`px-4 py-2 bg-[#78CCEE] hover:bg-[#5bb8e0] text-[#23328C] border-3 border-black rounded-lg font-impact transition-all flex items-center gap-2 shadow-lg ${className}`}
    >
      {icon}
      {children}
    </button>
  );
}