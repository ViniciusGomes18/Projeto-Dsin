import * as SecureStore from "expo-secure-store";
import * as FileSystemLegacy from "expo-file-system/legacy";
import { ENV } from "../config/env";

const { apiUrl, endpoints } = ENV;

export type LoginResult = { success: boolean; message?: string };

type BackendShapeA = {
  token: string;
  user: { id: string; name: string; email: string };
};

type BackendShapeB = {
  accessToken: string;
  expiresInSeconds?: number;
  agent: { id: string; name: string; email: string };
};

export type TicketPriority =
  | "Baixa"
  | "Média"
  | "Alta"
  | "Em Análise"
  | string;

export type Ticket = {
  id: string;
  vehicle: string;
  plate: string;
  reason: string;
  date: string;
  priority: TicketPriority;
};

export type PhotoAnalysisResult = {
  success: boolean;
  message?: string;
  data?: any;
};

function buildUrl(path: string) {
  return `${apiUrl}${path}`;
}

async function safeJson(resp: any) {
  try {
    return await resp.json();
  } catch {
    return null;
  }
}

// ==============================
// LOGIN
// ==============================
export async function login(
  email: string,
  senha: string
): Promise<LoginResult> {
  try {
    const response = await fetch(buildUrl(endpoints.authLogin), {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password: senha }),
    });

    if (response.status === 401 || response.status === 400) {
      const err = await safeJson(response);
      const msg = err?.message ?? "Email ou senha incorretos";
      return { success: false, message: msg };
    }

    if (!response.ok) {
      const err = await safeJson(response);
      return {
        success: false,
        message: err?.message ?? `Erro ${response.status} no login`,
      };
    }

    const data: Partial<BackendShapeA & BackendShapeB> = await response.json();

    const token = data.token ?? data.accessToken;
    const user = data.user ?? data.agent;
    const expS = data.expiresInSeconds ?? null;

    if (!token || !user?.id) {
      return { success: false, message: "Resposta inválida do servidor" };
    }

    await SecureStore.setItemAsync("token", token);

    await SecureStore.setItemAsync(
      "me",
      JSON.stringify({ id: user.id, name: user.name, email: user.email })
    );

    if (expS && Number.isFinite(expS)) {
      const expiresAt = Date.now() + expS * 1000;
      await SecureStore.setItemAsync("token_expires_at", String(expiresAt));
    }

    return { success: true };
  } catch {
    return {
      success: false,
      message: "Erro de conexão. Verifique sua internet.",
    };
  }
}

// ==============================
// LISTAR MULTAS
// ==============================
export async function getTickets(): Promise<Ticket[]> {
  const token = await SecureStore.getItemAsync("token");
  const meStr = await SecureStore.getItemAsync("me");
  const me = meStr ? JSON.parse(meStr) : null;
  const agentId = me?.id;

  if (!agentId) return [];

  const url = buildUrl(`${endpoints.ticketsList}/${agentId}?skip=0&take=50`);

  const response = await fetch(url, {
    method: "GET",
    headers: token ? { Authorization: `Bearer ${token}` } : undefined,
  });

  const json = await safeJson(response);
  console.log("DEBUG getTickets JSON:", json);

  if (!response.ok) {
    const msg = json?.message ?? `Erro ${response.status} ao buscar tickets`;
    throw new Error(msg);
  }

  const items = Array.isArray(json) ? json : json?.items ?? [];

  return (items as any[]).map((t) => ({
    id: String(t.id),
    vehicle:
      t.vehicle ??
      t.vehicleModel ??
      t.vehicleModelSnapshot ??
      "",
    plate:
      t.plate ??
      t.licensePlate ??
      t.plateSnapshot ??
      "",
    reason: t.reason ?? t.violationDescription ?? "",
    date: t.date ?? t.occurredAt ?? new Date().toISOString(),
    priority: (t.priority as TicketPriority) ?? "Em Análise",
  }));
}

export async function getTicketById(id: string) {
  const token = await SecureStore.getItemAsync("token");

  const url = buildUrl(`/api/ticketbook/${id}`);

  const response = await fetch(url, {
    method: "GET",
    headers: token ? { Authorization: `Bearer ${token}` } : undefined,
  });

  const json = await safeJson(response);
  console.log("DEBUG getTicketById JSON:", json);

  if (!response.ok) {
    const msg =
      json?.message ?? `Erro ${response.status} ao buscar detalhes da multa`;
    throw new Error(msg);
  }

  return json;
}

export async function sendTicketPhoto(
  photoUri: string
): Promise<PhotoAnalysisResult> {
  try {
    if (!photoUri) {
      return { success: false, message: "Nenhuma foto foi informada." };
    }

    const token = await SecureStore.getItemAsync("token");
    const meStr = await SecureStore.getItemAsync("me");
    const me = meStr ? JSON.parse(meStr) : null;
    const agentId = me?.id;

    if (!agentId) {
      return {
        success: false,
        message: "Não foi possível identificar o agente logado.",
      };
    }

    // 1) Garantir que o arquivo existe
    const info = await FileSystemLegacy.getInfoAsync(photoUri);
    if (!info.exists) {
      console.log("Arquivo não existe em:", photoUri);
      return {
        success: false,
        message: "Não foi possível acessar a foto capturada.",
      };
    }

    // 2) Ler o arquivo em base64
    let imageBase64: string;
    try {
      imageBase64 = await FileSystemLegacy.readAsStringAsync(photoUri, {
        encoding: "base64",
      });
    } catch (err: any) {
      console.log("Erro ao ler arquivo em base64:", err);
      return {
        success: false,
        message: "Falha ao converter a foto para envio.",
      };
    }

    // 3) Chamada ao backend
    const response = await fetch(buildUrl(endpoints.ticketImage), {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
      body: JSON.stringify({
        agentId,
        imageBase64,
      }),
    });

    const json = await safeJson(response);

    if (!response.ok) {
      const msg =
        json?.message ??
        `Erro ${response.status} ao enviar a foto para análise`;
      console.log("Erro HTTP ao enviar foto:", response.status, json);
      return { success: false, message: msg };
    }

    return { success: true, data: json };
  } catch (err) {
    console.log("Erro inesperado ao enviar foto:", err);
    return {
      success: false,
      message: "Erro inesperado ao enviar a foto para análise.",
    };
  }
}