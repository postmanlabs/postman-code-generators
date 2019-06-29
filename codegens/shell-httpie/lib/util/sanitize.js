module.exports = {
  quote: function (value) {
    if (typeof value !== 'string' || value === '') {
      return '';
    }
    return '\'' + value.replace(/\\/g, '\\\\').replace(/'/g, '\'\\\'\'') + '\'';
  }
};
