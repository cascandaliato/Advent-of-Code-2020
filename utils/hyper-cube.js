const { multiRange } = require('.');

class HyperCube extends Array {
  constructor({ lengths = [1], defaultValue = undefined }) {
    super(lengths[0]);

    this._defaultValue = defaultValue;
    this._dimensions = lengths.length;
    this.lengths = lengths;
    this._populated = new Set();

    // populate
    this.fill(defaultValue);
    if (this._dimensions > 1) {
      this.forEach(
        (_, idx) =>
          (this[idx] = new HyperCube({
            lengths: lengths.slice(1),
            defaultValue,
          }))
      );
    }
  }

  clone() {
    const newHyperCube = new HyperCube({
      lengths: this.lengths,
      defaultValue: this._defaultValue,
    });
    for (const [coords, value] of this.entries()) {
      newHyperCube._set(coords, value);
    }
    return newHyperCube;
  }

  *[Symbol.iterator]() {
    // if (this._dimensions === 1) {
    //   for (let i = 0; i < this.length; i++) yield this[i];
    // } else {
    //   for (let i = 0; i < this.length; i++) yield* this[i];
    // }
    for (const entry of this.getPopulated()) yield this._get(entry);
  }

  *entries() {
    for (const entry of this.getPopulated()) yield [entry, this._get(entry)];
  }

  get(...coords) {
    if (coords.length === 1) return this[coords[0]];
    return this[coords[0]]._get(coords.slice(1));
  }

  _get(coords) {
    if (coords.length === 1) return this[coords[0]];
    return this[coords[0]]._get(coords.slice(1));
  }

  set(...args) {
    this._set(args.slice(0, -1), args[args.length - 1]);
  }

  _set(coords, value) {
    if (value !== this._defaultValue) {
      this._populated.add(coords.join(','));
    } else {
      this._populated.delete(coords.join(','));
    }

    const [first, ...rest] = coords;
    if (rest.length === 0) this[first] = value;
    else this[first]._set(rest, value);
  }

  getPopulated() {
    return [...this._populated].map(coords => coords.split(',').map(Number));
  }

  prettyPrint(map = v => v) {
    for (const coords of multiRange(
      this.lengths.slice(2).map(length => [0, length - 1])
    )) {
      console.log(coords.map((v, idx) => `d${idx + 3}=${v}`).join(' '));
      for (let row = 0; row < this.lengths[1]; row++) {
        let line = '';
        for (let col = 0; col < this.lengths[0]; col++) {
          line += map(this.get(col, row, ...coords));
        }
        console.log(line);
      }
      console.log();
    }
  }
}

module.exports = HyperCube;

// const hc = new HyperCube({ lengths: [3, 4, 1], defaultValue: '.' });
// hc.set(1, 2, 0, 3);
// hc.set(1, 1, 0, 2);
// hc.set(0, 1, 0, 3);
// console.log(hc.get(0, 0, 0));
// console.log(hc.get(1, 2, 0));
// // console.log(hc);
// for (const v of hc) console.log(v);
// // console.log(hc.getPopulated());
// const c = hc.clone();
// c.set(1, 1, 0, 8);
// c.prettyPrint();
// console.log('fin');