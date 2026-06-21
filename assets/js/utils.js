"use strict";

function escapeHtml(value) {
  const element = document.createElement("div");
  element.textContent = value == null ? "" : String(value);
  return element.innerHTML;
}

function escapeAttribute(value) {
  return escapeHtml(value)
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

function getQueryParam(name) {
  return new URLSearchParams(window.location.search).get(name);
}

function isArray(value) {
  return Array.isArray(value);
}

function formatCount(count, singular, plural) {
  const numericCount = Number.isFinite(Number(count)) ? Number(count) : 0;
  const label = numericCount === 1 ? singular : (plural || `${singular}s`);
  return `${numericCount} ${label}`;
}

function isYoutubeUrl(value) {
  if (!value) {
    return false;
  }

  try {
    const url = new URL(value);
    const hostname = url.hostname.replace(/^www\./, "");
    return hostname === "youtube.com"
      || hostname === "m.youtube.com"
      || hostname === "youtu.be"
      || hostname === "youtube-nocookie.com";
  } catch (error) {
    return false;
  }
}

function getYoutubeEmbedUrl(value) {
  if (!isYoutubeUrl(value)) {
    return "";
  }

  const url = new URL(value);
  const hostname = url.hostname.replace(/^www\./, "");
  let videoId = "";

  if (hostname === "youtu.be") {
    videoId = url.pathname.split("/").filter(Boolean)[0] || "";
  } else if (url.pathname === "/watch") {
    videoId = url.searchParams.get("v") || "";
  } else {
    const segments = url.pathname.split("/").filter(Boolean);
    const videoIndex = segments.findIndex((segment) => ["embed", "shorts", "live"].includes(segment));
    videoId = videoIndex >= 0 ? segments[videoIndex + 1] || "" : "";
  }

  return /^[a-zA-Z0-9_-]{6,}$/.test(videoId)
    ? `https://www.youtube-nocookie.com/embed/${videoId}`
    : "";
}

function normalizeExerciseName(name) {
  return String(name || "")
    .trim()
    .toLowerCase()
    .replace(/[-_]/g, " ")
    .replace(/\s+/g, " ");
}

function slugifyId(value, prefix) {
  const slug = String(value || "")
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "_")
    .replace(/^_+|_+$/g, "");
  return `${prefix || ""}${slug || "item"}`;
}

function isValidUrlOrPath(value) {
  const candidate = String(value || "").trim();

  if (!candidate) {
    return false;
  }

  if (/^(?:\.{0,2}\/|\/)[^\s]+$/.test(candidate)) {
    return true;
  }

  try {
    const url = new URL(candidate);
    return url.protocol === "http:" || url.protocol === "https:";
  } catch (error) {
    return false;
  }
}
