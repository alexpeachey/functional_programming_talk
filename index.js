import repl from "babel-repl";

global.hot = (module) => {
  delete require.cache[require.resolve(module)];
  return require(module);
}

repl.start({
  prompt: "> ",
  useColor: true
});
