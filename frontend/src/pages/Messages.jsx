import { useCallback, useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import {
  createInquiryReply,
  getInbox,
  getInquiryThread,
  getSent,
  markInquiryRead,
} from "../api/comms.js";
import { assetUrl } from "../api/client.js";
import { Alert, Spinner } from "../components/Feedback.jsx";
import { useAuth } from "../context/AuthContext.jsx";
import { formatDateTime } from "../constants.js";
import { whatsappUrl } from "../lib/whatsapp.js";
import usePageTitle from "../hooks/usePageTitle.js";

export default function Messages() {
  usePageTitle("Mis mensajes");
  const { user, isOwner } = useAuth();
  const [tab, setTab] = useState(isOwner ? "inbox" : "sent");
  const [data, setData] = useState({ items: [], total: 0, page: 1, total_pages: 1 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [openId, setOpenId] = useState(null);
  const [threads, setThreads] = useState({});
  const [replyDrafts, setReplyDrafts] = useState({});
  const [sendingReplyId, setSendingReplyId] = useState(null);
  const [replyError, setReplyError] = useState(null);
  const requestSeq = useRef(0);

  const load = useCallback(
    async (page = 1) => {
      const seq = ++requestSeq.current;
      setLoading(true);
      setError(null);
      try {
        const fetcher = tab === "inbox" ? getInbox : getSent;
        const res = await fetcher({ page, limit: 20 });
        if (seq !== requestSeq.current) return;
        setData(res);
        setOpenId(null);
      } catch (e) {
        if (seq !== requestSeq.current) return;
        setError(e.message);
      } finally {
        if (seq === requestSeq.current) setLoading(false);
      }
    },
    [tab]
  );

  useEffect(() => {
    load(1);
  }, [load]);

  async function handleOpen(inquiry) {
    if (tab === "inbox" && !inquiry.is_read) {
      try {
        const updated = await markInquiryRead(inquiry.id);
        setData((d) => ({ ...d, items: d.items.map((i) => (i.id === inquiry.id ? updated : i)) }));
      } catch {
        // mantener visualización aunque falle el marcado
      }
    }
    const nextOpen = openId === inquiry.id ? null : inquiry.id;
    setOpenId(nextOpen);
    if (nextOpen) {
      try {
        const thread = await getInquiryThread(inquiry.id);
        setThreads((t) => ({ ...t, [inquiry.id]: thread }));
      } catch {
        // se mantiene la vista con lo que ya trae la lista (incluye replies)
      }
    }
  }

  async function handleSendReply(inquiryId) {
    const message = (replyDrafts[inquiryId] ?? "").trim();
    if (!message) return;
    setSendingReplyId(inquiryId);
    setReplyError(null);
    try {
      await createInquiryReply(inquiryId, { message });
      setReplyDrafts((d) => ({ ...d, [inquiryId]: "" }));
      const thread = await getInquiryThread(inquiryId);
      setThreads((t) => ({ ...t, [inquiryId]: thread }));
    } catch (e) {
      setReplyError(e.message ?? "No se pudo enviar la respuesta.");
    } finally {
      setSendingReplyId(null);
    }
  }

  const isOpen = (id) => openId === id;
  const repliesOf = (inq) => (threads[inq.id]?.replies ?? inq.replies ?? []);

  return (
    <div className="max-w-3xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold text-brand-900">Mis mensajes</h1>
      <p className="text-gray-600 mt-1 mb-6">
        Consultas directas entre interesados y dueños, sin intermediarios.
      </p>

      {isOwner && (
        <div className="flex gap-2 mb-6">
          {["inbox", "sent"].map((t) => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={`px-4 py-2 rounded-md text-sm font-medium border ${
                tab === t ? "bg-brand-600 text-white border-brand-600" : "bg-white text-gray-600 border-gray-300 hover:border-brand-500"
              }`}
            >
              {t === "inbox" ? `Recibidos (${data.total})` : "Enviados"}
            </button>
          ))}
        </div>
      )}

      {error && <Alert kind="error">{error}</Alert>}
      {loading ? (
        <Spinner />
      ) : data.items.length === 0 ? (
        <div className="text-center py-16 text-gray-500">
          {tab === "inbox"
            ? "Todavía no recibís consultas sobre tus publicaciones."
            : "No enviaste consultas todavía. "}
          <Link to="/" className="text-brand-600 underline">
            Ver inmuebles
          </Link>
        </div>
      ) : (
        <>
          <div className="space-y-3">
            {data.items.map((inq) => {
              const open = isOpen(inq.id);
              const senderContact = tab === "inbox" ? inq.sender_email : null;
              const whatsappLink =
                tab === "inbox"
                  ? whatsappUrl(inq.sender_phone, `Hola, te escribo por "${inq.property_title}".`)
                  : whatsappUrl(inq.recipient_phone, `Hola, te escribo por "${inq.property_title}".`);
              const replies = repliesOf(inq);
              return (
                <div
                  key={inq.id}
                  className={`bg-white rounded-xl border p-4 cursor-pointer transition ${
                    open ? "border-brand-500 shadow-sm" : "border-gray-200 hover:border-brand-300"
                  }`}
                  onClick={() => handleOpen(inq)}
                >
                  <div className="flex items-center gap-3">
                    {inq.property_image ? (
                      <img src={assetUrl(inq.property_image)} alt="" className="w-14 h-14 rounded-lg object-cover shrink-0" />
                    ) : (
                      <div className="w-14 h-14 rounded-lg bg-gray-200 shrink-0" />
                    )}
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-gray-800 truncate">{inq.property_title}</p>
                      <p className="text-sm text-gray-500">
                        {tab === "inbox"
                          ? `${inq.sender.first_name} ${inq.sender.last_name}`
                          : `Para ${inq.recipient_first_name ?? ""} ${inq.recipient_last_name ?? ""}`}{" "}
                        · {formatDateTime(inq.created_at)}
                      </p>
                      {!inq.is_read && tab === "inbox" && (
                        <span className="inline-block mt-1 text-xs bg-brand-600 text-white px-2 py-0.5 rounded-full">
                          Nueva
                        </span>
                      )}
                      {replies.length > 0 && (
                        <span className="inline-block mt-1 text-xs bg-brand-50 text-brand-900 border border-brand-100 px-2 py-0.5 rounded-full">
                          {replies.length} {replies.length === 1 ? "respuesta" : "respuestas"}
                        </span>
                      )}
                    </div>
                  </div>

                  {open && (
                    <div className="mt-3 pt-3 border-t border-gray-100">
                      <div className="space-y-2">
                        <div className="rounded-lg bg-gray-100 px-3 py-2">
                          <div className="flex items-baseline justify-between gap-2">
                            <span className="text-xs font-medium text-gray-500">
                              {tab === "inbox"
                                ? `${inq.sender.first_name} ${inq.sender.last_name}`
                                : "Vos"}
                            </span>
                            <span className="text-xs text-gray-400">{formatDateTime(inq.created_at)}</span>
                          </div>
                          <p className="text-gray-700 whitespace-pre-line text-sm">{inq.message}</p>
                        </div>

                        {replies.map((r) => {
                          const mine = r.sender_id === user?.id;
                          return (
                            <div
                              key={r.id}
                              className={`rounded-lg px-3 py-2 text-sm ${
                                mine ? "bg-brand-600 text-white" : "bg-gray-100 text-gray-700"
                              }`}
                            >
                              <div className={`flex items-baseline justify-between gap-2 ${mine ? "text-brand-100" : "text-gray-500"}`}>
                                <span className="text-xs font-medium">
                                  {mine ? "Vos" : `${r.sender.first_name} ${r.sender.last_name}`}
                                </span>
                                <span className="text-xs opacity-80">{formatDateTime(r.created_at)}</span>
                              </div>
                              <p className="whitespace-pre-line">{r.message}</p>
                            </div>
                          );
                        })}
                      </div>

                      {tab === "inbox" && (
                        <div className="mt-3 flex flex-wrap gap-2 text-xs">
                          <span className="text-gray-500">
                            Contacto del interesado:{" "}
                            <a href={`mailto:${senderContact}`} className="text-brand-600 underline">
                              {senderContact}
                            </a>
                            {inq.sender_phone && <> · {inq.sender_phone}</>}
                          </span>
                          {inq.sender_phone && (
                            <a
                              href={whatsappLink}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-green-700 hover:underline"
                            >
                              Responder por WhatsApp
                            </a>
                          )}
                        </div>
                      )}
                      {tab !== "inbox" && (
                        <div className="mt-3 flex flex-wrap gap-2 text-xs items-center">
                          <a
                            href={`mailto:${inq.recipient_email}`}
                            className="text-brand-600 hover:underline"
                          >
                            Responder por email
                          </a>
                          {inq.recipient_phone && (
                            <a
                              href={whatsappLink}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-green-700 hover:underline"
                            >
                              Responder por WhatsApp
                            </a>
                          )}
                        </div>
                      )}

                      <form
                        onSubmit={(e) => {
                          e.preventDefault();
                          handleSendReply(inq.id);
                        }}
                        className="mt-3 space-y-2"
                      >
                        <textarea
                          rows={2}
                          value={replyDrafts[inq.id] ?? ""}
                          onChange={(e) => setReplyDrafts((d) => ({ ...d, [inq.id]: e.target.value }))}
                          placeholder="Respondé dentro de la conversación…"
                          className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
                        />
                        {replyError && <Alert kind="error">{replyError}</Alert>}
                        <button
                          type="submit"
                          disabled={sendingReplyId === inq.id || !(replyDrafts[inq.id] ?? "").trim()}
                          className="w-full bg-brand-600 hover:bg-brand-700 disabled:opacity-50 text-white font-medium py-2 rounded-md text-sm"
                        >
                          {sendingReplyId === inq.id ? "Enviando…" : "Responder en la app"}
                        </button>
                      </form>
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {data.total_pages > 1 && (
            <div className="flex items-center justify-center gap-3 mt-6">
              <button
                disabled={data.page <= 1}
                onClick={() => load(data.page - 1)}
                className="px-4 py-2 rounded-md border border-gray-300 text-sm disabled:opacity-40 hover:border-brand-500"
              >
                ← Anterior
              </button>
              <span className="text-sm text-gray-600">
                Página {data.page} de {data.total_pages}
              </span>
              <button
                disabled={data.page >= data.total_pages}
                onClick={() => load(data.page + 1)}
                className="px-4 py-2 rounded-md border border-gray-300 text-sm disabled:opacity-40 hover:border-brand-500"
              >
                Siguiente →
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
}