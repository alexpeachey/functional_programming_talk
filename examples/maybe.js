export const isMaybe = (x) =>
  x.constructor === Array &&
  x.length === 2 &&
  (x[0] === "just" || x[0] === "nothing")

export const isJust = (x) =>
  isMaybe(x) &&
  x[0] === "just"

export const isNothing = (x) =>
  isMaybe(x) &&
  x[0] === "nothing"

export const just = x => {
  if (isMaybe(x))
    return x;
  else
    return ["just", x];
}

export const nothing = x => {
  if (isMaybe(x))
    return x;
  else
    return ["nothing", null];
}

export const maybe = x => {
  if (isMaybe(x))
    return x;
  else if (x === null || typeof x === "undefined")
    return nothing(x);
  else
    return just(x);
}

export const map = (f, m) => {
  if (isJust(m))
    return just(f(m[1]));
  else
    return m;
}

export const bind = (f, m) => {
  if (isJust(m))
    return f(m[1]);
  else
    return m;
}

export const orElse = (v, m) => {
  if (isJust(m))
    return m[1];
  else if (isNothing(m))
    return v;
  else
    throw "Not a maybe";
}
