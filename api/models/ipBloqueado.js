const mongoose = require("mongoose");

var ipSchema = new mongoose.Schema({
  notificacoes: {
    type: [
      {
        data: Date,
        dataString: String,
      },
    ],
  },
  ip: {
    type: String,
    required: true,
  },
  bloqueado: {
    type: Boolean,
    default: false,
  },
  ultimaNotificacao: {
    type: Date,
  },
});

//Export the model
module.exports = mongoose.model("BloquearIP", ipSchema);
