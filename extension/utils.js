window.utils = {
  pipe: (...fns) => x => fns.reduce((v, f) => f(v), x)
};

// Для тестов
if (typeof module !== 'undefined' && module.exports) {
  module.exports = window.utils;
} 
