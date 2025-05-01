const express = require('express');
const multer = require('multer');
const { v4: uuidv4 } = require('uuid');
const cors = require('cors');
const path = require('path');
const fs = require('fs');

const app = express();
const PORT = process.env.PORT || 3000;

// Caminho do diretório de uploads (usando variável de ambiente ou fallback local)
const uploadDir = process.env.UPLOADS_DIR || path.join(__dirname, 'uploads');

// Garantir que o diretório existe
if (!fs.existsSync(uploadDir)) {
  console.log('Criando diretório de upload:', uploadDir);
  fs.mkdirSync(uploadDir, { recursive: true });
} else {
  console.log('Diretório de upload já existe:', uploadDir);
}

// Middleware
app.use(cors());
app.use(express.json());

// Configuração do Multer para salvar arquivos
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname);
    const uniqueName = `${uuidv4()}${ext}`;
    console.log('Arquivo recebido:', file.originalname);
    console.log('Nome gerado para o arquivo:', uniqueName);
    cb(null, uniqueName);
  }
});

const upload = multer({ storage });

// Endpoint para upload
app.post('/upload', upload.single('file'), (req, res) => {
  console.log('Requisição POST /upload recebida');
  if (!req.file) {
    console.error('Nenhum arquivo enviado na requisição');
    return res.status(400).json({ error: 'Nenhum arquivo enviado' });
  }

  const fileUrl = `https://${req.get('host')}/uploads/${req.file.filename}`;
  console.log('URL gerada para o arquivo:', fileUrl);
  res.json({ url: fileUrl });
});

// Endpoint para listar arquivos
app.get('/files', (req, res) => {
  fs.readdir(uploadDir, (err, files) => {
    if (err) {
      console.error('Erro ao listar arquivos:', err);
      return res.status(500).json({ error: 'Erro ao listar arquivos' });
    }
    const fileUrls = files.map(file => `https://${req.get('host')}/uploads/${file}`);
    res.json(fileUrls);
  });
});

// Servir arquivos estáticos
app.use('/uploads', express.static(uploadDir));

// Iniciar o servidor
app.listen(PORT, () => {
  console.log(`Servidor rodando na porta ${PORT}`);
});
