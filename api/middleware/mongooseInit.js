const mongoose = require("mongoose");
const IpBloqueado = require("../models/ipBloqueado");
const middleware = require("./middleware");

const preencherIpsBloqueados = async () => {
  try {
    let ipBloqueados = await IpBloqueado.find({
      bloqueado: true,
    }).select("ip");
    middleware.setFilterIPs(ipBloqueados.map((ipObj) => ipObj.ip));
  } catch (error) {
    middleware.setFilterIPs([]);
  }
};

const init = () => {
  let uri = `mongodb+srv://${process.env.BD_USER}:${process.env.BD_PASSWORD}@cluster0.6xdew.mongodb.net/${process.env.BD_NAME}?retryWrites=true&w=majority`;
  mongoose.connect(
    uri,
    {
      useNewUrlParser: true,
      useCreateIndex: true,
      useUnifiedTopology: true,
      useFindAndModify: false,
    },
    (err) => {
      if (!err) {
        preencherIpsBloqueados();
        console.log(`App conectou com mongo com sucesso!`);
      } else {
        console.log("Error in DB connection: " + err);
      }
    }
  );
};

module.exports = {
  init,
};
