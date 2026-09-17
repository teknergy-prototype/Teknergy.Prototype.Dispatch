"use client";

import { useDispatchStore } from "@/lib/store";
import { CollapsibleSection } from "./CollapsibleSection";
import { EquipmentQueueCard } from "./EquipmentQueueCard";

export function EquipPanel() {
  const equipment = useDispatchStore((s) => s.equipment);
  const sidebarSearch = useDispatchStore((s) => s.sidebarSearch);

  const q = sidebarSearch.trim().toLowerCase();
  const filtered = equipment.filter((e) => e.name.toLowerCase().includes(q));
  const equipmentItems = filtered.filter((e) => e.type === "equipment");
  const vehicleItems = filtered.filter((e) => e.type === "vehicle");

  return (
    <div className="flex-1 overflow-y-auto">
      <CollapsibleSection sectionKey="equip-equipment" title="Equipment" count={equipmentItems.length}>
        <div className="flex flex-col gap-2 p-2">
          {equipmentItems.map((e) => (
            <EquipmentQueueCard key={e.id} equipment={e} />
          ))}
        </div>
      </CollapsibleSection>
      <CollapsibleSection sectionKey="equip-vehicles" title="Vehicles" count={vehicleItems.length}>
        <div className="flex flex-col gap-2 p-2">
          {vehicleItems.map((e) => (
            <EquipmentQueueCard key={e.id} equipment={e} />
          ))}
        </div>
      </CollapsibleSection>
    </div>
  );
}
