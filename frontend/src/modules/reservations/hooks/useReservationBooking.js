import { useState } from "react";

const EMPTY_FORM = { date: "", timeFrom: "", timeTo: "", guests: "" };

export const useReservationBooking = () => {
  const [selectedSpace, setSelectedSpace] = useState(null);
  const [form, setForm] = useState(EMPTY_FORM);
  const [booked, setBooked] = useState(false);

  const selectSpace = (spaceName) => {
    setSelectedSpace(spaceName);
    setBooked(false);
  };

  const updateField = (field) => (event) =>
    setForm((prev) => ({ ...prev, [field]: event.target.value }));

  const book = () => {
    // TODO: reemplazar por la llamada real al backend cuando exista el endpoint.
    setBooked(true);
  };

  const reset = () => {
    setBooked(false);
    setSelectedSpace(null);
    setForm(EMPTY_FORM);
  };

  return { selectedSpace, selectSpace, form, updateField, booked, book, reset };
};
