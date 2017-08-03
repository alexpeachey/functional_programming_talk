import RE from "xregexp";
export const $ = x => ({ __matchUse: true, variable: true, name: x });
export const _ = { __matchUse: true, placeholder: true };

const isObject = (x) => (!!x && x.constructor !== Array && typeof x === "object");
const isArray = (x) => (!!x && x.constructor === Array);
const isPlaceHolder = (x) => (isObject(x) && x.__matchUse && x.placeholder);
const isVariable = (x) => (isObject(x) && x.__matchUse && x.variable);
const isRegEx = (x) => (isObject(x) && x.xregexp);

const isREMatch = (input, pattern) => (typeof input === 'string' && isRegEx(pattern))
const isArrayMatch = (input, pattern) => (isArray(input) && isArray(pattern) && input.length === pattern.length);
const isObjectMatch = (input, pattern) => (isObject(input) && isObject(pattern) && !isPlaceHolder(pattern));

const matchValue = (value, pattern, matches={}) =>
  (isPlaceHolder(pattern) && matches) ||
  (isREMatch(value, pattern) && matchRE(value, pattern, matches)) ||
  (isVariable(pattern) && {...matches, [pattern.name]: value}) ||
  (isObjectMatch(value, pattern) && matchObject(value, pattern, matches)) ||
  (isArrayMatch(value, pattern) && matchArray(value, pattern, matches)) ||
  (value === pattern && matches) ||
  null

const matchRE = (value, pattern, matches={}) => {
  const match = RE.exec(value, pattern);
  if (match) {
    return Object.keys(match)
                 .filter((key) => !isNaN(key) || !["index", "input"].includes(key))
                 .reduce((r, key) => ({...r, [key]: match[key]}), matches);
  } else
    return null;
}

const matchElement = (patterns) => (matches, value, index) => {
  if (matches)
    return matchValue(value, patterns[index], matches);
  else
    return matches;
}
const matchArray = (values, patterns, matches={}) => values.reduce(matchElement(patterns), matches);

const matchProperty = (value, pattern) =>
  (matches, key) => {
    if (matches === null)
      return matches;
    else if (value.hasOwnProperty(key))
      return matchValue(value[key], pattern[key], matches);
    else
      return null;
  }
const matchObject = (value, pattern, matches={}) => Object.keys(pattern).reduce(matchProperty(value, pattern), matches);

const matchPattern = (input) =>
  (result, pattern) => {
    if (result)
      return result;
    else {
      const matches = matchValue(input, pattern[0], {});
      if (matches)
        return {f: pattern[1], matches};
      else
        return null;
    }
  }
export const match = (patterns) =>
  (input) => {
    const result = patterns.reduce(matchPattern(input), null);
    if (result)
      return result.f(input, result.matches);
    else
      throw `No match of ${input}`;
  }
