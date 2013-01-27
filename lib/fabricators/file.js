var utils = require('../utils');

module.exports = function() {
  
  return function(bp, def, done) {
    if (def.typeOf !== 'file') { return done(); }
  
    var content = def.content;
    if (typeof content == 'object' && content._fn == 'render') {
      var fdef = {};
      utils.merge(fdef, def);
      
      bp.render(content.template, function(err, out) {
        if (err) { return done(err); }
        utils.merge(fdef, { content: out });
        return done(null, fdef);
      });
    } else {
      return done();
    }
  }
}
