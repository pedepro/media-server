const express = require('express');
const multer = require('multer');
const { v4: uuidv4 } = require('uuid');
const cors = require('cors');
const path = require('path');
const fs = require('fs');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());

// Configuração do Multer para salvar arquivos
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadDir = path.join(__dirname, 'uploads');
    console.log('Verificando diretório de upload:', uploadDir);
    if (!fs.existsSync(uploadDir)) {
      console.log('Diretório não existe, criando:', uploadDir);
      fs.mkdirSync(uploadDir);
    } else {
      console.log('Diretório já existe:', uploadDir);
    }
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    console.log('Recebido arquivo:', file.originalname);
    const ext = path.extname(file.originalname);
    const uniqueName = `${uuidv4()}${ext}`;
    console.log('Nome gerado para o arquivo:', uniqueName);
    cb(null, uniqueName);
  }
});

const upload = multer({ storage });

// Endpoint para upload
app.post('/upload', upload.single('file'), (req, res) => {
  console.log('Requisição POST /upload recebida');
  console.log('Corpo da requisição:', req.body);
  console.log('Arquivo recebido:', req.file);

  if (!req.file) {
    console.error('Nenhum arquivo enviado na requisição');
    return res.status(400).json({ error: 'Nenhum arquivo enviado' });
  }

  const fileUrl = `${req.protocol}://${req.get('host')}/uploads/${req.file.filename}`;
  console.log('URL gerada para o arquivo:', fileUrl);
  res.json({ url: fileUrl });
});

// Endpoint para listar arquivos
app.get('/files', (req, res) => {
  const uploadDir = path.join(__dirname, 'uploads');
  console.log('Requisição GET /files recebida, listando arquivos em:', uploadDir);
  
  fs.readdir(uploadDir, (err, files) => {
    if (err) {
      console.error('Erro ao listar arquivos:', err);
      return res.status(500).json({ error: 'Erro ao listar arquivos' });
    }
    console.log('Arquivos encontrados:', files);
    const fileUrls = files.map(file => `${req.protocol}://${req.get('host')}/uploads/${file}`);
    console.log('URLs retornadas:', fileUrls);
    res.json(fileUrls);
  });
});

// Servir arquivos estáticos
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Iniciar o servidor
app.listen(PORT, () => {
  console.log(`Servidor rodando na porta ${PORT}`);
});