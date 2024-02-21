# BOT ZDG

Olá, essa é uma implementação da biblioteca <a href="https://github.com/pedroslopez/whatsapp-web.js">wweb.js</a>

Conheça o canal da Comunidade ZDG:

- <a href="https://www.youtube.com/channel/UCrPbAoQKz42Gm0mLdWatAEA">Comunidade ZDG</a>


### Como usar?

- git clone https://github.com/daniseveriano/comunidadezdg.git
- cd comunidadezdg
- Rodar `npm install`
- Obs de <strong>Daniele Severiano</strong>: Rodar `openssl req -nodes -new -x509 -keyout server.key -out server.cert` para criar os arquivos server.key e server.cert 
- Obs de <strong>Daniele Severiano</strong>: Configurar o SSH do seu servidor para rodar esta aplicação externamente
- Rodar `npm start`
- Abrir o browser no endereço `https://SEU-IP:3000`
- Ler o QRCode na tela


## Este repositório é um fork do repositório original da Comunidade ZDG

Aqui foi implementado um certificado SSL autoassinado para as requisições;
As mensagens de resposta às mensagens dos clientes foram comentadas no código;
Foram acrescidas configurações no Header das requisições para resolver erros de CORS (Cross-Origin Resource Sharing).
