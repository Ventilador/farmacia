import { spawnSync } from 'child_process';
import { Application } from 'express';
import { folder } from './fileSystem';

export function abrirCarpeta(app: Application) {
  app.post('/api/abrir-carpeta', function (_, response) {
    spawnSync('start .', {
      cwd: folder,
      shell: true
    })
    response.writeHead(204);
    response.end();
  })
  return Promise.resolve();
}