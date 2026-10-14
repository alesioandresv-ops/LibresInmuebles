// Conversor mínimo de Markdown a HTML para páginas legales (títulos, listas, negritas y enlaces).
// No pretende ser un parser completo: cubre el subconjunto usado en Términos y Privacidad.
function inline(text) {
  return text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>")
    .replace(/\[([^\]]+)\]\((https?:[^)]+)\)/g, '<a href="$2" class="text-brand-600 underline">$1</a>');
}

export function renderMarkdown(md) {
  const lines = md.split("\n");
  const out = [];
  let listOpen = false;

  const closeList = () => {
    if (listOpen) {
      out.push("</ul>");
      listOpen = false;
    }
  };

  for (const rawLine of lines) {
    const line = rawLine.trimEnd();
    let match;

    if ((match = line.match(/^###\s+(.*)$/))) {
      closeList();
      out.push(`<h3>${inline(match[1])}</h3>`);
      continue;
    }
    if ((match = line.match(/^##\s+(.*)$/))) {
      closeList();
      out.push(`<h2>${inline(match[1])}</h2>`);
      continue;
    }
    if ((match = line.match(/^#\s+(.*)$/))) {
      closeList();
      out.push(`<h1>${inline(match[1])}</h1>`);
      continue;
    }
    if ((match = line.match(/^[-*]\s+(.*)$/))) {
      if (!listOpen) {
        out.push("<ul>");
        listOpen = true;
      }
      out.push(`<li>${inline(match[1])}</li>`);
      continue;
    }
    if (line.trim() === "") {
      closeList();
      continue;
    }
    closeList();
    out.push(`<p>${inline(line)}</p>`);
  }

  closeList();
  return out.join("");
}
