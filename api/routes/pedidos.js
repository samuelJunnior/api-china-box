const express = require("express");
const mongoose = require("mongoose");
const router = express.Router();
const Pedido = require("../models/pedido");
const Produto = require("../models/produto");
const pushNotifications = require("../util/pushNotifications");

router.get("/", (req, res) => {
  Pedido.find()
    .populate("lista.idProduto") // .populate("user", "-password -someOtherField -AnotherField")
    .then((doc) => {
      console.log(doc);
      res.send(doc);
    })
    .catch((err) => {
      console.log(err);
      next(err);
    });
});

router.post("/", async function (req, res, next) {
  const { nomeUsuario, lista } = req.body;
  const listaIdProduto = lista.map((elem) => {
    return elem.idProduto;
  });
  const totalEncontrados = await Produto.countDocuments({
    _id: { $in: listaIdProduto },
  });

  if (listaIdProduto.length != totalEncontrados) {
    res.status(406).send({ mensagem: "Produtos não encontrados" });
    return;
  }

  let pedido = new Pedido({
    nomeUsuario: nomeUsuario,
    lista: lista,
  });

  pedido
    .save()
    .then((doc) => {
      console.log(doc);

      const registrationToken =
        "fcPD4-GqRv-CgYYq5KsuCu:APA91bEqf4R72qGBl7ui-fdDM3RegLKwm1R_7XVpSls5KDpeJ1BpQ614xoxldshqZPqdcLbu9SrLQG2s7cp6sP-sGG1R7ustpZmU92GqTrqtHE6lw_Ryuf-ZBKgIIgdoG_FEn0kU-APy";
      const data = {};
      const titulo = "Novo pedido";
      const corpo = "Um novo pedido foi feito em sua conta.";
      pushNotifications.send(registrationToken, data, titulo, corpo);

      res.send({ pedido: doc });
    })
    .catch((err) => {
      console.error(err);
      next(err);
    });
});

router.get("/:pedidoId", (req, res) => {
  const { pedidoId } = req.params;
  Pedido.find({
    _id: pedidoId,
  })
    .then((doc) => {
      console.log(doc);
      res.send(doc);
    })
    .catch((err) => {
      console.log(err);
      next(err);
    });
});

router.delete("/:pedidoId", function (req, res) {
  const { pedidoId } = req.params;
  Pedido.remove({
    _id: pedidoId,
  })
    .then((doc) => {
      console.log(doc);
      res.status(204).send();
    })
    .catch((err) => {
      console.log(err);
      next(err);
    });
});

module.exports = router;
