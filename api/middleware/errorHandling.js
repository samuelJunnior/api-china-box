const urlNotFound = (req, res, next) => {
  const error = new Error("URL não encontrada");
  error.status = 404;
  next(error);
};

const generalError = (req, res, next) => {
  res.status(error.status || 500);
  res.json({
    mensagem: error.message,
  });
};

module.exports = {
  urlNotFound,
  generalError,
};
