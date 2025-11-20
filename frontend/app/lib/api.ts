const API_BASE_URL = process.env.BACKEND || "http://127.0.0.1:8000";

// Helper function to get the access token
export function getAccessToken() {
  if (typeof window !== "undefined") {
    return localStorage.getItem("access_token");
  }
  return null;
}

// Helper function to check if user is authenticated
export function isAuthenticated() {
  if (typeof window !== "undefined") {
    return !!localStorage.getItem("user");
  }
  return false;
}

// Helper function to logout
export function logout() {
  if (typeof window !== "undefined") {
    localStorage.removeItem("user");
  }
}

export async function registerUser(email: string, password: string) {
  const response = await fetch(`${API_BASE_URL}/auth/register`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password }),
  });

  if (!response.ok) {
    const err = await response.json();
    throw new Error(err.detail || "Registration failed");
  }

  return response.json();
}

export async function loginUser(email: string, password: string) {
  const response = await fetch(`${API_BASE_URL}/auth/login`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ email, password }),
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.detail || "Login failed");
  }

  return response.json();
}

export async function logoutUser() {
  const response = await fetch(`${API_BASE_URL}/auth/logout`, {
    method: "POST",
    credentials: "include",
  });

  // logout();

  if (!response.ok) {
    throw new Error("Logout failed");
  }

  return response.json();
}

export async function resetPassword(email: string, newPassword: string) {
  const response = await fetch(`${API_BASE_URL}/auth/reset-password`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, new_password: newPassword }),
  });

  if (!response.ok) {
    const err = await response.json().catch(() => ({}));
    throw new Error(err.detail || "Failed to reset password");
  }

  return response.json();
}

interface CreateGamePayload {
  image: File;
  latitude: number;
  longitude: number;
  title?: string;
  description?: string;
}

export async function createGame(payload: CreateGamePayload) {
  const formData = new FormData();
  formData.append("image", payload.image);
  formData.append("latitude", String(payload.latitude));
  formData.append("longitude", String(payload.longitude));

  // const token = localStorage.getItem("access_token");
  // if (!token) {
  //   throw new Error("No access token found");
  // }

  const response = await fetch(`${API_BASE_URL}/games`, {
    method: "POST",
    body: formData,
    //headers: {
    //  Authorization: `Bearer ${token}`,
    //},
  });

  if (!response.ok) {
    const errorText = await response.text().catch(() => "");
    throw new Error(
      errorText || "Pri ustvarjanju igre je prišlo do nepričakovane napake."
    );
  }

  return response.json();
}
