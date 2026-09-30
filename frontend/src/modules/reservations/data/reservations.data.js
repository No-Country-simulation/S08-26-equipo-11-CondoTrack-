export const RESERVATIONS = [
  { id: 1, buildingId: 1, space: "Salón de Eventos", resident: "Valentina Rodríguez", unit: "8B", date: "Sáb 07 Sep", time: "19:00 – 23:00", guests: 30, status: "confirmed" },
  { id: 2, buildingId: 1, space: "Parrilla Terraza", resident: "Claudia Vega", unit: "3C", date: "Dom 08 Sep", time: "13:00 – 17:00", guests: 8, status: "confirmed" },
  { id: 3, buildingId: 1, space: "Coworking", resident: "Martín Ferreyra", unit: "12A", date: "Vie 06 Sep", time: "09:00 – 13:00", guests: 0, status: "confirmed" },
  { id: 4, buildingId: 1, space: "Cancha de Pádel", resident: "Diego Mansilla", unit: "15D", date: "Sáb 07 Sep", time: "10:00 – 11:30", guests: 3, status: "pending" },
  { id: 5, buildingId: 2, space: "Pileta", resident: "Florencia Gómez", unit: "5A", date: "Dom 08 Sep", time: "15:00 – 18:00", guests: 4, status: "confirmed" },
];

export const SPACES = [
  { name: "Salón de Eventos", cap: 50, icon: "reservations" },
  { name: "Parrilla Terraza", cap: 15, icon: "incidents" },
  { name: "Coworking", cap: 10, icon: "dashboard" },
  { name: "Cancha de Pádel", cap: 4, icon: "maintenance" },
  { name: "Pileta", cap: 20, icon: "access" },
  { name: "SUM Infantil", cap: 25, icon: "residents" },
];
