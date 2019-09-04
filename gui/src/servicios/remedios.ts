import { Remedio } from '../clases/remedio';
import { Registro } from '../clases/registro';
const url = '/api/psicotropicos';
export class Remedios {
  private remedios: Remedio[];
  constructor(private $http: ng.IHttpService, private $q: ng.IQService) { }
  listar() {
    if (this.remedios && this.remedios.length) {
      return this.$q.resolve(this.remedios);
    } else {
      let promise = this.$http.get(url)
        .then(generarCollecion)
        .then((remedios) => this.remedios = remedios || []);
      this.listar = () => promise;
      promise.then(() => delete this.listar);
      return promise;
    }

  }
  agregarRemedio(remedio: Remedio) {
    return this.listar()
      .then(() => {
        if (this.remedios.find(i => i.is(remedio.Nombre))) {
          throw new Error(`El remedio ya existe => "${remedio.Nombre}"`);
        }
        this.remedios.push(Remedio.clone(remedio));
        return this.remedios;
      })
      .then(this._guardar);
  }
  agregarPresentacion(remedio: Remedio, presentacion: string) {
    return this.listar()
      .then(() => {
        remedio = this.remedios.find(i => i.is(remedio.Nombre));
        if (!remedio) {
          throw new Error(`El remedio no existe => "${remedio.Nombre}"`);
        }
        remedio.Presentaciones.push(presentacion);
        return this.remedios;
      })
      .then(this._guardar);
  }

  importar(contenido: string) {
    this.remedios = [];
    return this.$http.post(url + '/import', contenido)
      .then(() => this.listar());
  }

  private _guardar = (remedios: Remedio[]) => {
    return this.$http.post(url, remedios);
  }
}




function generarCollecion(remedios: ng.IHttpResponse<any>): Remedio[] {
  const data = remedios.data as Remedio_int[];
  return data.reduce((prev, cur) => {
    const found = prev.find(i => i.is(cur.Nombre));
    if (found) {
      found.Presentaciones.push(cur.Presentacion);
    } else {
      prev.push(Remedio.clone({ Nombre: cur.Nombre, Droga: cur.Droga, Presentaciones: [cur.Presentacion] } as any))
    }
    return prev;
  }, [] as Remedio[]);
}


function reducirRemedios(remedios: Remedio_int[]) {
  return remedios ? remedios.reduce((prev, cur) => {
    const current = prev[cur.Nombre] || (prev[cur.Nombre] = new Remedio(cur.Nombre, cur.Droga));
    current.Presentaciones.push(cur.Presentacion);
    return prev;
  }, {} as Record<string, Remedio>) : {};
}

interface Remedio_int {
  Nombre: string;
  Presentacion: string;
  Droga: string;
}