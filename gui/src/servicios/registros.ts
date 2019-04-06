import { Registro } from '../clases/registro';
import { parseDate } from '../components/header';

export class Registros {
    private registros: Record<string, Registro[]> = Object.create(null);
    private fechas: Record<string, boolean>;
    constructor(private $http: ng.IHttpService, private $q: ng.IQService) { }

    listar(fecha: Date): ng.IPromise<Registro[]> {
        const asString = parseDate(fecha)
        if (this.registros[asString]) {
            return this.$q.resolve(crearRegistros(this.registros[asString]));
        }
        let promise = this.$http.get('/api/registros/' + asString).then(r => r.data)
            .then(crearRegistros)
            .then(registros => crearRegistros(this.registros[asString] = registros));
        this.listar = (fecha: Date) => {
            const newDate = parseDate(fecha);
            if (newDate === asString) {
                return promise;
            }

            return Registros.prototype.listar.call(this, fecha);
        };
        promise.then(() => delete this.listar);
        return promise;
    }

    fechasConCosas(): ng.IPromise<Record<string, boolean>> {
        if (this.fechas) {
            return this.$q.resolve(this.fechas);
        }
        let promise = this.$http.get<string[]>('/api/fechas').then(r => this.fechas = r.data.reduce(reduceFechas, Object.create(null)));
        this.fechasConCosas = () => promise;
        promise.then(() => delete this.fechasConCosas);
        return promise;
    }

    agregarRegistro(registro: Registro, fecha: Date): ng.IPromise<any> {
        return this.listar(fecha)
            .then((_) => {
                const asString = parseDate(fecha);
                if (this.registros[asString]) {
                    this.registros[asString].push(registro);
                } else {
                    this.registros[asString] = [registro];
                }
                if (!this.fechas[asString]) {
                    this.fechas[asString] = true;
                }
                return this.$http.post('/api/registros/' + asString, crearRegistros(this.registros[asString]));
            });
    }

    nuevoId() {
        return this.$http.get<{ id: number }>('/api/registros-new-id').then(r => r.data.id);
    }

    bajar(fecha: Date) {
        window.location = '/api/registros/' + parseDate(fecha) + '/csv' as any;
    }
}

function reduceFechas(prev: Record<string, boolean>, cur: string) {
    prev[cur] = true;
    return prev;
}

function crearRegistros(data: any[]) {
    return data ? data.filter(Boolean).map(Registro.clone) : [];
}
