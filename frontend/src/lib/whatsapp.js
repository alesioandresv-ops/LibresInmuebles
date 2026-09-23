export function whatsappDigits(value) {
  return (value ?? "").replace(/\D/g, "");
}

export function whatsappUrl(number, text) {
  const digits = whatsappDigits(number);
  if (!digits) return null;
  const params = new URLSearchParams();
  if (text) params.set("text", text);
  const qs = params.toString();
  return `https://wa.me/${digits}${qs ? `?${qs}` : ""}`;
}