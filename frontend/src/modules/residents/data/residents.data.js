export const RESIDENTS = [
  { id: 1, buildingId: 1, name: "Valentina Rodríguez", unit: "8B", building: "Torre Madero", email: "val.rodriguez@gmail.com", phone: "+54 11 4823-7891", type: "Propietaria", since: "Mar 2021", status: "active" },
  { id: 2, buildingId: 1, name: "Martín Ferreyra", unit: "12A", building: "Torre Madero", email: "martin.ferreyra@outlook.com", phone: "+54 11 5901-2234", type: "Inquilino", since: "Ene 2023", status: "active" },
  { id: 3, buildingId: 1, name: "Claudia Vega", unit: "3C", building: "Torre Madero", email: "cvega@empresas.com.ar", phone: "+54 11 4712-6653", type: "Propietaria", since: "Jun 2019", status: "active" },
  { id: 4, buildingId: 1, name: "Diego Mansilla", unit: "15D", building: "Torre Madero", email: "dmansilla@hotmail.com", phone: "+54 11 6040-1192", type: "Inquilino", since: "Sep 2022", status: "inactive" },
  { id: 5, buildingId: 2, name: "Florencia Gómez", unit: "5A", building: "Palermo Park", email: "flo.gomez@gmail.com", phone: "+54 11 4933-8821", type: "Propietaria", since: "Feb 2020", status: "active" },
  { id: 6, buildingId: 2, name: "Ricardo Salinas", unit: "7B", building: "Palermo Park", email: "rsalinas@consultora.com", phone: "+54 11 5577-3390", type: "Inquilino", since: "Jul 2023", status: "active" },
];

// Residente de referencia para el portal (mock: en un login real vendría del usuario autenticado).
export const CURRENT_RESIDENT = RESIDENTS[0];
