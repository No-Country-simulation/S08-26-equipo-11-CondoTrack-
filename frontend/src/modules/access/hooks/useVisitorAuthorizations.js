import { useState } from "react";
import { VISITOR_AUTHS } from "@/modules/access/data/visitors.data";

const EMPTY_FORM = { name: "", relation: "", date: "", note: "" };

export const useVisitorAuthorizations = () => {
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState(EMPTY_FORM);

  const updateField = (field) => (event) =>
    setForm((prev) => ({ ...prev, [field]: event.target.value }));

  const cancel = () => {
    setShowForm(false);
    setForm(EMPTY_FORM);
  };

  const submit = () => {
    // TODO: reemplazar por la llamada real al backend cuando exista el endpoint.
    setShowForm(false);
    setForm(EMPTY_FORM);
  };

  return {
    visitors: VISITOR_AUTHS,
    showForm,
    setShowForm,
    form,
    updateField,
    submit,
    cancel,
  };
};
