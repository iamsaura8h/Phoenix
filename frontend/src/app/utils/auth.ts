export function getUser() {
  if (typeof window === "undefined") return null;
  const data = localStorage.getItem("phoenix_user");
  if (!data) return null;
  return JSON.parse(data);
}

export function logout() {
  if (typeof window === "undefined") return;
  localStorage.removeItem("phoenix_user");
  window.location.href = "/login";
}
