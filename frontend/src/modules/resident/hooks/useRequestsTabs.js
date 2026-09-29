import { useState } from "react";

const EMPTY_FORM = { title: "", category: "", description: "", priority: "medium" };

export const useRequestsTabs = () => {
  const [tab, setTab] = useState("mantenimiento");
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState(EMPTY_FORM);

  const updateField = (field) => (event) =>
    setForm((prev) => ({ ...prev, [field]: event.target.value }));

  const submit = () => {
    // TODO: reemplazar por la llamada real al backend cuando exista el endpoint.
    setShowForm(false);
    setForm(EMPTY_FORM);
  };

  return { tab, setTab, showForm, setShowForm, form, updateField, submit };
};
