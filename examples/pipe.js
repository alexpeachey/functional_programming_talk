export const pipe = (...functions) =>
  (input) =>
    functions.reduce((i, f) => f(i), input);
