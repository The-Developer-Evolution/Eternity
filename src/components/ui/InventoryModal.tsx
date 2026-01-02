"use client";

import { X } from "lucide-react";
import { useEffect } from "react";

interface InventoryItem {
  id: string;
  amount: number;
  bigItem?: { name: string };
  smallItem?: { name: string };
}

interface InventoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  inventory: {
    big_items: InventoryItem[];
    small_items: InventoryItem[];
  };
}

export default function InventoryModal({ isOpen, onClose, inventory }: InventoryModalProps) {
  // Close modal on ESC key
  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    if (isOpen) {
      document.addEventListener("keydown", handleEsc);
      document.body.style.overflow = "hidden";
    }
    return () => {
      document.removeEventListener("keydown", handleEsc);
      document.body.style.overflow = "unset";
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-[9999] px-4">
      <div className="bg-[#23328C] rounded-xl p-6 w-full max-w-md shadow-2xl relative border-2 border-[#78CCEE] max-h-[90vh] overflow-y-auto">
        <button
          className="absolute top-4 right-4 text-white hover:text-[#78CCEE] transition-colors"
          onClick={onClose}
        >
          <X size={24} />
        </button>

        <h2 className="text-2xl font-impact text-[#78CCEE] mb-6 text-center">
          MY INVENTORY
        </h2>

        {/* Big Items */}
        <div className="mb-6">
          <h3 className="text-[#41FFA3] font-bold mb-3 uppercase text-sm border-b border-[#41FFA3]/30 pb-2">
            Big Items
          </h3>
          {inventory.big_items.filter(item => item.amount > 0).length > 0 ? (
            <div className="space-y-2">
              {inventory.big_items
                .filter(item => item.amount > 0)
                .map(item => (
                  <div
                    key={item.id}
                    className="bg-[#3E344A]/80 p-3 rounded-lg border border-[#78CCEE]/30 flex justify-between items-center"
                  >
                    <span className="text-white font-semibold">
                      {item.bigItem?.name}
                    </span>
                    <span className="text-[#41FFA3] font-impact text-lg">
                      x{item.amount}
                    </span>
                  </div>
                ))}
            </div>
          ) : (
            <p className="text-slate-400 text-sm italic text-center py-4">
              No big items yet
            </p>
          )}
        </div>

        {/* Small Items */}
        <div>
          <h3 className="text-[#78CCEE] font-bold mb-3 uppercase text-sm border-b border-[#78CCEE]/30 pb-2">
            Small Items (Materials)
          </h3>
          {inventory.small_items.filter(item => item.amount > 0).length > 0 ? (
            <div className="grid grid-cols-2 gap-2">
              {inventory.small_items
                .filter(item => item.amount > 0)
                .map(item => (
                  <div
                    key={item.id}
                    className="bg-[#3E344A]/80 p-2 rounded-lg border border-[#684095] flex justify-between items-center"
                  >
                    <span className="text-white text-sm font-medium truncate">
                      {item.smallItem?.name}
                    </span>
                    <span className="text-[#41FFA3] font-impact ml-2">
                      x{item.amount}
                    </span>
                  </div>
                ))}
            </div>
          ) : (
            <p className="text-slate-400 text-sm italic text-center py-4">
              No materials yet
            </p>
          )}
        </div>

        <button
          onClick={onClose}
          className="mt-6 w-full py-3 bg-[#78CCEE] hover:bg-[#5bb8e0] text-[#23328C] rounded-lg font-impact transition-all"
        >
          CLOSE
        </button>
      </div>
    </div>
  );
}