export const map = (f, p) => p.then(f);

export const fold = (l, r, p) => p.then(r).catch(l);
