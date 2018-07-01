const assert = require("assert");
const r = require("./renix");

let callTimes = 0;

r.defineProvider("test", function() {
  const id = callTimes++;
  return new Promise(r => {
    setTimeout(r, 200, id);
  });
});

assert(callTimes === 0);

r.query({
  provider: "test",
  arg: null
});

assert(callTimes === 1);

r.query({
  provider: "test",
  arg: null
});

assert(callTimes === 1);

r.query({
  provider: "test",
  arg: 21
});

assert(callTimes === 2);

setTimeout(() => {
  let called;
  let p = r.query({
    provider: "test",
    arg: 21
  }, 100).then(d => {
    called = true;
    assert(d === 2);
  });
  setTimeout(() => {
    assert(called);
  }, 250);
}, 350);
