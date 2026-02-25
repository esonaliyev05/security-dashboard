import { set_auth_token } from "./api.js";

const KEY = "sd_auth_v2";

export function load_auth() {
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return null;
    const data = JSON.parse(raw);
    if (!data?.access_token) return null;
    set_auth_token(data.access_token);
    return data;
  } catch {
    return null;
  }
}

export function save_auth(data) {
  localStorage.setItem(KEY, JSON.stringify(data));
  set_auth_token(data.access_token);
}

export function clear_auth() {
  localStorage.removeItem(KEY);
  set_auth_token(null);
}
