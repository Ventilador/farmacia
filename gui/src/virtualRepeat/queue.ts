
export function queue() {
  class Item {
    constructor(public next: Item, public prev: Item, public val: any) { }
  }
  return class Queue {
    private _last: Item;
    private _first: Item;
    public length: number;
    constructor() {
      if (!this) {
        return new Queue();
      }
      this._first = this._last = null;
      this.length = 0;
    }
    public push(val: any) {
      if (this.length) {
        this._last = this._last.next = new Item(null, this._last, val);
      } else {
        this._first = this._last = new Item(null, null, val);
      }

      this.length++;
    }

    public unshift(val: any) {
      if (this.length) {
        this._first = this._first.prev = new Item(this._first, null, val);
      } else {
        this._first = this._last = this._first = this._last = new Item(null, null, val);
      }

      this.length++;
    }


    public forEach() {
      if (!this.length) {
        return;
      }
      const cb: Function = arguments[0];
      if (typeof cb !== 'function') {
        throw 'Invalid callback';
      }
      let index = 0;
      const that = arguments.length === 2 ? arguments[1] : null;
      let cur = this._first;
      do {
        cb.call(that, cur.val, index++);
      } while (cur = cur.next);
    }

    public forEachReverse() {
      if (!this.length) {
        return;
      }
      const cb: Function = arguments[0];
      if (typeof cb !== 'function') {
        throw 'Invalid callback';
      }
      let index = this.length;
      const that = arguments.length === 2 ? arguments[1] : null;
      let cur = this._last;
      do {
        cb.call(that, cur.val, --index);
      } while (cur = cur.prev);
    }

    public shift() {
      this.length && this.length--; //tslint:disable-line
      const toReturn = this._first && this._first.val;
      if (this.length) {
        (this._first = this._first.next).prev = null;
      } else {
        this._last = this._first = null;
      }
      return toReturn;
    }

    public pop() {

      this.length && this.length--; //tslint:disable-line
      const toReturn = this._last && this._last.val;
      if (this.length) {
        (this._last = this._last.prev).next = null;
      } else {
        this._last = this._first = null;
      }
      return toReturn;
    }

    public peekFirst() {
      return this._first && this._first.val;
    }
    public peek() {
      return this._last && this._last.val;
    }
  };


}
