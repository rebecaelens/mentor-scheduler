const USER_STORAGE_KEY = "ms_user";
const GOOGLE_CLIENT_ID = "483671777537-umgk8eev1b3knleglsaa2t1s1rksrklr.apps.googleusercontent.com";
const GOOGLE_SCRIPT_SRC = "https://accounts.google.com/gsi/client";

let googleSdkPromise = null;

function dispatchAuthChange() {
  window.dispatchEvent(new Event("ms:auth-changed"));
}

function createUser(displayName) {
  const name = String(displayName || "").trim() || "Usuária Demo";
  const slug = name.toLowerCase().replace(/[^a-z0-9]+/g, "_").replace(/^_|_$/g, "");

  return {
    id: slug || "user_demo",
    name
  };
}

export function signInDemo(displayName = "Usuária Demo") {
  const user = createUser(displayName);
  localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(user));
  dispatchAuthChange();
  return user;
}

function decodeJwt(credential) {
  const payload = credential.split(".")[1];

  if (!payload) {
    throw new Error("Credencial do Google inválida.");
  }

  const base64 = payload.replace(/-/g, "+").replace(/_/g, "/");
  const padded = base64.padEnd(base64.length + ((4 - (base64.length % 4)) % 4), "=");
  const decoded = atob(padded);

  return JSON.parse(
    decodeURIComponent(
      decoded
        .split("")
        .map((character) => `%${character.charCodeAt(0).toString(16).padStart(2, "0")}`)
        .join("")
    )
  );
}

export function signInWithGoogleCredential(credential) {
  const payload = decodeJwt(credential);
  const user = {
    id: payload.sub,
    name: payload.name || payload.given_name || payload.email || "Usuário Google",
    email: payload.email || "",
    picture: payload.picture || ""
  };

  localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(user));
  dispatchAuthChange();

  return user;
}

export function getGoogleClientId() {
  return GOOGLE_CLIENT_ID;
}

export function isGoogleAuthConfigured() {
  return Boolean(GOOGLE_CLIENT_ID);
}

export function loadGoogleIdentityScript() {
  if (typeof window === "undefined") {
    return Promise.reject(new Error("Google Identity Services só funciona no navegador."));
  }

  if (window.google?.accounts?.id) {
    return Promise.resolve(window.google.accounts.id);
  }

  if (!googleSdkPromise) {
    googleSdkPromise = new Promise((resolve, reject) => {
      const existingScript = document.querySelector('script[data-google-identity="true"]');

      if (existingScript) {
        existingScript.addEventListener("load", () => resolve(window.google.accounts.id), { once: true });
        existingScript.addEventListener("error", () => reject(new Error("Não foi possível carregar o Google Identity Services.")), { once: true });
        return;
      }

      const script = document.createElement("script");
      script.src = GOOGLE_SCRIPT_SRC;
      script.async = true;
      script.defer = true;
      script.dataset.googleIdentity = "true";
      script.onload = () => resolve(window.google.accounts.id);
      script.onerror = () => reject(new Error("Não foi possível carregar o Google Identity Services."));
      document.head.appendChild(script);
    });
  }

  return googleSdkPromise;
}

export async function mountGoogleButton(targetElement, onSuccess) {
  if (!targetElement) {
    return;
  }

  if (!isGoogleAuthConfigured()) {
    targetElement.innerHTML = '<p class="auth-hint">Configure o Google Client ID para ativar o login real.</p>';
    return;
  }

  try {
    const googleIdentity = await loadGoogleIdentityScript();

    targetElement.innerHTML = "";
    googleIdentity.initialize({
      client_id: GOOGLE_CLIENT_ID,
      callback: ({ credential }) => {
        const user = signInWithGoogleCredential(credential);

        if (typeof onSuccess === "function") {
          onSuccess(user);
        }
      },
      auto_select: false,
      cancel_on_tap_outside: false
    });

    googleIdentity.renderButton(targetElement, {
      theme: "filled_blue",
      size: "large",
      shape: "pill",
      width: 320,
      text: "signin_with",
      logo_alignment: "left"
    });

    googleIdentity.prompt();
  } catch (error) {
    targetElement.innerHTML = `<p class="auth-hint">${error instanceof Error ? error.message : "Falha ao carregar o login do Google."}</p>`;
  }
}

export function signOut() {
  localStorage.removeItem(USER_STORAGE_KEY);

  if (window.google?.accounts?.id) {
    window.google.accounts.id.disableAutoSelect();
  }

  dispatchAuthChange();
}

export function getCurrentUser() {
  const raw = localStorage.getItem(USER_STORAGE_KEY);

  if (!raw) {
    return null;
  }

  try {
    return JSON.parse(raw);
  } catch {
    return null;
  }
}
