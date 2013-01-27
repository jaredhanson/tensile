var utils = require('../utils');

module.exports = function() {
  
  return function(bp, def, done) {
    if (def.typeOf !== 'file') { return done(); }
  
    var content = def.content;
    if (typeof content == 'object' && content._fn == 'render') {
      var fdef = {};
      utils.merge(fdef, def);
      
      //console.log('RENDER: ');
      //console.log(def);
      bp.render(content.template, content.locals, function(err, out) {
        if (err) { return done(err); }
        //console.log(out);
        utils.merge(fdef, { content: out });
        return done(null, fdef);
      });
    } else {
      return done();
    }
  }
}
