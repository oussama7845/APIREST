const multer = require("multer");
const { v4: uuidv4 } = require("uuid");
const fs = require('fs');

const TMP_UPLOAD_FOLDER = `${__dirname}/../uploads/tmp`;
const LIMIT_FILE_SIZE = 10 * 1024 * 1024; // 10Mo

// Crée le dossier de destination s'il n'existe pas
if (!fs.existsSync(TMP_UPLOAD_FOLDER)) {
  fs.mkdirSync(TMP_UPLOAD_FOLDER, { recursive: true });
}

const storage = multer.diskStorage({
  destination: function (_req, _file, cb) {
    cb(null, TMP_UPLOAD_FOLDER);
  },
  filename: function (_req, file, cb) {
    const ext = file.originalname.split(".")[file.originalname.split(".").length - 1];
    const renamed = `${uuidv4()}-${Date.now()}.${ext}`;

    const uploaded = {
      originalname: file.originalname.split(".")[0],
      newName: renamed,
      type: file.mimetype,
      fieldname: file.fieldname,
    };

    if (_req.uploadedFiles) {
      _req.uploadedFiles.push(uploaded);
    } else {
      _req.uploadedFiles = [uploaded];
    }

    cb(null, renamed);
  },
});

const upload = multer({
  storage: storage,
  limits: { fileSize: LIMIT_FILE_SIZE },
});

module.exports = upload.fields({ name: "file", maxCount: 1 });

