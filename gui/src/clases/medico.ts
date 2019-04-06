export class Medico {
  static clone({ Nombre, Apellido }) {
    return new Medico(Nombre, Apellido);
  }
  constructor(public readonly Nombre: string, public readonly Apellido: string) { }
  format() {
    return `${this.Apellido} ${this.Nombre[0]}.`;
  }

  toString() {
    return `${this.Apellido} ${this.Nombre}`;
  }

  get asString() {
    return this.toString();
  }

  matches(text: string) {
    text = text.toLowerCase();
    return this.Nombre.toLowerCase().startsWith(text)
      || this.Apellido.toLowerCase().startsWith(text)
  }
}
