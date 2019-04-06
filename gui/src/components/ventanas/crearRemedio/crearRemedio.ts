import { Remedio } from '../../../clases/remedio';
import { IModalServiceInstance } from 'angular-ui-bootstrap';
import { Remedios } from '../../../servicios/remedios';

export class CrearRemedio {
  remedios: Remedio[];
  remedio = new Remedio('', '');
  presentacionInicial = '';
  remedioYaExiste: boolean;
  nombreInvalido: boolean;
  drogaInvalida: boolean;
  constructor(private $mdDialog: ng.material.IDialogService, remedios: Remedios) {
    remedios.listar()
      .then(remedios => this.remedios = remedios);
  }

  guardar() {
    this.remedio.Presentaciones.push(this.presentacionInicial);
    this.$mdDialog.hide(this.remedio);
  }

  cancelar() {
    this.$mdDialog.cancel();
  }

  isValid() {
    return this.remedio.Nombre && this.remedio.Droga && this.presentacionInicial && !this.nombreInvalido && !this.drogaInvalida;
  }

  cambio() {
    this.nombreInvalido = this.remedios && this.remedios.some(byNombre, this);
    this.drogaInvalida = this.remedios && this.remedios.some(byDroga, this);
  }
}

function byNombre(this: CrearRemedio, item: Remedio) {
  return item.Nombre.toLowerCase() === this.remedio.Nombre.toLowerCase();
}

function byDroga(this: CrearRemedio, item: Remedio) {
  return item.Droga.toLowerCase() === this.remedio.Droga.toLowerCase();
}

