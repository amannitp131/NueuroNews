const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:5000/api";

function readToken() {
  if (typeof window === "undefined") return "";

  try {
    const raw = localStorage.getItem("neuronews_auth");
    if (!raw) return "";
    const parsed = JSON.parse(raw);
    return parsed?.token || "";
  } catch (_error) {
    return "";
  }
}

async function apiFetch(path, options = {}) {
  const token = readToken();
  const response = await fetch(`${API_BASE}${path}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...(options.headers || {})
    },
    cache: "no-store"
  });

  const payload = await response.json();
  if (!response.ok) {
    throw new Error(payload.message || "API request failed");
  }

  return payload.data;
}

export function saveProfile(data) {
  return apiFetch("/profiles/me", { method: "POST", body: JSON.stringify(data) });
}

export function fetchMyProfile() {
  return apiFetch("/profiles/me");
}

export function signupUser(data) {
  return apiFetch("/auth/signup", { method: "POST", body: JSON.stringify(data) });
}

export function loginUser(data) {
  return apiFetch("/auth/login", { method: "POST", body: JSON.stringify(data) });
}

export function fetchCurrentUser() {
  return apiFetch("/auth/me");
}

export function fetchFeed(params = {}) {
  const query = new URLSearchParams();

  if (params.page) query.set("page", String(params.page));
  if (params.limit) query.set("limit", String(params.limit));

  const qs = query.toString();
  return apiFetch(`/news/feed${qs ? `?${qs}` : ""}`);
}

export function fetchArticleById(id) {
  return apiFetch(`/news/${id}`);
}

export function fetchStories() {
  return apiFetch("/stories");
}

export function fetchStoryById(id) {
  return apiFetch(`/stories/${id}`);
}

export function fetchStoryTimeline(id) {
  return apiFetch(`/stories/${id}/timeline`);
}

export function trackStoryArc(data) {
  return apiFetch("/stories/track", { method: "POST", body: JSON.stringify(data) });
}

export function summarizeArticle(articleId) {
  return apiFetch("/ai/summarize", { method: "POST", body: JSON.stringify({ articleId }) });
}

export function askQuestion(question) {
  return apiFetch("/ai/chat", { method: "POST", body: JSON.stringify({ question }) });
}

export function predictArticle(articleId) {
  return apiFetch("/ai/predict", { method: "POST", body: JSON.stringify({ articleId }) });
}

export function generateNewsToAction(articleId, forceRefresh = false) {
  return apiFetch("/ai/action", {
    method: "POST",
    body: JSON.stringify({ articleId, forceRefresh })
  });
}

export function enhanceHeadline(headline) {
  return apiFetch("/ai/headline/enhance", {
    method: "POST",
    body: JSON.stringify({ headline })
  });
}

export function generateDebateMode(articleId) {
  return apiFetch("/ai/debate", {
    method: "POST",
    body: JSON.stringify({ articleId })
  });
}

export function submitDebateOpinion(articleId, userOpinion) {
  return apiFetch("/ai/debate/exchange", {
    method: "POST",
    body: JSON.stringify({ articleId, userOpinion })
  });
}
