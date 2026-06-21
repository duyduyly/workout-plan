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
