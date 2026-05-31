import "dotenv/config";

function required(key: string): string {
  const v = process.env[key];
  if (!v) throw new Error(`${key} is required`);
  return v;
}

export const env = {
  port: Number(process.env.PORT ?? 4003),
  appUrl: process.env.APP_URL ?? "http://localhost:3001",
  apiUrl: process.env.API_URL ?? `http://localhost:${process.env.PORT ?? 4003}`,
  authSecret: required("AUTH_SECRET"),
  entraClientId: required("AUTH_MICROSOFT_ENTRA_ID_ID"),
  entraClientSecret: required("AUTH_MICROSOFT_ENTRA_ID_SECRET"),
  entraIssuer: required("AUTH_MICROSOFT_ENTRA_ID_ISSUER"),
  entraApiScope: required("ENTRA_API_SCOPE"),
  mongoUri: required("MONGO_URI"),
  dbName: required("DB_NAME"),
  wireserversSecurityUrl: (process.env.WIRESERVERS_SECURITY_URL ?? "https://secure.wireservers.com").replace(/\/$/, ""),
  azureOpenAi: {
    endpoint: process.env.AZURE_OPENAI_ENDPOINT,
    apiKey: process.env.AZURE_OPENAI_API_KEY,
    deploymentText: process.env.AZURE_OPENAI_DEPLOYMENT_TEXT ?? "gpt-4-1-mini",
    deploymentVision: process.env.AZURE_OPENAI_DEPLOYMENT_VISION ?? "gpt-4-1-mini",
    apiVersion: process.env.AZURE_OPENAI_API_VERSION ?? "2024-10-21",
  },
};
