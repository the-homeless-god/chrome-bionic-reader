const pipe = (...fns) => x => fns.reduce((v, f) => f(v), x);

if (typeof module !== 'undefined' && module.exports) {
  module.exports = {
    pipe
  };
} 
