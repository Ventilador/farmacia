import { Remedio } from '../../../clases/remedio';
import { IModalServiceInstance } from 'angular-ui-bootstrap';
import { Remedios } from '../../../servicios/remedios';
import { Medicos } from '../../../servicios/medicos';
import { Medico } from '../../../clases/medico';
import { Registro } from '../../../clases/registro';

export class CrearRegistro {
  public presentaciones: string[] = [];
  public remedios: Remedio[] = [];
  public medicos: Medico[] = [];

  private listaDeRemedios: Remedio[];
  private listaDeMedicos: Medico[];
  public remedio: Remedio;
  public presentacion: string;
  public medico: Medico;
  public id: number;
  public current: number = 1;
  constructor(private $mdDialog: ng.material.IDialogService,remedios: Remedios, medicos: Medicos) {
    remedios.listar()
      .then(this.cargarRegistros);
    medicos.listar().then(this.cargarMedicos)
  }

  isLoading() { return this.listaDeRemedios; }

  seleccionado(remedio, ctrl: { scope: ng.IScope, focus: any }) {
    this.remedio = remedio;
    this.presentacion = '';
    this.filtrarPresentaciones('');
    ctrl.scope.$evalAsync(ctrl.focus);
  }

  guardar() {
    this.$mdDialog.hide(Registro.clone(this as Registro));
  }

 

  isValid() {
    return this.remedio && this.presentacion && this.medico;
  }

  cancelar() {
    this.$mdDialog.cancel();
  }

  filtrarMedicos(filter: string) {
    this.medicos.length = 0;
    this.listaDeMedicos && this.listaDeMedicos.filter(medico => medico.matches(filter)).forEach(pushTo, this.medicos);
  }

  filtrarRemedios(filter: string) {
    this.remedios.length = 0;
    this.listaDeRemedios && this.listaDeRemedios.filter(remedio => remedio.matches(filter)).forEach(pushTo, this.remedios);
  }

  filtrarPresentaciones(filter: string) {
    this.presentaciones.length = 0;
    this.remedio && this.remedio.filtrarPresentaciones(filter).forEach(pushTo, this.presentaciones);
  }

  private cargarRegistros = (values: Remedio[]) => {
    this.listaDeRemedios = values;
    this.filtrarRemedios('');
  }

  private cargarMedicos = (values: Medico[]) => {
    this.listaDeMedicos = values;
    this.filtrarMedicos('');
  }
}
function pushTo(item: any) {
  this.push(item);
}