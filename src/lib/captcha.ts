import { createHmac, randomInt } from "crypto";

const TTL_MS = 10 * 60 * 1000;

function getSecret() {
  return process.env.AUTH_SECRET ?? process.env.CAPTCHA_SECRET ?? "dev-captcha-secret";
}

export function createCaptchaChallenge() {
  const a = randomInt(2, 10);
  const b = randomInt(2, 10);
  const expires = Date.now() + TTL_MS;
  const payload = Buffer.from(JSON.stringify({ a, b, expires, v: 1 })).toString("base64url");
  const sig = createHmac("sha256", getSecret()).update(payload).digest("base64url");
  return {
    question: `What is ${a} + ${b}?`,
    token: `${payload}.${sig}`,
  };
}

export function verifyCaptcha(token: string, answer: string | null | undefined): boolean {
  if (!token || answer === null || answer === undefined || answer === "") return false;

  const [payload, sig] = token.split(".");
  if (!payload || !sig) return false;

  const expected = createHmac("sha256", getSecret()).update(payload).digest("base64url");
  if (sig !== expected) return false;

  let data: { a: number; b: number; expires: number };
  try {
    data = JSON.parse(Buffer.from(payload, "base64url").toString("utf8"));
  } catch {
    return false;
  }

  if (Date.now() > data.expires) return false;
  return Number.parseInt(String(answer).trim(), 10) === data.a + data.b;
}
