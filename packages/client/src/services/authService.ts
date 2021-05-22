const getRequestInit: RequestInit = {
  method: "GET",
  credentials: "same-origin",
  headers: {
    accept: "application/json",
  },
  mode: "same-origin",
  redirect: "error",
  referrer: "",
  referrerPolicy: "same-origin",
};

export async function getRandomUid() {
  try {
    const response = await fetch("/api/auth/getRandomUid", getRequestInit);
    const result = await response.json() as { uid?: number };
    return (result && typeof result.uid === "number" && result.uid) || null;
  } catch {
    return null;
  }
}
