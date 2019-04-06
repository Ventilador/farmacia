import *as express from 'express';
import { medicosEndpoint } from './medicos';
import { psicotropicosEndpoint } from './psicotropicos';
import { registrosEndpoint } from './registros';




const app = express();
Promise.all([
    medicosEndpoint(app),
    psicotropicosEndpoint(app),
    registrosEndpoint(app)
]).then(() => app.listen(5000, function () {
    console.log('listening');
    app.on('error', console.error);
}));

