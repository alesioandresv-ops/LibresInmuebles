import { BadgePercent, FileDown, Handshake, MessageCircleCheck, ShieldCheck } from "lucide-react";

const BENEFITS = [
  { icon: Handshake, title: "Trato directo", text: "Con el dueño, sin intermediarios" },
  { icon: BadgePercent, title: "Sin comisiones", text: "Más ahorro para vos" },
  { icon: MessageCircleCheck, title: "Respuesta rápida", text: "Consultá y coordiná en la plataforma" },
  { icon: FileDown, title: "Contratos listos", text: "Modelos legales descargables" },
  { icon: ShieldCheck, title: "Comunidad segura", text: "Publicaciones reportables" },
];

export default function BenefitsBar() {
  return (
    <section aria-label="Ventajas de LibreInmuebles" className="border-b border-brand-900/5 bg-white">
      <div className="app-container grid grid-cols-2 gap-x-4 gap-y-8 py-8 md:grid-cols-5 md:gap-0 md:divide-x md:divide-slate-100 md:py-10">
        {BENEFITS.map(({ icon: Icon, title, text }) => (
          <div key={title} className="flex items-center gap-3 md:flex-col md:gap-3 md:px-4 md:text-center">
            <span className="grid h-11 w-11 shrink-0 place-items-center rounded-full bg-brand-50 text-brand-600">
              <Icon size={22} strokeWidth={2} />
            </span>
            <div className="min-w-0">
              <p className="text-sm font-semibold text-brand-900">{title}</p>
              <p className="mt-0.5 text-xs leading-snug text-slate-500">{text}</p>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}