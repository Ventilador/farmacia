export class Remedio {
  static clone({ Nombre, Droga, Presentaciones }: Remedio) {
    return new Remedio(Nombre, Droga, Presentaciones && Presentaciones.slice());
  }
  constructor(public readonly Nombre: string, public readonly Droga: string, public readonly Presentaciones: string[] = []) { }
  toString() {
    return `${this.Nombre} (${this.Droga})`;
  }

  get asString() {
    return this.toString();
  }

  matches(text: string) {
    text = text.toLowerCase();
    return this.Nombre.toLowerCase().startsWith(text)
      || this.Droga.toLowerCase().startsWith(text)
  }

  is(nombre: string) {
    return this.Nombre.toLowerCase() === nombre.toLowerCase()
  }

  filtrarPresentaciones(filter: string) {
    return this.Presentaciones.filter(presentacion => presentacion.toLowerCase().startsWith(filter.toLowerCase()));
  }
}
