const rateLimit = require("express-rate-limit");
const logger = require("morgan");
const moment = require("moment");

const IpBloqueado = require("../models/ipBloqueado");

let filterIPs = [];

const JANELA_RATE_LIMIT = 1 * 60 * 1000; // Janela de 1 min
const MAX_TENTATIVAS_CONSECUTIVAS = 5; // passa a bloquear após 5 requisicoes

const JANELA_TEMPO_RENOVAR_BLOQUEIO = 0.1;
const MAX_INTERRUPCOES_ANTES_DE_BLOQUEIO = 12;

const setFilterIPs = (ipList) => {
  for (const ip of ipList) {
    filterIPs.push(ip);
  }
};

const deveBloquearIP = (doc, now) => {
  const listaNotificacoes = doc.notificacoes;
  let qtdNotificacoes = listaNotificacoes.length;
  let i;
  for (i = qtdNotificacoes; i > 0; i--) {
    const dataNotificacao = listaNotificacoes[i - 1].data;
    const intervaloNotificacaoAgora = moment
      .duration(now.diff(dataNotificacao))
      .asHours();
    if (intervaloNotificacaoAgora > JANELA_TEMPO_RENOVAR_BLOQUEIO) {
      break;
    }
  }
  qtdNotificacoes -= i;
  return qtdNotificacoes >= MAX_INTERRUPCOES_ANTES_DE_BLOQUEIO;
};

const limitReached = async (req, res) => {
  if (process.env.NODE_ENV != "production") {
    return;
  }

  const now = moment().utcOffset(-3);
  const nowDate = now.toDate();
  const nowString = now.format("DD/MM/YYYY HH:mm");

  const filter = { ip: req.ip };
  let doc = await IpBloqueado.findOne(filter);
  if (doc == null) {
    doc = new IpBloqueado({ ip: req.ip });
  } else {
    const intervaloUltimaNotificacaoAgora = moment
      .duration(now.diff(doc.ultimaNotificacao))
      .asMilliseconds();
    if (intervaloUltimaNotificacaoAgora < JANELA_RATE_LIMIT) {
      res.status(429).send({
        mensagem: "Muitas requisições. Tente novamente mais tarde.",
      });
      return;
    }
  }
  doc.notificacoes.push({
    data: nowDate,
    dataString: nowString,
  });
  doc.ultimaNotificacao = now;

  if (deveBloquearIP(doc, now) || doc.bloqueado) {
    doc.bloqueado = true;
    if (!filterIPs.includes(req.ip)) {
      filterIPs.push(req.ip);
    }
  }

  // { $inc: { no_of_likes: 1 } , "$push": { "users": userInfo } }
  const result = await IpBloqueado.findOneAndUpdate(filter, doc, {
    new: true,
    upsert: true, // Make this update into an upsert
  });

  res.status(429).send({
    mensagem: "Muitas requisições. Tente novamente mais tarde.",
  });
};

const rateLimiter = rateLimit({
  windowMs: JANELA_RATE_LIMIT,
  max: MAX_TENTATIVAS_CONSECUTIVAS,
  handler: limitReached,
});

const loggerInit = (req, res, next) => {
  if (process.env.NODE_ENV != "production") {
    logger("combined");
  }
  next();
};

module.exports = {
  filterIPs,
  setFilterIPs,
  rateLimiter,
  logger: loggerInit,
};
