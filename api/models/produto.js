const mongoose = require("mongoose");
const Joi = require("../util/joi");

var produtoSchema = new mongoose.Schema({
  nome: {
    type: String,
    required: true,
    unique: true,
  },
  preco: {
    type: Number,
    required: true,
  },
  descricao: {
    type: String,
    required: true,
  },
  imagem: String,
  permiteAlteracao: {
    type: Boolean,
    default: false,
  },
});

const joiSchema = Joi.object({
  nome: Joi.string().min(1, "utf8").trim().required(),
  preco: Joi.number().positive().precision(2).required(),
  descricao: Joi.string().min(10, "utf8"),
  imagem: Joi.string(),
  permiteAlteracao: Joi.boolean(),
}).options({
  abortEarly: false,
});

produtoSchema.methods.joiValidate = function (obj) {
  // valida em inglês
  // let { error } = joiSchema.validate(obj);
  // valida em portugues
  let errorPtBr = Joi.validatePt(joiSchema, obj);
  return errorPtBr;
};

//Export the model
module.exports = mongoose.model("Produto", produtoSchema);
