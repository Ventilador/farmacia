import { Application } from 'express';
import { createSafeReadStream, createWriteStream, stat, writeFile } from './fileSystem';

export function medicosEndpoint(app: Application) {
  const file = './medicos.json';
  return stat(file).catch(_ => writeFile(file, '')).then(_ => {
    app.get('/api/medicos', (_, res) => {
      createSafeReadStream(file, res);
    }).post('/api/medicos', (req, res) => {
      req.pipe(createWriteStream(file)).on('close', function () {
        res.writeHead(204);
        res.end();
      });
    });
  });
}

