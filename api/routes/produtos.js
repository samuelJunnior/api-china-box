const express = require("express");
const multer = require("multer");
const multerConfig = require("../util/multerConfigs");
const Produto = require("../models/produto");
const checkAuth = require("../middleware/check-auth");
const router = express.Router();

router.get("/", (req, res) => {
  let { pagina } = req.headers;
  pagina = pagina === undefined ? 0 : pagina;
  const elementos = 3,
    skipElementos = pagina * elementos;

  Produto.find()
    .skip(skipElementos)
    .limit(elementos)
    .lean()
    .then((doc) => {
      res.send(doc);
    })
    .catch((err) => {
      next(err);
    });
});

router.get("/autenticado", checkAuth, (req, res) => {
  let { pagina } = req.headers;
  pagina = pagina === undefined ? 0 : pagina;
  const elementos = 3,
    skipElementos = pagina * elementos;

  Produto.find()
    .skip(skipElementos)
    .limit(elementos)
    .lean()
    .then((doc) => {
      res.send(doc);
    })
    .catch((err) => {
      next(err);
    });
});

router.post("/", async function (req, res, next) {
  try {
    let produto = new Produto(req.body);
    let error = produto.joiValidate(req.body);
    if (error != null) {
      throw error;
    }

    const doc = await produto.save();
    res.send(doc);
  } catch (err) {
    if (err.name === "MongoError" && err.code === 11000) {
      res
        .status(409)
        .send({ mensagem: "Produto já existente!", erro: err.message });
    } else {
      next(err);
    }
  }
});

router.post(
  "/image",
  multer(multerConfig.uploadImage).single("imagemProduto"),
  async function (req, res, next) {
    const { originalname: name, size, key, location: url } = req.file;
    req.body.imagem = key;
    try {
      let produto = new Produto(req.body);
      let error = produto.joiValidate(req.body);
      if (error != null) {
        throw error;
      }

      const doc = await produto.save();
      res.send(doc);
    } catch (err) {
      await multerConfig.deleteImage(key);
      if (err.name === "MongoError" && err.code === 11000) {
        res.status(409).send({ mensagem: "Produto já existente!" });
      } else {
        next(err);
      }
    }
  }
);

router.get("/image", async (req, res, next) => {
  const { key } = req.body;
  try {
    multerConfig.downloadFile(key, res);
  } catch (err) {
    next(err);
  }
});

router.get("/:produtoId", (req, res) => {
  const { produtoId } = req.params;
  Produto.find({
    _id: produtoId,
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

router.patch("/:produtoId", function (req, res) {
  const { produtoId } = req.params;
  const updateParams = {};
  for (const param of Object.keys(req.body)) {
    updateParams[param] = req.body[param];
  }
  Produto.updateOne({ _id: produtoId }, { $set: updateParams })
    .then((doc) => {
      console.log(doc);
      res.status(204).send();
    })
    .catch((err) => {
      console.log(err);
      next(err);
    });
});

router.delete("/:produtoId", function (req, res) {
  const { produtoId } = req.params;
  Produto.remove({
    _id: produtoId,
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
