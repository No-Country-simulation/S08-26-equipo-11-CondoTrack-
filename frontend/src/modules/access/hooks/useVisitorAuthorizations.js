import { useEffect, useRef, useState } from "react";
import { createVisit } from "@/modules/access/services/accessService";
import { apiErrorMessage } from "@/core/api/api";

const EMPTY_FORM = { name: "", dni: "", relation: "", date: "", time: "", note: "" };

const VISIT_WINDOW_MINUTES = 60;

const currentTime = () => {
  const now = new Date();
  return `${String(now.getHours()).padStart(2, "0")}:${String(now.getMinutes()).padStart(2, "0")}`;
};

const storageKey = (ownerKey) => `ct_visits_${ownerKey ?? "anon"}`;

const loadStored = (ownerKey) => {
  try {
    const raw = localStorage.getItem(storageKey(ownerKey));
    if (!raw) return [];
    const items = JSON.parse(raw);
    if (!Array.isArray(items)) return [];
    // Descarta vencidos: el pase dura 60 min desde lo estimado.
    const now = Date.now();
    return items.filter(
      (item) => item?.id && (!item.validUntil || new Date(item.validUntil).getTime() > now),
    );
  } catch {
    return [];
  }
};

// Autorizaciones creadas por el residente. Sin endpoint de listado en el
// backend, persisten en localStorage (por usuario) con su QR real.
// Requiere unitId real; sin unidad no se puede autorizar.
export const useVisitorAuthorizations = (unitId, ownerKey) => {
  const [created, setCreated] = useState(() => loadStored(ownerKey));
  const ownerRef = useRef(ownerKey);

  // Si el dueño cambia (ej. montó antes de cargar la sesión), relee su bucket.
  useEffect(() => {
    if (ownerRef.current !== ownerKey) {
      ownerRef.current = ownerKey;
      setCreated(loadStored(ownerKey));
    }
  }, [ownerKey]);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState(EMPTY_FORM);
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    try {
      localStorage.setItem(storageKey(ownerKey), JSON.stringify(created));
    } catch {
      // ignore: sin storage, solo vive en memoria
    }
  }, [created, ownerKey]);

  const updateField = (field) => (event) =>
    setForm((prev) => ({ ...prev, [field]: event.target.value }));

  const cancel = () => {
    setShowForm(false);
    setForm(EMPTY_FORM);
    setError("");
  };

  // Abre el formulario con la hora actual precargada.
  const openForm = () => {
    setForm({ ...EMPTY_FORM, time: currentTime() });
    setError("");
    setShowForm(true);
  };

  const submit = async () => {
    setError("");

    if (!form.name.trim() || !form.date) {
      setError("Completá nombre y fecha de visita.");
      return;
    }

    if (!form.dni.trim()) {
      setError("Completá el DNI del visitante.");
      return;
    }

    if (!unitId) {
      setError("Tu usuario no tiene una unidad asignada.");
      return;
    }

    // El pase vale 60 min desde la hora estimada: si ya venció, el backend
    // lo rechaza al validar. Se exige fecha/hora futura acá mismo.
    const estimated = new Date(`${form.date}T${form.time || "00:00"}:00`);
    if (!form.date || !form.time || Number.isNaN(estimated.getTime())) {
      setError("Completá fecha y hora válidas de visita.");
      return;
    }
    if (
      estimated.getTime() + VISIT_WINDOW_MINUTES * 60 * 1000 <=
      Date.now()
    ) {
      setError("Esa fecha y hora ya pasaron: el pase nacería vencido.");
      return;
    }

    const nameParts = form.name.trim().split(/\s+/);
    setSaving(true);
    try {
      const visit = await createVisit(unitId, {
        visitorName: form.name,
        visitorDni: form.dni,
        estimatedAt: estimated.toISOString(),
      });
      setCreated((prev) => [
        {
          id: visit.id,
          name: nameParts.join(" "),
          relation: form.relation || "Visita",
          validUntil: visit.validUntil,
          validUntilLabel: visit.validUntil,
          status: "active",
          note: form.note,
          qrImage: visit.qrImage,
          qrToken: visit.qrToken,
        },
        ...prev,
      ]);
      setForm(EMPTY_FORM);
      setShowForm(false);
    } catch (err) {
      setError(apiErrorMessage(err, "No se pudo autorizar la visita."));
    } finally {
      setSaving(false);
    }
  };

  return {
    visitors: created,
    showForm,
    setShowForm,
    openForm,
    form,
    updateField,
    submit,
    cancel,
    error,
    saving,
  };
};
