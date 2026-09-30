// Los formularios usan noValidate para manejar los mensajes de error con
// Bootstrap, lo que desactiva la validación de `type="email"` del navegador.
// El formato hay que validarlo a mano o el backend recibe direcciones
// imposibles y el vínculo de la cuenta falla sin motivo visible.
const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

export const isValidEmail = (value) => EMAIL_PATTERN.test(String(value ?? "").trim());

// El email identifica la cuenta: se compara siempre en minúsculas para que
// "Ana@Correo.com" y "ana@correo.com" sean la misma persona.
export const normalizeEmail = (value) => String(value ?? "").trim().toLowerCase();
