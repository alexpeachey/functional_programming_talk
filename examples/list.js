export const cons = (x, l) => [x].concat(l);
export const prepend = cons;

export const car = (l) => l === null ? l : typeof l[0] === 'undefined' ? null : l[0];
export const head = car;

export const cdr = (l) => l === null ? l : l.slice(1);
export const tail = cdr;

export const map = (f, list) => list.map(f);

export const foldl = (f, initial, list) => {
  if (typeof initial !== 'undefined')
    return list.reduce(f, initial);
  else
    return list.reduce(f);
}
export const reduce = foldl;

export const foldr = (f, initial, list) => {
  if (typeof initial !== 'undefined')
    return list.reduceRight(f, initial);
  else
    return list.reduceRight(f);
}
export const reduceRight = foldr;
