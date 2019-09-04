import *as express from 'express';
import { medicosEndpoint } from './medicos';
import { psicotropicosEndpoint } from './psicotropicos';
import { registrosEndpoint } from './registros';
import { abrirCarpeta } from './abrirCarpeta';
import { join } from 'path';


const app = express();
app.use(express.static(join(__dirname, './../gui')));
Promise.all([
  abrirCarpeta(app),
  medicosEndpoint(app),
  psicotropicosEndpoint(app),
  registrosEndpoint(app)
]).then(() => app.listen(5000, function () {
  console.log('listening');
  app.on('error', console.error);
}));

