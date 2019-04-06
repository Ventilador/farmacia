import { join } from 'path';
import { Application } from 'express';
import { createSafeReadStream, createWriteStream } from './fileSystem';

export function medicosEndpoint(app: Application) {
    const file = join(__dirname, './../medicos.json');
    app.get('/api/medicos', (_, res) => {
        createSafeReadStream(file, res);
    }).post('/api/medicos', (req, res) => {
        req.pipe(createWriteStream(file)).on('close', function () {
            res.writeHead(204);
            res.end();
        });
    });
    return Promise.resolve();
}

function returnEmpty(req) {
    return function () {
        req.writeHead(200);
        req.write('');
        req.end();
    }
}
