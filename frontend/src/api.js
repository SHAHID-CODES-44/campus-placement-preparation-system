const BASE = "http://localhost:5000";

export async function api(path, method = "GET", body = null) {
  const opts = { method, headers: { "Content-Type": "application/json" } };
  if (body) opts.body = JSON.stringify(body);
  const res = await fetch(BASE + path, opts);
  return res.json();
}

export default api;
