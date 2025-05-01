const express = require('express');
const multer = require('multer');
const { v4: uuidv4 } = require('uuid');
const cors = require('cors');
const path = require('path');
const fs = require('fs');

const app = express();
const PORT = process.env.PORT || 3000;

// Diretório de uploads
const uploadDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir);
}

app.use(cors());
app.use(express.json());
app.use('/uploads', express.static(uploadDir));

// Configuração do Multer
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname);
    const uniqueName = `${uuidv4()}${ext}`;
    cb(null, uniqueName);
  }
});
const upload = multer({ storage });

// Upload de uma imagem
app.post('/upload', upload.single('file'), (req, res) => {
  if (!req.file) return res.status(400).json({ error: 'Nenhum arquivo enviado' });

  const fileUrl = `https://${req.get('host')}/uploads/${req.file.filename}`;
  res.json({ url: fileUrl });
});

// Upload de várias imagens
app.post('/upload-multiple', upload.array('files', 10), (req, res) => {
  if (!req.files || req.files.length === 0) {
    return res.status(400).json({ error: 'Nenhum arquivo enviado' });
  }

  const urls = req.files.map(file => `https://${req.get('host')}/uploads/${file.filename}`);
  res.json({ urls });
});

// Listar arquivos
app.get('/files', (req, res) => {
  fs.readdir(uploadDir, (err, files) => {
    if (err) return res.status(500).json({ error: 'Erro ao listar arquivos' });

    const urls = files.map(file => `https://${req.get('host')}/uploads/${file}`);
    res.json(urls);
  });
});

app.listen(PORT, () => {
  console.log(`Servidor rodando na porta ${PORT}`);
});

