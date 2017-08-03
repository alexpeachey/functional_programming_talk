export const curry = f => {
  const g = (n, args) =>
    n === 0 ? f(...args) : x => g(n - 1, [...args, x])
  return g(f.length, []);
}

export const uncurry = f => (...args) =>
  args.reduce((g, x) => g(x), f);

