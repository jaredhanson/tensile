var utils = require('../../../utils');


module.exports = function() {
  
  return function(ird, comp, bp, done) {
    if (ird.type !== 'file') { return done(); }
  
    var content = ird.attrs.content;
    if (typeof content == 'object' && content.__fn__ == 'render') {
      var rd = {};
      utils.merge(rd, ird);
      
      var name = content.template
        , locals = content.locals;
      
      if (name[0] == '.') {
        name = comp.resolveTemplate(name);
      }
      
      bp.render(name, locals, function(err, out) {
        if (err) { return done(err); }
        utils.merge(rd.attrs, { content: out });
        return done(null, rd);
      });
    } else {
      return done();
    }
  }
}
