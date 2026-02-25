import axios from "axios";

export const api = axios.create({
  baseURL: "", // same origin
  timeout: 20000,
  headers: { "Content-Type": "application/json" },
});

export function set_auth_token(token) {
  if (token) api.defaults.headers.common.Authorization = `Bearer ${token}`;
  else delete api.defaults.headers.common.Authorization;
}
