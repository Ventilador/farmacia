import { join } from 'path';
import { Application } from 'express';
import { createSafeReadStream, createWriteStream } from './fileSystem';
import *as csvParser from 'csv-parse';
import *as stream from 'stream';
export function psicotropicosEndpoint(app: Application) {
    const file = join(__dirname, './../psicotropicos.json');
    app.get('/api/psicotropicos', (_, res) => {
        createSafeReadStream(file, res);
    }).post('/api/psicotropicos', (req, res) => {
        req.pipe(createWriteStream(file)).on('close', function () {
            res.writeHead(204);
            res.end();
        });
    })
        .post('/api/psicotropicos/import', (req, res) => {
            const parser = csvParser();
            req.pipe(parser);
            const fileStream = createWriteStream(file);
            let firstTime = true, secondTime = false;
            let headers: Record<string, string>;
            parser.addListener('readable', () => {
                if (firstTime) {
                    firstTime = false;
                    secondTime = true;
                    fileStream.write('[');
                    headers = toHeaders(parser.read());
                } else if (secondTime) {
                    secondTime = false;
                    const toWrite = arrayToObject(parser.read(), headers);
                    if (toWrite) {
                        fileStream.write(toWrite);
                    }
                } else {
                    const toWrite = arrayToObject(parser.read(), headers);
                    if (toWrite) {
                        fileStream.write(',' + toWrite);
                    }
                }
            })
            parser.addListener('end', function () {
                fileStream.write(']');
                fileStream.end();
                res.writeHead(204);
                res.end();
            });
        });
    return Promise.resolve();
}

function toHeaders(val: string[]) {
    return val.reduce((prev, cur, index) => {
        prev[cur] = index;
        prev[index] = cur;
        return prev;
    }, {});
}

function arrayToObject(val: string[], headers: Record<string, string>) {
    return val && JSON.stringify({
        Nombre: val[headers['Nombre']],
        Presentacion: val[headers['Presentacion']],
        Droga: val[headers['Droga']]
    });
}


class ToJson extends stream.Transform {
    private started = false;
    _transform(chunk: any, _: string, callback: stream.TransformCallback): void {
        if (this.started) {
            this.started = true;
            this.push('[');
            this.push(JSON.stringify(chunk));
        } else {
            this.push(',' + JSON.stringify(chunk));
        }
        callback();
    }
    _flush(callback: stream.TransformCallback) {
        this.push(']');
        callback();
    }

}