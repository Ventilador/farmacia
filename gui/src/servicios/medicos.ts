import { Medico } from '../clases/medico';
const endpoint = '/api/medicos';

export class Medicos {
    private medicos: Medico[];
    constructor(private $q: ng.IQService, private $http: ng.IHttpService) { }

    listar(): ng.IPromise<Medico[]> {
        if (this.medicos) {
            return this.$q.resolve(this.medicos);
        } else {
            let promise = this.$http.get(endpoint)
                .then<any>(r => r.data)
                .then((medicos) => this.medicos = medicos ? medicos.map(Medico.clone) : [])
            this.listar = () => promise;
            promise.then(() => delete this.listar);
            return promise;
        }
    }

    agregarMedico(medico: Medico) {
        return this.listar()
            .then(collecion => {
                collecion.push(medico);
                return collecion;
            })
            .then((remedios: Medico[]) => {
                return this.$http.post(endpoint, remedios);
            });
    }
}

