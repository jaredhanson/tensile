/* global describe, it, expect */

var tensile = require('..');

describe('tensile', function() {
  
  it('should export version', function() {
    expect(tensile.version).to.be.a('string');
  });
  
  it('should export constructors', function() {
    expect(tensile.Project).to.be.a('function');
  });
  
});
