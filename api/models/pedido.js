const mongoose = require("mongoose");

var produtoSubSchema = mongoose.Schema(
  {
    idProduto: { type: mongoose.Schema.Types.ObjectId, ref: "Produto" },
    qtd: {
      type: Number,
      default: 1,
    },
    comentario: String,
  },
  { _id: false }
);

var pedidoSchema = new mongoose.Schema({
  data: {
    type: Date,
    default: Date.now,
  },
  nomeUsuario: {
    type: String,
    required: true,
  },
  lista: [produtoSubSchema],
});

//Export the model
module.exports = mongoose.model("Pedido", pedidoSchema);
