import { useState } from "react";
import { useResidentsStore } from "@/modules/residents/context/ResidentsContext";

export const useResidents = () => {
  const { residents, forBuilding, addResident } = useResidentsStore();
  const [search, setSearch] = useState("");

  const filteredResidents = residents.filter(
    (resident) =>
      resident.name.toLowerCase().includes(search.toLowerCase()) ||
      resident.unit.toLowerCase().includes(search.toLowerCase()),
  );

  return { residents, search, setSearch, filteredResidents, forBuilding, addResident };
};
