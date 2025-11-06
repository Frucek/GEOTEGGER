const API_BASE_URL = process.env.BACKEND || "http://127.0.0.1:8000";

export async function registerUser(email: string, password: string) {
    const response = await fetch(`${API_BASE_URL}/auth/register`, {
        method: "POST",
        headers: {"Content-Type": "application/json"},
        body: JSON.stringify({email, password}),
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
        body: JSON.stringify({email, password}),
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

