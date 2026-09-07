import { randomInt } from "node:crypto";
import { Router, type IRouter } from "express";

const router: IRouter = Router();
const codePattern = /^[A-Z0-9]{6}$/;
const calls = new Map<string, { id: string; message: string; createdAt: string; acknowledged: boolean }[]>();
const devices = new Map<string, { token: string; label: string }[]>();

function createPairCode() {
  const alphabet = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  return Array.from({ length: 6 }, () => alphabet[randomInt(alphabet.length)]).join("");
}

router.post("/spider/pairs", (_req, res) => {
  const pairCode = createPairCode();
  calls.set(pairCode, []);
  res.status(201).json({ pairCode });
});

router.post("/spider/pairs/:pairCode/calls", (req, res) => {
  const pairCode = String(req.params.pairCode).toUpperCase();
  const message = typeof req.body?.message === "string" ? req.body.message.trim() : "Chamado Spider";
  if (!codePattern.test(pairCode) || !calls.has(pairCode)) return res.status(404).json({ error: "Código Spider não encontrado." });
  if (!message) return res.status(400).json({ error: "A mensagem do chamado é obrigatória." });
  const call = { id: crypto.randomUUID(), message, createdAt: new Date().toISOString(), acknowledged: false };
  calls.get(pairCode)!.push(call);
  void sendPushes(pairCode, message);
  return res.status(201).json({ call });
});

router.post("/spider/pairs/:pairCode/devices", (req, res) => {
  const pairCode = String(req.params.pairCode).toUpperCase();
  const token = typeof req.body?.token === "string" ? req.body.token.trim() : "";
  const label = typeof req.body?.label === "string" ? req.body.label.trim() : "dispositivo";
  if (!codePattern.test(pairCode) || !calls.has(pairCode)) return res.status(404).json({ error: "Código Spider não encontrado." });
  if (!token) return res.status(400).json({ error: "Token de notificação obrigatório." });
  const pairDevices = devices.get(pairCode) ?? [];
  devices.set(pairCode, [...pairDevices.filter((device) => device.token !== token), { token, label }]);
  return res.status(201).json({ registered: true });
});

router.get("/spider/pairs/:pairCode/calls", (req, res) => {
  const pairCode = String(req.params.pairCode).toUpperCase();
  if (!codePattern.test(pairCode) || !calls.has(pairCode)) return res.status(404).json({ error: "Código Spider não encontrado." });
  return res.json({ calls: calls.get(pairCode)!.slice(-20) });
});

router.post("/spider/pairs/:pairCode/calls/:callId/acknowledge", (req, res) => {
  const pairCode = String(req.params.pairCode).toUpperCase();
  const call = calls.get(pairCode)?.find((item) => item.id === req.params.callId);
  if (!call) return res.status(404).json({ error: "Chamado não encontrado." });
  call.acknowledged = true;
  return res.json({ call });
});

export default router;

async function sendPushes(pairCode: string, message: string) {
  const pairDevices = devices.get(pairCode) ?? [];
  if (!pairDevices.length) return;
  await fetch("https://exp.host/--/api/v2/push/send", {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify(pairDevices.map(({ token }) => ({
      to: token,
      title: "CHAMADO SPIDER",
      body: message,
      sound: "default",
      priority: "high",
      channelId: "spider-calls",
      data: { type: "spider-call", pairCode },
    }))),
  }).catch(() => undefined);
}