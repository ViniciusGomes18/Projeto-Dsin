const DEFAULT_API_URL =
  "https://projeto-dsin-conversor-de-talao-manual.onrender.com";

export const ENV = {
  apiUrl: process.env.EXPO_PUBLIC_API_URL ?? DEFAULT_API_URL,

  endpoints: {
    authLogin: process.env.EXPO_PUBLIC_AUTH_LOGIN_PATH ?? "/api/agent/login",

    // LISTAGEM: agente → multas
    ticketsList:
      process.env.EXPO_PUBLIC_TICKETS_LIST_PATH ?? "/api/ticketbook/agent",

    // ENVIO: foto para análise
    ticketImage:
      process.env.EXPO_PUBLIC_TICKET_IMAGE_PATH ?? "/api/ticketbook/analyze",
  },
} as const;
