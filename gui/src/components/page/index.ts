import { Directive } from '../decorators';
import { CrearRegistro } from '../ventanas/crearRegistro/crearRegistro';
import { Registros } from '../../servicios/registros';
import { Registro } from '../../clases/registro';
const minAmount = 10;
@Directive({
  name: 'page',
  restrict: 'A',
  template: require('./page.html')
})
export class PageDirective {
  public loading;
  public currentDate: Date;
  public currentId: number;
  public records: Registro[];
  public fechas: Record<string, boolean>;
  constructor(private $mdDialog: ng.material.IDialogService, private registros: Registros, private $http: ng.IHttpService) {
    this._cargarId();
    this.registros.fechasConCosas().then(fechas => this.fechas = fechas);
  }
  public onNewDate(date: Date) {
    this.currentDate = date;


    this._listar();
  }

  idChanged(id: number) {
    if (this.loading) {
      this.loading.then(() => this.idChanged(id));
    } else {
      this.currentId = id;
    }
  }

  crearRegistro() {
    this.$mdDialog.show({
      template: require('./../ventanas/crearRegistro/crearRegistro.html'),
      controllerAs: 'ctrl',
      controller: CrearRegistro,
      clickOutsideToClose: true
    })
      .then(this._addId)
      .then(this._guardarRegistro, () => { })
      .then(this._listar)
      .then(this._cargarId);
  }

  bajarArchivo() {
    this.registros.bajar(this.currentDate);
  }




  private _cargarId = () => {
    this.loading = this.registros.nuevoId().then(this._asignarId) as any;
  }

  private _listar = () => {
    this.records = [];
    this.registros
      .listar(this.currentDate)
      .then(this._asignarRegistros);
  }

  private _asignarRegistros = (registros: Registro[]) => {
    this.records = fillWithNumbers(registros);

  }

  private _asignarId = (id: number) => {
    this.currentId = id;
    this.loading = null;
  }

  private _addId = (registro: Registro) => {
    if (typeof this.currentId === 'number') {
      return Registro.clone({ ...registro, id: this.currentId });
    } else {
      (this as any).currentId.then(() => this._addId(registro));
    }
  }

  private _guardarRegistro = (registro: Registro) => {
    return this.registros.agregarRegistro(registro, this.currentDate);
  }

}
let i = 0;
function fillWithNumbers(arr: any[]) {
  if (arr.length < minAmount) {
    while (arr.length < minAmount) {
      arr.push(i++);
    }
  } else if (arr.length > minAmount) {
    while (typeof arr[arr.length - 1] === 'number' && arr.length > minAmount) {
      arr.pop();
    }
  }


  return arr;
}
