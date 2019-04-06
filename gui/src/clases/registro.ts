import { Remedio } from './remedio';
import { Medico } from './medico';

export class Registro {
    static clone({ id, remedio, medico, presentacion }: Registro) {
        return new Registro(id, Remedio.clone({ Droga: remedio.Droga, Nombre: remedio.Droga, Presentaciones: undefined } as any), Medico.clone(medico), presentacion);
    }
    constructor(public readonly id: number, public readonly remedio: Remedio, public readonly medico: Medico, public readonly presentacion: string) { }
}