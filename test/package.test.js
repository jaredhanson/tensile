/* global describe, it, expect */

var tensile = require('..')
  , Project = require('../lib/project');

describe('tensile', function() {
  
  it('should expose singleton application', function() {
    expect(tensile).to.be.an('object');
    expect(tensile).to.be.an.instanceOf(Project);
  });
  
  it('should export version', function() {
    expect(tensile.version).to.be.a('string');
  });
  
  it('should export constructors', function() {
    expect(tensile.Project).to.be.a('function');
  });
  
});
