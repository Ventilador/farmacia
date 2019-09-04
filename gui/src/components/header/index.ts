import { Directive } from '../decorators';
import { IModalService } from 'angular-ui-bootstrap';
import { CrearRemedio } from '../ventanas/crearRemedio/crearRemedio';
import { Remedio } from '../../clases/remedio';
import { CrearMedico } from '../ventanas/crearMedico/crearMedico';
import { Medico } from '../../clases/medico';
import { Remedios } from '../../servicios/remedios';
import { Medicos } from '../../servicios/medicos';

@Directive({
  name: 'header',
  restrict: 'A',
  template: require('./header.html'),
  scope: {},
  bindToController: {
    dateChanged: '&',
    idChanged: '&',
    currentId: '&',
    fechas: '&',
    noEsHoy: '&'
  }
})
export class HeaderDirective {
  public date: Date;
  public dateChanged: (val: { $date: Date }) => any;
  public id: number;
  public currentId: () => number;
  public fechas: () => Record<string, boolean>;
  public idChanged: ({ id: number }) => void;
  public datePickerOptions: any;
  public noEsHoy: any
  private _today: string;
  private _dateAsString: string;
  private dateFilter: ng.IFilterDate;
  public constructor(private $mdDialog: ng.material.IDialogService, private remedios: Remedios, private medicos: Medicos, private $scope: ng.IScope, $filter: ng.IFilterService) {
    $scope.$watch(() => this._today !== this._dateAsString, (val) => this.noEsHoy({ $noEsHoy: val }));
    this.dateFilter = $filter('date');
    setTimeout(this._tick);
    const fake = Object.create(null);
    let getFechas = () => {
      let fechas = this.fechas();
      if (fechas) {
        getFechas = () => fechas;
        return fechas;
      }
      return fake;
    }
    this.datePickerOptions = {
      customClass: ({ date }) => {
        return getFechas()[parseDate(date)] ? 'full' : '';
      }
    };


  }


  public $onInit() {
    this.$scope.$on('$destroy', this.$scope.$parent.$watch(this.currentId, (newId => this.id = newId)))
  }

  public changed() {
    this.idChanged({ id: this.id });
  }

  public selected() {
    this._dateAsString = parseDate(this.date);
    this.dateChanged({ $date: this.date });
  }

  public crearRemedio() {
    this.$mdDialog.show({
      template: require('./../ventanas/crearRemedio/crearRemedio.html'),
      controllerAs: 'ctrl',
      controller: CrearRemedio
    })
      .then((remedio: Remedio) => {
        return this.remedios.agregarRemedio(remedio);
      }, () => { });
  }

  public format = (formatDate, timeZone) => {
    return this.dateFilter(formatDate, 'dd/MM/yyyy', timeZone);
  }

  public crearMedico() {
    this.$mdDialog.show({
      template: require('./../ventanas/crearMedico/crearMedico.html'),
      controllerAs: 'ctrl',
      controller: CrearMedico
    })
      .then((medico: Medico) => {
        return this.medicos.agregarMedico(medico);
      }, () => { });
  }

  public importarRemedios() {
    const clickEvent = document.createEvent('MouseEvents');
    clickEvent.initMouseEvent('click', true, true, window, 0, 0, 0, 0, 0, false, false, false, false, 0, null);
    document.getElementById('file-upload').dispatchEvent(clickEvent);
  }

  public fileSelected(ev: any) {
    this.remedios.importar(ev.target.files.item(0));
  }

  public abrirCarpeta() {
    fetch('/api/abrir-carpeta', {
      method: 'POST'
    });
  }

  private _tick = () => {
    setTimeout(this._tick, 3.6e6);
    const today = getToday();
    if (today !== this._today) {
      if (parseDate(this.date) === this._today) {
        this.date = new Date();
      }
      this._today = today;
      this.selected();
      this.$scope.$applyAsync();
    }
  }
}

function getToday() {
  return parseDate(new Date());
}

export function parseDate(date: Date) {
  if (date) {
    date = new Date(+date);
    date.setHours(date.getHours() - 3);
    return date.toISOString().slice(0, 10);
  }
}