import { OAuth2Client } from "google-auth-library";
import { Router, type IRouter } from "express";

const router: IRouter = Router();

router.post("/auth/google", async (req, res) => {
  const credential = typeof req.body?.idToken === "string" ? req.body.idToken : "";
  const clientId = process.env.GOOGLE_CLIENT_ID;
  if (!clientId) return res.status(503).json({ error: "Google Login ainda não foi configurado no servidor." });
  if (!credential) return res.status(400).json({ error: "Token Google ausente." });

  try {
    const client = new OAuth2Client(clientId);
    const ticket = await client.verifyIdToken({ idToken: credential, audience: clientId });
    const payload = ticket.getPayload();
    if (!payload?.sub || !payload.email || payload.email_verified !== true) {
      return res.status(401).json({ error: "Conta Google não verificada." });
    }
    return res.json({ user: { id: payload.sub, email: payload.email, name: payload.name ?? "", picture: payload.picture ?? "" } });
  } catch {
    return res.status(401).json({ error: "Token Google inválido ou expirado." });
  }
});

export default router;