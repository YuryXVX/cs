function getRandomInt(a: number, b: number) {
  const min = Math.ceil(a);
  const max = Math.floor(b);
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

export function random(a: number, b: number) {
  return {
    [Symbol.iterator]() {
      return this;
    },

    next() {
      return {
        value: getRandomInt(a, b),
        done: false,
      };
    },
  };
}
