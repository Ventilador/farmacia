import { Application } from 'express';
import { createSafeReadStream, createWriteStream, stat, writeFile } from './fileSystem';
import *as csvParser from 'csv-parse';
import *as stream from 'stream';
export function psicotropicosEndpoint(app: Application) {
  const file = './psicotropicos.json';
  return stat(file).catch(_ => writeFile(file, '')).then(() => {
    app.get('/api/psicotropicos', (_, res) => {
      createSafeReadStream(file, res);
    }).post('/api/psicotropicos', (req, res) => {
      req.pipe(createWriteStream(file)).on('close', function () {
        res.writeHead(204);
        res.end();
      });
    }).post('/api/psicotropicos/import', (req, res) => {
      const parser = csvParser();
      req.pipe(parser);
      const fileStream = createWriteStream(file);
      let firstTime = true, secondTime = false;
      let headers: Record<string, string>;
      parser.addListener('error', (err) => {
        res.writeHead(422, 'BadRequest');
        res.end();
      })
      parser.addListener('readable', () => {
        let record = null;
        while (record = parser.read()) {
          if (firstTime) {
            firstTime = false;
            secondTime = true;
            fileStream.write('[');
            headers = toHeaders(record);
          } else if (secondTime) {
            secondTime = false;
            const toWrite = arrayToObject(record, headers);
            if (toWrite) {
              fileStream.write(toWrite);
            }
          } else {
            const toWrite = arrayToObject(record, headers);
            if (toWrite) {
              fileStream.write(',' + toWrite);
            }
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
  })
}

function toHeaders(val: string[]) {
  return val.reduce((prev, cur, index) => {
    cur = removeQuotes(cur);
    prev[cur] = index;
    prev[index] = cur;
    return prev;
  }, {});
}

function removeQuotes(val: string) {
  // if ((val[0] === '"' || val[0] === "'") && val[val.length - 1] === '"' || val[val.length - 1] === "'") {
  //   return val.slice(1, -1);
  // }
  return val.trim();
}

function arrayToObject(val: string[], headers: Record<string, string>) {
  return val && JSON.stringify({
    Nombre: removeQuotes(val[headers['Nombre']]),
    Presentacion: removeQuotes(val[headers['Presentacion']]),
    Droga: removeQuotes(val[headers['Droga']])
  }, null, '\t');
}

