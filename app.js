const express = require("express");
const helmet = require("helmet");
const ipfilter = require("express-ipfilter").IpFilter;

const pedidosRoutes = require("./api/routes/pedidos");
const produtosRoutes = require("./api/routes/produtos");
const usuariosRoutes = require("./api/routes/usuarios");

const middleware = require("./api/middleware/middleware");
const mongooseInit = require("./api/middleware/mongooseInit");

const app = express();
const port = process.env.PORT || 3000;
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

mongooseInit.init();

app.use(middleware.logger);

app.use(ipfilter(middleware.filterIPs));
app.use(middleware.rateLimiter);
app.use(helmet());

app.use("/static", express.static("public"));
app.use("/files", express.static("tmp/uploads"));

app.use("/pedidos", pedidosRoutes);
app.use("/produtos", produtosRoutes);
app.use("/usuario", usuariosRoutes);

app.use(function (req, res, next) {
  const error = new Error("URL não encontrada");
  error.status = 404;
  next(error);
});

app.use((error, req, res, next) => {
  res.status(error.status || 500);
  res.json({
    mensagem: error.message,
  });
});

app.listen(port, () => {
  console.log(`App iniciou na port ${port}!`);
});
