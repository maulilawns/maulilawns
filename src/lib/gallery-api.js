const base = import.meta.env.VITE_API_BASE_URL || "";
let token;
export async function api(path, options = {}) {
  const mutation = options.method && options.method !== "GET";
  if (mutation && !token) {
    const result = await api("/api/admin/auth/csrf");
    token = result.data.csrf;
  }
  const headers = {
    ...(mutation ? { "X-CSRF-Token": token } : {}),
    ...(!(options.body instanceof FormData) && options.body
      ? { "Content-Type": "application/json" }
      : {}),
    ...options.headers,
  };
  const response = await fetch(base + path, { ...options, credentials: "include", headers });
  let result;
  try {
    result = await response.json();
  } catch {
    throw new Error("The gallery service is unavailable. Please try again later.");
  }
  if (!response.ok) {
    if (response.status === 401 || response.status === 403) token = undefined;
    const error = new Error(result.error || "Request failed.");
    error.status = response.status;
    throw error;
  }
  if (result.data?.csrf) token = result.data.csrf;
  if (path === "/api/admin/auth/logout") token = undefined;
  return result;
}
export async function uploadImage(form, onProgress) {
  if (!token)
    await api("/api/admin/auth/csrf").then((r) => {
      token = r.data.csrf;
    });
  return new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest();
    xhr.open("POST", base + "/api/admin/gallery/images");
    xhr.withCredentials = true;
    xhr.setRequestHeader("X-CSRF-Token", token);
    xhr.upload.onprogress = (e) => {
      if (e.lengthComputable) onProgress(Math.round((e.loaded / e.total) * 100));
    };
    xhr.onerror = () => reject(new Error("Connection lost. Retry this image."));
    xhr.onload = () => {
      let body;
      try {
        body = JSON.parse(xhr.responseText);
      } catch {
        return reject(new Error("Upload service unavailable."));
      }
      if (xhr.status >= 200 && xhr.status < 300) resolve(body);
      else {
        if (xhr.status === 401 || xhr.status === 403) token = undefined;
        reject(new Error(body.error || "Upload failed."));
      }
    };
    xhr.send(form);
  });
}
