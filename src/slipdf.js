
var SlipdfParser = Jaabro.makeParser(function() {

  // parse

  function eol(i) { return rex(null, i, /\n+/); }
  function equal(i) { return rex(null, i, /[ \t]*=[ \t]*/); }
  function pipe(i) { return rex(null, i, /\|\s*/); }
  function space(i) { return rex('space', i, /[ \t]+/); }
  function spacestar(i) { return rex('space', i, /[ \t]*/); }
  function dashOrEqual(i) { return rex('doe', i, /[-=]\s*/); }

  function codeBracket(i) { return rex('code', i, /[^}]+/); }
  function endBracket(i) { return str(null, i, '}'); }
  function hashBracket(i) { return str(null, i, '#{'); }
  function socCode(i) {
    return seq(null, i, hashBracket, codeBracket, endBracket); }
  function socString(i) { return rex('string', i, /(.+?)(?=#\{|\n|$)/); }
  function stringOrCode(i) { return alt(null, i, socCode, socString); }
  function text(i) { return rep('text', i, stringOrCode, 1); }

  function code(i) { return rex('code', i, /[^\n]+/); }

  function name(i) { return rex('name', i, /[-_a-zA-Z0-9]+/); }
  function value(i) { return rex('value', i, /[^ ]+/); }

  function attribute(i) { return seq('att', i, space, name, equal, value); }

  function klass(i) { return rex('class', i, /\.[-_a-z]+/); }
  function tag(i) { return rex('tag', i, /[a-z][a-zA-Z0-9]*/); }

  function head(i) { return seq('head', i, tag, klass, '*'); }

  function codeLine(i) {
    return seq('cline', i, spacestar, dashOrEqual, code, eol); }
  function stringLine(i) {
    return seq('sline', i, spacestar, pipe, text, eol); }

  function plainCode(i) { return rex('code', i, /\s*=[^\n]+/); }
  function plainRest(i) { return alt(null, i, plainCode, text); }

  function plainLine(i) {
    return seq('pline', i,
      spacestar, head, attribute, '*', plainRest, '?', eol); }

  function blankLine(i) { return rex(null, i, /\s*\n+/); }
  function commentLine(i) { return rex(null, i, /\s*\/[^\n]*\n+/); }

  function line(i) {
    return alt(null, i,
      blankLine, commentLine, stringLine, codeLine, plainLine); }

  function lines(i) { return seq('lines', i, line, '*'); }
  var root = lines;

  // rewrite

  function rewrite_lines(t) {

    return t.subgather().map(rewrite);
  }

  function rewrite_pline(t) {

    var head = t.lookup('head');

    var o = {};

    o.i = t.lookup('space').length;
    o.t = head.lookup('tag').string();

    var cs = head
      .gather('class')
      .map(function(c) { return c.string().slice(1); });
    if (cs.length > 0) o.cs = cs;

    var tex = t.lookup('text');
    var cod = tex || t.lookup('code');
    if (tex) o.cn = rewrite(tex);
    else if (cod) o.cn = [ rewrite(cod) ];

    return o;
  }

  function rewrite_sline(t) {

    var o = {};
    o.i = t.lookup('space').length;
    o.cn = rewrite(t.lookup('text'));

    return o;
  }

  function rewrite_cline(t) {

    var o = {};
    o.i = t.lookup('space').length;
    o.x = t.lookup('doe').string().trim();
    o.c = t.lookup('code').string();

    return o;
  }

  function rewrite_text(t) {

    return t.subgather().map(rewrite);
  };

  function rewrite_string(t) {

    return { s: t.string() };
  };

  function rewrite_code(t) {

    var c = t.string();
    var m = c.match(/\s*=\s*(.+)/);
    if (m) c = m[1];

    return { x: '=', c: c };
  };
}); // end SlipdfParser


var Slipdf = (function() {

  "use strict";

  var self = this;

  var VERSION = '1.0.0';

  // protected

  var lookup = function(tree, tags) {

    if ((typeof tags) === 'string') tags = [ tags ];

    if (tags.includes(tree.t)) return tree;
    if ( ! tree.cn) return null;
    for (var i = 0, l = tree.cn.length; i < l; i++) {
      var r = lookup(tree.cn[i], tags); if (r) return r;
    }
    return null;
  };

  var do_eval = function(context, code) {

    var ks = Object.keys(context);
    if (ks.length < 1) ks.push('_');

    var func =
      eval("(function(code, " + ks.join(',') + ") { return eval(code); })");

    var args = ks.map(function(k) { return context[k]; });
    args.splice(0, 0, code);

    return func.apply(null, args);
  };

  var apply_value_code = function(tree, context) {

    return do_eval(context, tree.c);
  };

  var apply_value = function(tree, context) {

    if (tree.cn.length === 1 && tree.cn[0].x)
      return apply_value_code(tree.cn[0], context);

    return tree.cn.reduce(
      function(s, c) {
        if (c.s) return s + c.s;
        return s + apply_value_code(c, context); },
      '')
  };

  var apply_text = function(tree, context) {

    return { text: apply_value(tree, context).toString().trim() };
  };
  var apply_p = apply_text;

  var apply_dash_block = function(tree, context) {

    //var ctx = {};
    //for (var k in context) { ctx[k] = context[k]; }
    //ctx.__fun = function() { return apply_content(tree, context); };
    //return do_eval(ctx, tree.c + "return __fun(); })");
return "FIXME";
  };

  var apply_dash = function(tree, context) {

    if (tree.c.match(/{\s*$/)) return apply_dash_block(tree, context);
    apply_value_code; return null;
  };

  var apply_content = function(tree, context) {

    return tree.cn
      .map(function(c) {
        var fun;
        if (c.t) fun = 'apply_' + c.t;
        else if (c.x === '=') fun = 'apply_equal';
        else if (c.x === '-') fun = 'apply_dash';
        return eval(fun)(c, context); });
  };

  var apply_document = function(tree, context) {

    if (tree.t !== 'document') throw new Error('Root is not a "document"');

    var doc = {};

    [ 'pageSize', 'pageOrientation', 'pageMargins' ].forEach(function(k) {
      var t = lookup(tree, k);
      if (t) {
        var v = apply_value(t, context);
        if ((typeof v) === 'string') v = v.trim();
        doc[k] = v;
      }
    });

    var content = lookup(tree, [ 'content', 'body' ]);

    if ( ! content) {
      throw new Error('Document is missing a "content" or "body" node'); }

    doc.content =
      apply_content(content, context)
        .filter(function(c) { return c !== null; });

    return doc;
  };

  // public

  this.debug = function(s, debugLevel) {

    return SlipdfParser.parse(s, { debug: debugLevel });
  };

  this.prepare = function(s) {

    var t = SlipdfParser.parse(s);

    var root =
      { i: -1, t: 'root', cn: [] };
    t.reduce(
      function(parent, line) {
        while (line.i <= parent.i) parent = parent.p;
        if ( ! parent.cn) parent.cn = [];
        var ks = Object.keys(line); if (ks.length == 2 && line.cn) {
          line.cn.forEach(function(c) { parent.cn.push(c); });
          return parent;
        }
        parent.cn.push(line);
        line.p = parent;
        return line;
      },
      root);
    t.forEach(
      function(line) {
        delete line.i;
        delete line.p; });

    if (root.cn.length === 1) return root.cn[0];
    return root;
  };

  this.compile = function(s) {

    var tree = self.prepare(s);
    return function(context) { return apply_document(tree, context); };
  };

  // done.

  return this;

}).apply({}); // end Slipdf

