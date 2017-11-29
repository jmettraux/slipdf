
var SlipdfParser = Jaabro.makeParser(function() {

  // parse

  function eol(i) { return rex(null, i, /\n+/); }
  function equal(i) { return rex(null, i, /[ \t]*=[ \t]*/); }
  function pipe(i) { return rex(null, i, /\|[ \t]*/); }
  function space(i) { return rex('space', i, /[ \t]+/); }
  function spacestar(i) { return rex('space', i, /[ \t]*/); }
  function wsStar(i) { return rex(null, i, /\s*/); }
  function wsEqual(i) { return rex(null, i, /\s*=\s*/); }
  function doe(i) { return rex('doe', i, /[-=]\s*/); }

  function parSta(i) { return str(null, i, '('); }
  function parEnd(i) { return str(null, i, ')'); }
  function sbrSta(i) { return str(null, i, '['); }
  function sbrEnd(i) { return str(null, i, ']'); }
  function braSta(i) { return str(null, i, '{'); }
  function braEnd(i) { return str(null, i, '}'); }
  function noBra(i) { return rex(null, i, /[^[\](){}"'\n]+/); }

  function sqs(i) { return rex(null, i, /'(\\'|[^'])*'/); }
  function dqs(i) { return rex(null, i, /"(\\"|[^"])*"/); }

  function braElt(i) { return alt(null, i, par, sbr, bra, sqs, dqs, noBra); }

  function bra(i) { return seq(null, i, braSta, braElt, '*', braEnd); }
  function sbr(i) { return seq(null, i, sbrSta, braElt, '*', sbrEnd); }
  function par(i) { return seq(null, i, parSta, braElt, '*', parEnd); }

  function txtText(i) { return rex('string', i, /(.+?)(?=#\{|\n|$)/); }
  function txtElt(i) { return alt(null, i, dqCode, txtText); }
  function text(i) { return rep('text', i, txtElt, 1); }

  function code(i) { return rex('code', i, /[^\n]+/); }

  function hashBra(i) { return str(null, i, '#{'); }
  function dq(i) { return str(null, i, '"'); }
  function dqCodes(i) { return rep('code', i, braElt, 1); }
  function dqCode(i) { return seq(null, i, hashBra, dqCodes, '?', braEnd); }
  function dqText(i) { return rex('string', i, /(\\"|[^"])+?(?=#\{|"|\n|$)/); }
  function dqElt(i) { return alt(null, i, dqCode, dqText); }
  function attDqValue(i) { return seq('attDqValue', i, dq, dqElt, '*', dq); }

  function attPlainValue(i) { return rex('attPlainValue', i, /[^ \t\n]+/); }
  function attBraValue(i) { return alt('attBraValue', i, par, sbr, bra); }
  function attSqValue(i) { return ren('attSqValue', i, sqs); }

  function attName(i) {
    return rex('attName', i,
      /[a-zA-z][-_a-zA-Z0-9]*/); }
  function attValue(i) {
    return alt('attValue', i,
      attSqValue, attDqValue, attBraValue, attPlainValue); }

  function att(i) { return seq('att', i, space, attName, equal, attValue); }
  function psbAtt(i) { return seq('att', i, attName, wsEqual, attValue); }

  function sParSta(i) { return rex(null, i, /\(\s*/); }
  function sParEnd(i) { return rex(null, i, /\s*\)/); }
  function sSbrSta(i) { return rex(null, i, /\[\s*/); }
  function sSbrEnd(i) { return rex(null, i, /\s*\]/); }
  function sBraSta(i) { return rex(null, i, /\{\s*/); }
  function sBraEnd(i) { return rex(null, i, /\s*\}/); }

//function eseq(name, input, startpa, eltpa, seppa, endpa)
  function atts(i) { return rep(null, i, att, 1); }
  function parAtts(i) {
    return eseq(null, i, sParSta, psbAtt, wsStar, sParEnd); }
  function sbrAtts(i) {
    return eseq(null, i, sSbrSta, psbAtt, wsStar, sSbrEnd); }
  function braAtts(i) {
    return eseq(null, i, sBraSta, psbAtt, wsStar, sBraEnd); }

  function attributes(i) {
    return alt(null, i,
      parAtts, sbrAtts, braAtts, atts); }

  function klass(i) { return rex('class', i, /\.[-_a-z]+/); }
  function tag(i) { return rex('tag', i, /[a-z][a-zA-Z0-9]*/); }

  function head(i) { return seq('head', i, tag, klass, '*'); }

  function codeLine(i) { return seq('cline', i, spacestar, doe, code, eol); }
  function stringLine(i) { return seq('sline', i, spacestar, pipe, text, eol); }

  function plainCode(i) { return rex('code', i, /[ \t]*=[^\n]+/); }
  function plainTail(i) { return alt('tail', i, plainCode, text); }

  function plainLine(i) {
    return seq('pline', i,
      spacestar, head, attributes, '?', plainTail, '?', eol); }

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

  function rewrite_attBraValue(t) {

    return { x: '=', c: t.string().trim() };
  }

  function rewrite_attSqValue(t) {

    var s = t.string().slice(1); s = s.substr(0, s.length - 1);
    return { s: s };
  }

  function rewrite_attDqValue(t) {

    return t.subgather().map(rewrite);
  }

  function rewrite_attPlainValue(t) {

    return { s: t.string() };
  }

  function rewrite_pline(t) {

    var head = t.lookup('head');
    var tail = t.lookup('tail');

    var o = {};

    o.i = t.lookup('space').length;
    o.t = head.lookup('tag').string();

    var cs = head
      .gather('class')
      .map(function(c) { return c.string().slice(1); });
    if (cs.length > 0) o.cs = cs;

    t.gather('att').forEach(function(c) {
      if ( ! o.as) o.as = [];
      var n = c
        .lookup('attName')
        .string()
        .trim();
      var v = []; c
        .lookup('attValue')
        .subgather()
        .forEach(function(cc) {
          var vv = rewrite(cc);
          if (Array.isArray(vv)) vv.forEach(function(e) { v.push(e); })
          else v.push(vv); });
      o.as.push([ n, v ]);
    });

    if (tail) {
      var tex = tail.lookup('text');
      var cod = tex || tail.lookup('code');
      if (tex) o.cn = rewrite(tex);
      else if (cod) o.cn = [ rewrite(cod) ];
    }

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
  var colours = {};

  // protected

  var debugOn = function() { return (typeof DEBUG) !== 'undefined' };

  var pushAll = function(targetArray, src) {

    if (Array.isArray(src)) src.forEach(function(e) { targetArray.push(e); });
    else targetArray.push(src);

    return targetArray;
  };

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

    code = '(' + code + ')';

    var ks = Object.keys(context);
    if (ks.length < 1) ks.push('_');

    var func =
      eval("(function(code, " + ks.join(',') + ") { return eval(code); })");

    var args = ks.map(function(k) { return context[k]; });
    args.splice(0, 0, code);

    return func.apply(null, args);
  };

  var getAtt = function(tree, context, key) {

    if ( ! tree.as) return null;

    var a = tree.as.find(function(kv) { return kv[0] === key; });
    if ( ! a) return null;

    //return apply_content({ cn: a[1] }, context);
    return apply_value({ cn: a[1] }, context);
  };

  var getStringAtt = function(tree, context, key, joiner) {

    joiner = joiner || '';

    var a = getAtt(tree, context, key);
    if ( ! a) return null;
    if ( ! Array.isArray(a)) a = [ a ];

    return a.map(function(e) { return e.toString(); }).join(joiner);
  };

  var setAtts = function(tree, context, result, whiteList, blackList) {

    if ( ! tree.as) return;

    tree.as.forEach(function(kv) {
      var k = kv[0];
      if (blackList && blackList.includes(k)) return;
      if (whiteList && ! whiteList.includes(k)) return;
      var v = kv[1];
      result[k] = getAtt(tree, context, k); });
  };

  var addColours = function(tree, context) {

    tree.cn.forEach(function(c) {
      colours[c.t] = apply_value_trim(c, context);
    });
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

  var getChildValue = function(tree, context, childTag) {

    var t = lookup(tree, childTag);
    return t ? apply_value_trim(t, context) : null;
  };

  var getStyles = function(tree, context) {

    return (tree.cn || [])
      .reduce(
        function(r, c) {
          r[c.t] = getChildValue(tree, context, c.t);
          return r; },
        {});
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
      pushAll(rs, apply_content(tree, ctx)); };
    do_eval(
      ctx, tree.c + ' return __fun(arguments); })');

    return rs;
  };

  var apply_dash_for = function(tree, context, m) {

    var rs = [];

    var ctx = {}; for (var k in context) { ctx[k] = context[k]; }
    ctx.__fun = function() {
      pushAll(rs, apply_content(tree, ctx)); };
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

  var apply_equal = apply_value_code;

  var apply_content = function(tree, context) {

    return tree.cn
      .map(function(c) {
        //
        var fun; if (c.t) fun = 'apply_' + c.t;
        else if (c.x === '=') fun = 'apply_equal';
        else if (c.x === '-') fun = 'apply_dash';
        else throw new Error(
          'apply_content() cannot make sense of ' + JSON.stringify(c));
        //
        return eval(fun)(c, context); })
      .reduce(
        function(a, e) {
          if (Array.isArray(e)) { a = a.concat(e); } else { a.push(e); };
          return a; },
        []);
  };

  var apply_img = function(tree, context) {

    var r = {};
    r.image = getStringAtt(tree, context, 'src');
    r.style = tree.cs;
    setAtts(tree, context, r, null, [ 'src' ]);

    return r;
  };

  var apply_td = function(tree, context) {

    var r = apply_content(tree, context);

    var cs = getAtt(tree, context, 'colspan');
    if (cs && r[0]) r[0].colSpan = cs;

    var rs = getAtt(tree, context, 'rowspan');
    if (rs && r[0]) r[0].rowSpan = rs;

    return r;
  };

  var apply_tr = function(tree, context) {

    return gather(tree, 'td')
      .reduce(
        function(a, td) { return pushAll(a, apply_td(td, context)); },
        [])
  };

  var apply_table = function(tree, context) {

    var table = {};
    var r = { table: table };

    var tableAtts = [ 'widths', 'heights', 'headerRows' ];

    setAtts(tree, context, r, null, tableAtts); // whitelist / blacklist
    setAtts(tree, context, table, tableAtts, null); // wl / bl

    table.body = gather(tree, 'tr')
      .map(function(tr) { return apply_tr(tr, context); });

    return r;
  };

  var apply_footer_function = function(tree, context, pk, tpk) {

    var f = function(p, tp) {

      var ctx = {}; for (var k in context) { ctx[k] = context[k]; }
      ctx[pk] = p;
      ctx[tpk] = tp;

      return apply_content(tree.cn[0], ctx);
    };
    if (debugOn) {
      f.toJSON = function() {
        return 'footer function jlen' + JSON.stringify(tree.cn[0]).length;
      }
    }

    return f;
  };

  var apply_document = function(tree, context) {

    if (tree.t !== 'document') throw new Error('Root is not a "document"');

    var doc = {};

    // document "properties"

    'pageSize pageOrientation pageMargins defaultStyle'
      .split(' ')
      .forEach(function(k) {
        var v = getAtt(tree, context, k) || getChildValue(tree, context, k);
        if (v) doc[k] = v; });

    // colours

    var co = lookup(tree, [ 'colours', 'colors' ]);
    if (co) addColours(co, context);

    // dataUrls

    var du = lookup(tree, 'dataUrls');
    if (du) loadDataUrls(du, context);

    // styles

    var st = lookup(tree, 'styles');
    tree.cn = tree.cn.filter(function(t) { return t.t !== 'styles'; });
    if (st) doc.styles = getStyles(st, context);

    // header

    // TODO

    // footer

    var footer = lookup(tree, 'footer');
      //
    if (footer && footer.cn && footer.cn[0]) {

      var c0 =
        footer.cn[0];
      var m = ((c0.x === '=' && c0.c) || '')
        .match(/\s*function[ \t]*\(\s*([^,]+),\s*([^,]+)\s*\)\s*{\s*/)

      doc.footer =
        m ?
        apply_footer_function(c0, context, m[1], m[2]) :
        apply_content(c0, context);
    }

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
      context.colours = colours;
      context.colors = colours;
      context.dataUrls = dataUrls;
      return apply_document(tree, context); };
  };

  // done.

  return this;

}).apply({}); // end Slipdf

