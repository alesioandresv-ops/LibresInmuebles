import { apiFetch } from "./client.js";

export function getLegalTemplates() {
  return apiFetch("/legal/templates");
}

export function templateDownloadUrl(slug) {
  return `/legal/templates/${slug}/download`;
}