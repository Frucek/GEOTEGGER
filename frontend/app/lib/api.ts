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

export function getCurrentUserId(): string | null {
  if (typeof window !== "undefined") {
    const userStr = localStorage.getItem("user");
    if (userStr) {
      try {
        const user = JSON.parse(userStr);
        return user.id || null;
      } catch (error) {
        console.error("Error parsing user data:", error);
        return null;
      }
    }
  }
  return null;
}

export async function createGame(payload: CreateGamePayload) {
  const userId = getCurrentUserId();
  if (!userId) {
    throw new Error("User not authenticated");
  }

  const formData = new FormData();
  formData.append("image", payload.image);
  formData.append("latitude", String(payload.latitude));
  formData.append("longitude", String(payload.longitude));

  formData.append("title", String(payload.title));
  formData.append("user_id", userId);

  const response = await fetch(`${API_BASE_URL}/games`, {
    method: "POST",
    body: formData,
  });

  if (!response.ok) {
    const errorText = await response.text().catch(() => "");
    throw new Error(
      errorText || "Pri ustvarjanju igre je prišlo do nepričakovane napake."
    );
  }

  return response.json();
}

export async function fetchGames(limit = 12, offset = 0) {
  const response = await fetch(
    `${API_BASE_URL}/games?limit=${limit}&offset=${offset}`
  );

  if (!response.ok) {
    throw new Error("Napaka pri nalaganju iger");
  }

  return response.json();
}

export async function fetchGameById(id: string) {
  const response = await fetch(`${API_BASE_URL}/games/${id}`);

  if (!response.ok) {
    const err = await response.json().catch(() => ({}));
    throw new Error(err.detail || "Napaka pri nalaganju igre");
  }

  return response.json();
}

export async function checkGameLocation(
  gameId: string,
  latitude: number,
  longitude: number
) {
  const response = await fetch(`${API_BASE_URL}/games/${gameId}/check`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ latitude, longitude }),
  });

  if (!response.ok) {
    const err = await response.json().catch(() => ({}));
    throw new Error(err.detail || "Napaka pri preverjanju lokacije");
  }

  return response.json();
}
