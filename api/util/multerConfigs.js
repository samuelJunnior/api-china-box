const multer = require("multer");
const crypto = require("crypto");
const aws = require("aws-sdk");
const multerS3 = require("multer-s3");
const path = require("path");
const { unlink } = require("fs");
const util = require("util");

const unlinkFile = util.promisify(unlink);

const TAMANHO_MAXIMO_MEGABYTES = 5 * 1024 * 1024; // 5MB
const PASTA_TEMPORARIA = "tmp/uploads";

const s3 = new aws.S3({
  bucket: process.env.BUCKET_NAME,
  region: process.env.AWS_DEFAULT_REGION,
  accessKeyId: process.env.AWS_ACCESS_KEY_ID,
  secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
});

const atualizarNomeArquivo = function (req, file, cb) {
  crypto.randomBytes(16, (err, hash) => {
    if (err) cb(err);

    let fileName = `${hash.toString("hex")}-${file.originalname}`;
    if (process.env.STORAGE_TYPE === "local") {
      file.key = PASTA_TEMPORARIA + "/" + fileName;
    } else {
      fileName = "teste/" + fileName;
    }

    cb(null, fileName);
  });
};

const storageTypes = {
  local: multer.diskStorage({
    destination: (req, file, cb) => {
      cb(null, path.resolve(PASTA_TEMPORARIA));
    },
    filename: atualizarNomeArquivo,
  }),
  s3: multerS3({
    s3: s3,
    bucket: process.env.BUCKET_NAME,
    contentType: multerS3.AUTO_CONTENT_TYPE,
    ACL: "public-read",
    key: atualizarNomeArquivo,
  }),
};

const uploadImage = {
  dest: path.resolve(PASTA_TEMPORARIA),
  storage: storageTypes[process.env.STORAGE_TYPE],
  limits: {
    fileSize: TAMANHO_MAXIMO_MEGABYTES,
  },
  fileFilter: (req, file, cb) => {
    const allowedMimes = [
      "image/jpeg",
      "image/pjpeg",
      "image/png",
      "image/gif",
    ];

    if (allowedMimes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error("Tipo de arquivo inválido."));
    }
  },
};

const deleteImage = async (key) => {
  try {
    if (process.env.STORAGE_TYPE === "local") {
      await unlinkFile(key);
    } else {
      let erro;
      await s3
        .deleteObject(
          {
            Bucket: process.env.BUCKET_NAME,
            Key: key,
          },
          function (err, data) {
            erro = err;
            if (err) console.log(err, err.stack);
            else console.log("Response:", data);
          }
        )
        .promise();
    }
  } catch (err) {
    if (err.errno == -2) {
      err.message = "Arquivo não encontrado";
    }
    console.log("ERROR in file Deleting : " + JSON.stringify(err));
    throw err;
  }
};

const getFileStream = (fileKey) => {
  const config = {
    Key: fileKey,
    Bucket: process.env.BUCKET_NAME,
  };

  return s3.getObject(config).createReadStream();
};

const downloadFileS3 = (fileKey, res) => {
  const stream = getFileStream(fileKey);
  stream.on("error", (err) => {
    res.status(500).send({ mensagem: "Arquivo não encontrado" });
  });
  stream.pipe(res);
};

const downloadFileServer = (fileKey, res) => {
  res.download(fileKey);
};

const downloadFile = (fileKey, res) => {
  if (process.env.STORAGE_TYPE === "local") {
    downloadFileServer(fileKey, res);
  } else {
    downloadFileS3(fileKey, res);
  }
};

module.exports = {
  uploadImage,
  deleteImage,
  downloadFile,
};
