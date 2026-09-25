// Mural de mensagens da Major — Netlify Function + Netlify Blobs
import { getStore } from "@netlify/blobs";

import { temPalavrao } from "../../filtro.mjs";

// ===== API =====
const json = (d, s = 200) => new Response(JSON.stringify(d), {
  status: s, headers: { "content-type": "application/json; charset=utf-8", "cache-control": "no-store" }
});
const limpar = (s, max) => String(s || "").replace(/[<>]/g, "").replace(/\s+/g, " ").trim().slice(0, max);
const CORES = ["rosa", "lilas", "pessego", "menta", "amarelo", "azul"];

export default async (req) => {
  const store = getStore({ name: "mural-major", consistency: "strong" });

  if (req.method === "GET") {
    const { blobs } = await store.list({ prefix: "msg-" });
    const itens = await Promise.all(blobs.map((b) => store.get(b.key, { type: "json" })));
    const lista = itens.filter(Boolean).sort((a, b) => b.criado - a.criado);
    return json(lista);
  }

  if (req.method === "POST") {
    let body;
    try { body = await req.json(); } catch { return json({ erro: "JSON inválido" }, 400); }

    // curtir uma mensagem
    if (body.acao === "curtir") {
      const key = String(body.id || "");
      if (!key.startsWith("msg-")) return json({ erro: "id inválido" }, 400);
      const m = await store.get(key, { type: "json" });
      if (!m) return json({ erro: "não encontrada" }, 404);
      m.curtidas = (m.curtidas || 0) + 1;
      await store.setJSON(key, m);
      return json(m);
    }

    // apagar (só com a senha de admin definida no painel da Netlify)
    if (body.acao === "apagar") {
      const senha = String((globalThis.Netlify?.env?.get?.("ADMIN_SENHA")) || process.env.ADMIN_SENHA || "").trim();
      if (!senha) return json({ erro: "a variável ADMIN_SENHA não chegou na função — faça um novo deploy" }, 403);
      if (String(body.senha || "").trim() !== senha) return json({ erro: "senha errada" }, 403);
      await store.delete(String(body.id || ""));
      return json({ ok: true });
    }

    // nova mensagem
    const nome = limpar(body.nome, 40) || "Anônimo 💌";
    const texto = limpar(body.texto, 400);
    const cor = CORES.includes(body.cor) ? body.cor : "rosa";
    if (texto.length < 2) return json({ erro: "Escreva uma mensagem 💬" }, 400);
    if (temPalavrao(nome) || temPalavrao(texto)) {
      return json({ erro: "Opa! Essa mensagem tem palavras não permitidas 🙊 Vamos mandar só carinho pra Major!" }, 422);
    }
    const criado = Date.now();
    const id = `msg-${criado}-${Math.random().toString(36).slice(2, 8)}`;
    const msg = { id, nome, texto, cor, criado, curtidas: 0 };
    await store.setJSON(id, msg);
    return json(msg, 201);
  }

  return json({ erro: "método não suportado" }, 405);
};

export const config = { path: "/api/mensagens" };
