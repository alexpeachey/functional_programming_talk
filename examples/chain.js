import {isRight, right, map} from "./eithers";

export const chain = (...functions) =>
  (input) =>
    functions.reduce((i, f) => map(f, i), right(input));
