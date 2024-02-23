const { Client, LocalAuth, MessageMedia } = require('whatsapp-web.js');
const express = require('express');
const { body, validationResult } = require('express-validator');
const socketIO = require('socket.io');
const qrcode = require('qrcode');
const http = require('http');
const fileUpload = require('express-fileupload');
const axios = require('axios');
const mime = require('mime-types');
const port = process.env.PORT || 3000;
const app = express();
const server = http.createServer(app);
const io = socketIO(server);

function delay(t, v) {
  return new Promise(function(resolve) { 
      setTimeout(resolve.bind(null, v), t)
  });
}

app.use((req, res, next) => {
	res.setHeader('Access-Control-Allow-Origin', '*');
	res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE');
	res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
	next();
});

app.use(express.json());
app.use(express.urlencoded({
extended: true
}));
app.use(fileUpload({
debug: true
}));
app.use("/", express.static(__dirname + "/"))

app.get('/', (req, res) => {
  res.sendFile('index.html', {
    root: __dirname
  });
});

const client = new Client({
  authStrategy: new LocalAuth({ clientId: 'bot-zdg' }),
  puppeteer: { headless: true,
    args: [
      '--no-sandbox',
      '--disable-setuid-sandbox',
      '--disable-dev-shm-usage',
      '--disable-accelerated-2d-canvas',
      '--no-first-run',
      '--no-zygote',
      '--single-process', // <- this one doesn't works in Windows
      '--disable-gpu'
    ] }
});

client.initialize();

io.on('connection', function(socket) {
  socket.emit('message', 'BOT Iniciado');
  socket.emit('qr', './icon.png');

client.on('qr', (qr) => {
    console.log('QR RECEIVED', qr);
    qrcode.toDataURL(qr, (err, url) => {
      socket.emit('qr', url);
      socket.emit('message', 'BOT QRCode recebido, aponte a câmera  seu celular!');
    });
});

client.on('ready', () => {
    socket.emit('ready', 'BOT Dispositivo pronto!');
    socket.emit('message', 'BOT Dispositivo pronto!');
    socket.emit('qr', './check.svg')	
    console.log('BOT Dispositivo pronto');
});

client.on('authenticated', () => {
    socket.emit('authenticated', 'BOT Autenticado!');
    socket.emit('message', 'BOT Autenticado!');
    console.log('BOT Autenticado');
});

client.on('auth_failure', function() {
    socket.emit('message', 'BOT Falha na autenticação, reiniciando...');
    console.error('BOT Falha na autenticação');
});

client.on('change_state', state => {
  console.log('BOT Status de conexão: ', state );
});

client.on('disconnected', (reason) => {
  socket.emit('message', 'BOT Cliente desconectado!');
  console.log('BOT Cliente desconectado', reason);
  client.initialize();
});
});

// Send message
app.post('/zdg-message', [
  body('number').notEmpty(),
  body('message').notEmpty(),
], async (req, res) => {
  const errors = validationResult(req).formatWith(({
    msg
  }) => {
    return msg;
  });

  if (!errors.isEmpty()) {
    return res.status(422).json({
      status: false,
      message: errors.mapped()
    });
  }

  const number = req.body.number;
  const numberDDI = number.substr(0, 2);
  const numberDDD = number.substr(2, 2);
  const numberUser = number.substr(-8, 8);
  const message = req.body.message;

  if (numberDDI !== "55") {
    const numberZDG = number + "@c.us";
    client.sendMessage(numberZDG, message).then(response => {
    res.status(200).json({
      status: true,
      message: 'BOT Mensagem enviada',
      response: response
    });
    }).catch(err => {
    res.status(500).json({
      status: false,
      message: 'BOT Mensagem não enviada',
      response: err.text
    });
    });
  }
  else if (numberDDI === "55" && parseInt(numberDDD) <= 30) {
    const numberZDG = "55" + numberDDD + "9" + numberUser + "@c.us";
    client.sendMessage(numberZDG, message).then(response => {
    res.status(200).json({
      status: true,
      message: 'BOT Mensagem enviada',
      response: response
    });
    }).catch(err => {
    res.status(500).json({
      status: false,
      message: 'BOT Mensagem não enviada',
      response: err.text
    });
    });
  }
  else if (numberDDI === "55" && parseInt(numberDDD) > 30) {
    const numberZDG = "55" + numberDDD + numberUser + "@c.us";
    client.sendMessage(numberZDG, message).then(response => {
    res.status(200).json({
      status: true,
      message: 'BOT Mensagem enviada',
      response: response
    });
    }).catch(err => {
    res.status(500).json({
      status: false,
      message: 'BOT Mensagem não enviada',
      response: err.text
    });
    });
  }
});


// Send media
app.post('/zdg-media', [
  body('number').notEmpty(),
  body('caption').notEmpty(),
  body('file').notEmpty(),
], async (req, res) => {
  const errors = validationResult(req).formatWith(({
    msg
  }) => {
    return msg;
  });

  if (!errors.isEmpty()) {
    return res.status(422).json({
      status: false,
      message: errors.mapped()
    });
  }

  const number = req.body.number;
  const numberDDI = number.substr(0, 2);
  const numberDDD = number.substr(2, 2);
  const numberUser = number.substr(-8, 8);
  const caption = req.body.caption;
  const fileUrl = req.body.file;

  let mimetype;
  const attachment = await axios.get(fileUrl, {
    responseType: 'arraybuffer'
  }).then(response => {
    mimetype = response.headers['content-type'];
    return response.data.toString('base64');
  });

  const media = new MessageMedia(mimetype, attachment, 'Media');

  if (numberDDI !== "55") {
    const numberZDG = number + "@c.us";
    client.sendMessage(numberZDG, media, {caption: caption}).then(response => {
    res.status(200).json({
      status: true,
      message: 'BOT Imagem enviada',
      response: response
    });
    }).catch(err => {
    res.status(500).json({
      status: false,
      message: 'BOT Imagem não enviada',
      response: err.text
    });
    });
  }
  else if (numberDDI === "55" && parseInt(numberDDD) <= 30) {
    const numberZDG = "55" + numberDDD + "9" + numberUser + "@c.us";
    client.sendMessage(numberZDG, media, {caption: caption}).then(response => {
    res.status(200).json({
      status: true,
      message: 'BOT Imagem enviada',
      response: response
    });
    }).catch(err => {
    res.status(500).json({
      status: false,
      message: 'BOT Imagem não enviada',
      response: err.text
    });
    });
  }
  else if (numberDDI === "55" && parseInt(numberDDD) > 30) {
    const numberZDG = "55" + numberDDD + numberUser + "@c.us";
    client.sendMessage(numberZDG, media, {caption: caption}).then(response => {
    res.status(200).json({
      status: true,
      message: 'BOT Imagem enviada',
      response: response
    });
    }).catch(err => {
    res.status(500).json({
      status: false,
      message: 'BOT Imagem não enviada',
      response: err.text
    });
    });
  }
});

/* client.on('message', async msg => {

}); */
    
server.listen(port, function() {
        console.log('Aplicação rodando na porta *: ' + port + ' . Acesse no link: http://SEU-IP:' + port);
});
