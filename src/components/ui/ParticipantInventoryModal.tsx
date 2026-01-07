"use client";

import { useState } from "react";
import { Package } from "lucide-react";
import ModalTriggerButton from "../common/ModalTriggerButton";
import InventoryModal from "./InventoryModal";

interface InventoryItem {
  id: string;
  amount: number;
  bigItem?: { name: string };
  smallItem?: { name: string };
}

interface ParticipantInventoryModalProps {
  inventory: {
    big_items: InventoryItem[];
    small_items: InventoryItem[];
  };
}

export default function ParticipantInventoryModal({ inventory }: ParticipantInventoryModalProps) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      <ModalTriggerButton 
        onClick={() => setIsOpen(true)}
        icon={<Package size={18} />}
      >
        MY INVENTORY
      </ModalTriggerButton>

      <InventoryModal 
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
        inventory={inventory}
      />
    </>
  );
}