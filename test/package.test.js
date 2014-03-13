/* global describe, it, expect */

var tensile = require('..');

describe('tensile', function() {
  
  it('should export version', function() {
    expect(tensile.version).to.be.a('string');
  });
  
});
