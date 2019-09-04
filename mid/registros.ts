import { join } from 'path';
import { Application } from 'express';
import { stat, createSafeReadStream, createWriteStream, mkdir, readdir, readFile } from './fileSystem';
import { Registro } from '../gui/src/clases/registro';
import { Medico } from '../gui/src/clases/medico';

export function registrosEndpoint(app: Application) {
  const dir = './registros';
  return stat(dir).catch(() => mkdir(dir)).then(() => {
    app.get('/api/registros/:fecha', (req, res) => {
      createSafeReadStream(join(dir, req.params.fecha + '.json'), res);
    }).post('/api/registros/:fecha', (req, res) => {
      req.pipe(createWriteStream(join(dir, req.params.fecha + '.json'))).on('close', function () {
        res.writeHead(204);
        res.end();
      });
    }).get('/api/registros-new-id', (_, res) => {
      readdir(dir)
        .then(files => {
          files = files.filter(jsonFiles).sort();
          const item = files.length && files[files.length - 1];
          if (item) {
            return readFile(join(dir, item), 'utf8');
          }
        })
        .then(content => {
          const items = content ? JSON.parse(content) : [] as Registro[];
          if (!items.length) {
            return 0;
          }
          items.sort((a, b) => {
            return b.id - a.id;
          });
          return items[0].id + 1;
        })
        .then(id => {
          res.json({ id });
        });
    }).get('/api/fechas', (_, res) => {
      readdir(dir)
        .then((files) => {
          res.json(files.filter(jsonFiles).map(removeDotJson));
        })
    }).get('/api/registros/:fecha/csv', (req, res) => {
      res.setHeader('Content-disposition', 'attachment; filename=' + req.params.fecha + '.csv');
      readFile(join(dir, req.params.fecha + '.json'), 'utf8')
        .then((content) => {
          const parsed = JSON.parse(content) as Registro[];
          parsed.forEach((item) => {
            res.write(`"${item.id}","${formatMedico(item.medico)}", "${req.params.fecha}", "${formatRemedio(item)}"${'\r\n'}`)
          });
          res.end();
        }, () => res.end());
    });
  });
}
function formatRemedio(registro: Registro) {
  return `${registro.remedio.Nombre} ${registro.presentacion} (${registro.remedio.Droga})`;
}
function formatMedico(med: Medico) {
  return med.Apellido + ' ' + med.Nombre.slice(0, 1) + '.';
}
function removeDotJson(file: string) {
  return file.slice(0, file.length - 5);
}
function jsonFiles(file: string) {
  return file.endsWith('.json');
}
