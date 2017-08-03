export const isEither = (x) =>
  x.constructor === Array &&
  x.length === 2 &&
  (x[0] === "ok" || x[0] === "error")

export const isRight = (x) =>
  isEither(x) &&
  x[0] === "ok"

export const isLeft = (x) =>
  isEither(x) &&
  x[0] === "error"

export const right = x => {
  if (isEither(x))
    return x;
  else
    return ["ok", x];
}

export const left = x => {
  if (isEither(x))
    return x;
  else
    return ["error", x];
}

export const map = (f, e) => {
  if (isRight(e))
    return right(f(e[1]));
  else
    return e;
}

export const bind = (f, e) => {
  if (isRight(e))
    return f(e[1]);
  else
    return e;
}

export const fold = (l, r, e) => {
  if (isRight(e))
    return r(e[1]);
  else if (isLeft(e))
    return l(e[1]);
  else
    throw "Not an either";
}
