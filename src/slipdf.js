
var SlipdfParser = Jaabro.makeParser(function() {

  // parse

  function eol(i) { return rex(null, i, /\n+/); }
  function equal(i) { return rex(null, i, /[ \t]*=[ \t]*/); }
  function pipe(i) { return rex(null, i, /\|[ \t]*/); }
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
  function value(i) { return rex('value', i, /\S+/); }

  function attribute(i) { return seq('att', i, space, name, equal, value); }

  function klass(i) { return rex('class', i, /\.[-_a-z]+/); }
  function tag(i) { return rex('tag', i, /[a-z][a-zA-Z0-9]*/); }

  function head(i) { return seq('head', i, tag, klass, '*'); }

  function codeLine(i) {
    return seq('cline', i, spacestar, dashOrEqual, code, eol); }
  function stringLine(i) {
    return seq('sline', i, spacestar, pipe, text, eol); }

  function plainCode(i) { return rex('code', i, /[ \t]*=[^\n]+/); }
  function plainRest(i) { return alt(null, i, plainCode, text); }

  function plainLine(i) {
    return seq('pline', i,
      spacestar, head, attribute, '*', plainRest, '?', eol); }

  function blankLine(i) { return rex(null, i, /([ \t]*\n+|[ \t]+$)/); }
  function commentLine(i) { return rex(null, i, /[ \t]*\/[^\n]*\n+/); }

  function line(i) {
    return alt(null, i,
      commentLine, stringLine, codeLine, plainLine, blankLine); }

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

    t.gather('att').forEach(function(c) {
      if ( ! o.as) o.as = [];
      o.as.push([
        c.lookup('name').string().trim(),
        c.lookup('value').string().trim() ]);
    });

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

  var dataUrls = {};

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

  //var gather = function(tree, tags) {
  var gather = function(tree, tags, skip, acc) {

    acc = acc || [];

    if ((typeof tags) === 'string') tags = [ tags ];
    else if (tags === undefined) tags = null;

    if ( ! skip && ((tags && tags.includes(tree.t)) || ( ! tags && tree.t))) {
      acc.push(tree);
    }
    else if (tree.cn) {
      tree.cn.forEach(function(c) { gather(c, tags, false, acc); });
    }

    return acc;
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

  var apply_value_trim = function(tree, context) {

    var v = apply_value(tree, context);
    return ((typeof v) === 'string') ? v.trim() : v;
  };

  var apply_text = function(tree, context) {

    var t = apply_value(tree, context);
    if (t) t = t.toString().trim();

    return { text: t };
  };
  var apply_p = apply_text;

  var apply_dash_block = function(tree, context, match) {

    var rs = [];

    var as = match[1].trim().split(/\s*,\s*/);
    var ctx = {}; for (var k in context) { ctx[k] = context[k]; }
    ctx.__fun = function(args) {
      as.forEach(function(a, i) { ctx[a] = args[i]; });
      apply_content(tree, ctx).forEach(function(c) { rs.push(c) });
    };
    do_eval(
      ctx, tree.c + ' return __fun(arguments); })');

    return rs;
  };

  var apply_dash_for = function(tree, context, m) {

    var rs = [];

    var ctx = {}; for (var k in context) { ctx[k] = context[k]; }
    ctx.__fun = function() {
      apply_content(tree, ctx).forEach(function(c) { rs.push(c) });
    };
    do_eval(
      ctx, tree.c + ' context.' + m[1] + ' = ' + m[1] +';' + ' __fun(); }');

    return rs;
  };

  var apply_dash = function(tree, context) {

    //if (tree.c.match(/{\s*$/)) return apply_dash_block(tree, context);

    var m = tree.c.match(/\bfunction\s*\(([^)]*)\s*\)\s*{\s*$/);
    if (m) return apply_dash_block(tree, context, m);

    m = tree.c.match(/\bfor\s*\(var\s+([^\s=]+)\s*=.+{\s*$/);
    if (m) return apply_dash_for(tree, context, m);

    apply_value_code(tree, context); return null;
  };

  var apply_content = function(tree, context) {

    return tree.cn
      .map(function(c) {
        //
        var fun; if (c.t) fun = 'apply_' + c.t;
        else if (c.x === '=') fun = 'apply_equal';
        else if (c.x === '-') fun = 'apply_dash';
        //
        return eval(fun)(c, context); })
      .reduce(
        function(a, e) {
          if (Array.isArray(e)) { a = a.concat(e); } else { a.push(e); };
          return a; },
        []);
  };

  var loadDataUrl = function(key, path) {

    if (dataUrls[key]) { return; }
    if ((typeof Image) === "undefined") { dataUrls[key] = path; return; }

    var img = new Image();
    img.onload =
      function() {
        var can = document.createElement('canvas');
        can.width = this.naturalWidth;
        can.height = this.naturalHeight;
        can.getContext('2d').drawImage(this, 0, 0);
        dataUrls[key] = can.toDataURL('image/png');
      };
    img.src = path;
  };

  var loadDataUrls = function(tree, context) {

    gather(tree, null, true)
      .forEach(function(t) { loadDataUrl(t.t, apply_value(t, context)); });
  };

  var apply_document = function(tree, context) {

    if (tree.t !== 'document') throw new Error('Root is not a "document"');

    var doc = {};

    // document "properties"

    [ 'pageSize', 'pageOrientation', 'pageMargins' ].forEach(function(k) {
      var t = lookup(tree, k);
      if (t) doc[k] = apply_value_trim(t, context);
    });

    // dataUrls

    var du = lookup(tree, 'dataUrls');
    if (du) loadDataUrls(du, context);

    // content

    var content = lookup(tree, [ 'content', 'body' ]);

    if ( ! content) {
      throw new Error('Document is missing a "content" or "body" node'); }

    doc.content =
      apply_content(content, context)
        .filter(function(c) { return c !== null; });

    // done, return document object

    return doc;
  };

  // public

  this.debug = function(s, debugLevel) {

    return SlipdfParser.parse(s, { debug: debugLevel });
  };

  this.prepare = function(s) {

    var t = SlipdfParser.parse(s);

    if ( ! t) throw new Error("Slim parsing failed");

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

    return function(context) {
      context.dataUrls = dataUrls;
      return apply_document(tree, context); };
  };

  // done.

  return this;

}).apply({}); // end Slipdf

