import express from 'express';
import http from 'http';
import fs from 'fs';

const app = express() as any;
const server = http.createServer(app);
const port = process.env.PORT || 3000;

server.listen(port, () => {
    console.log(`Server: http://localhost:${port}`);
});

app.set('view engine', 'ejs');

app.use('/public', express.static('public'));

app.get('/', (_, res) => {
    res.render('index', {'js': (process.env.NODE_ENV == `production`) ? fs.readFileSync('./game/index.min.js') : fs.readFileSync('./build/game/index.js')});
});