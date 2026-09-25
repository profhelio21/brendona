// ===== Filtro de palavrões (usado pela página e pela função) =====
const PALAVRAS = [
  "porra","caralho","caralha","krl","crl","merda","bosta","foda","fodase","foder","fodido","fodida","fudido","fudida","fuder",
  "puta","puto","putaria","putinha","pqp","fdp","vsf","tnc","pnc","vtnc","tmnc","cu","cuzao","cuzona","arrombado","arrombada",
  "buceta","bct","xoxota","xereca","piroca","pica","caceta","cacete","punheta","siririca","viado","viadinho","bicha","sapatao",
  "vadia","vagabunda","vagabundo","piranha","prostituta","rapariga","quenga","corno","corna","otario","otaria","babaca","imbecil",
  "idiota","retardado","retardada","mongol","desgracado","desgracada","desgraca","escroto","escrota",
  "burra","burro","trouxa","safada","safado","baitola","boiola","bosteiro","filhodaputa","filhadaputa","paunocu",
  "tomarnocu","vaisefoder","vaitomarnocu","fuck","fucking","shit","bitch","asshole","dick","pussy","bastard","whore","slut"
];
const RADICAIS = ["caralh","porr","merd","fod","fud","put","arromb","bucet","punhet","vagabund","desgrac","escrot","cuza","viad"];
const EXCECOES = ["porrada","portal","podemos","fodao","putz","viadut","fudeu","computador","deputad","reputa","disput","imput","amput"];
const COLADAS = ["filhodaputa","filhadaputa","caralho","arrombad","buceta","vaisefoder","punheta","piroca"];

export function normalizar(t) {
  return String(t).toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "")
    .replace(/[@4]/g, "a").replace(/3/g, "e").replace(/[1!|]/g, "i").replace(/0/g, "o")
    .replace(/[5$]/g, "s").replace(/7/g, "t").replace(/ç/g, "c");
}
const semRepeticao = (w) => w.replace(/(.)\1+/g, "$1");

export function temPalavrao(texto) {
  let n = normalizar(texto);
  // junta letras soltas: "p u t a" / "p.u.t.a" -> "puta"
  n = n.replace(/\b(?:[a-z][\s._\-*]+){2,}[a-z]\b/g, (m) => m.replace(/[\s._\-*]+/g, ""));
  const palavras = n.split(/[^a-z]+/).filter(Boolean);
  const lista = new Set(PALAVRAS);
  for (const w of palavras) {
    const v = [w, semRepeticao(w)];
    for (const p of v) {
      if (lista.has(p)) return true;
      if (EXCECOES.some((e) => p.startsWith(e))) continue;
      if (RADICAIS.some((r) => p.startsWith(r) && p.length <= r.length + 6)) return true;
    }
  }
  const colado = semRepeticao(n.replace(/[^a-z]/g, ""));
  return COLADAS.some((c) => colado.includes(c));
}

