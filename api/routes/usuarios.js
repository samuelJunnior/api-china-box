const express = require("express");
const mongoose = require("mongoose");
const Usuario = require("../models/user");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const router = express.Router();

router.post("/cadastrar", (req, res) => {
  // Verifica se usuario já existe
  Usuario.find({ email: req.body.email }).then((user) => {
    if (user.length >= 1) {
      return res.status(409).json({
        message: "Email já cadastrado",
      });
    }

    // Faz o hash da senha, passa o número de salting rounds
    bcrypt.hash(req.body.password, 10, (err, hash) => {
      if (err) {
        return res.status(500).json({
          error: err,
        });
      }

      const user = new Usuario({
        email: req.body.email,
        password: hash,
      });

      user
        .save()
        .then((result) => {
          console.log(result);
          res.status(201).json({
            message: "Usuario criado",
          });
        })
        .catch((err) => {
          console.log(err);
          res.status(500).json({
            error: err,
          });
        });
    });
  });
});

router.post("/login", (req, res, next) => {
  Usuario.find({ email: req.body.email })
    .then((user) => {
      if (user.length < 1) {
        return res.status(401).json({ message: "Auth Failed" });
      }
      // Se há usuário, bcrypt compara, mesmo se os hashs
      // forem diferentes o bcrypt sabe quando foram criados com o
      // mesmo algoritmo e mesma chave
      bcrypt.compare(req.body.password, user[0].password, (err, result) => {
        if (err) {
          res.status(401).json({ message: "Auth failed" });
        }
        // Se a senha está correta
        if (result) {
          // payload, chave secreta, opções
          const token = jwt.sign(
            { email: user[0].email, userId: user[0]._id },
            process.env.JWT_KEY,
            { expiresIn: "1h" }
          );
          return res
            .status(200)
            .json({ message: "Auth successful", token: token });
        }
        res.status(401).json({ message: "Auth failed" });
      });
    })
    .catch((err) => {
      console.log(err);
      res.status(500).json({ error: err });
    });
});

router.delete("/:userId", (req, res, next) => {
  Usuario.remove({ _id: req.params.userId })
    .then((result) => {
      res.status(200).json({
        message: "Usuario apagado",
      });
    })
    .catch((err) => {
      console.log(err);
      res.status(500).json({
        error: err,
      });
    });
});

module.exports = router;
