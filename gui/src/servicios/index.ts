import *as angular from 'angular';
import { Medicos } from './medicos';
import { Registros } from './registros';
import { Remedios } from './remedios';
angular.module('app')
    .service('medicos', Medicos)
    .service('registros', Registros)
    .service('remedios', Remedios);
