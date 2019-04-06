import { IModalServiceInstance } from 'angular-ui-bootstrap';
import { Medico } from '../../../clases/medico';
import { Medicos } from '../../../servicios/medicos';

export class CrearMedico {
    public nombre: string;
    public apellido: string;
    public medicoRepetido: boolean;
    public isValid: boolean = false;
    private medicos: Medico[];
    constructor(private $mdDialog: ng.material.IDialogService, medicos: Medicos) {
        medicos.listar()
            .then(medicos => this.medicos = medicos);
    }

    public guardar() {
        this.$mdDialog.hide(new Medico(this.nombre, this.apellido));
    }

    public reset() {
        this.medicoRepetido = this.medicos && this.medicos.some(this.isEqual, this);
        this.isValid = !!(this.nombre && this.apellido);
    }

    public cancelar() {
        this.$mdDialog.cancel();
    }

    private isEqual(medico: Medico) {
        return medico.Nombre === this.nombre && medico.Apellido === this.apellido;
    }
}
