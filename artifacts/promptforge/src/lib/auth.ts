const AUTH_KEY = "authenticated";

export function isAuthenticated(): boolean {
  return localStorage.getItem(AUTH_KEY) === "true";
}

export function login(password: string): boolean {
  const correctPassword = import.meta.env.VITE_APP_PASSWORD || "promptforge2024";
  if (password === correctPassword) {
    localStorage.setItem(AUTH_KEY, "true");
    return true;
  }
  return false;
}

export function logout(): void {
  localStorage.removeItem(AUTH_KEY);
}
