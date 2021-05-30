const admin = require("firebase-admin");
const firebaseAccount = require("./firebase-adminsdk.json");

admin.initializeApp({
  credential: admin.credential.cert(firebaseAccount),
});

const sendPushnotification = (registrationToken, data, titulo, corpo) => {
  const message = {
    notification: {
      title: titulo,
      body: corpo,
    },
    data: data,
    token: registrationToken,
  };

  admin
    .messaging()
    .send(message)
    .then((response) => {
      console.log("Enviou mensagem com sucesso:", response);
    })
    .catch((error) => {
      console.log("Erro no envio de mensagem:", error);
    });
};

module.exports = {
  send: sendPushnotification,
};
