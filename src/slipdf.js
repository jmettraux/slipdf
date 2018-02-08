
var SlipdfParser = Jaabro.makeParser(function() {

  // parse

  function eol(i) { return rex(null, i, /\n+/); }
  function equal(i) { return rex(null, i, /[ \t]*=[ \t]*/); }
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

  function code(i) { return rex('code', i, /(\\\n|,\n|[^\n])+/); }

  function hashBra(i) { return str(null, i, '#{'); }
  function dq(i) { return str(null, i, '"'); }
  function dqCodes(i) { return rep('code', i, braElt, 0); }
  function dqCode(i) { return seq(null, i, hashBra, dqCodes, braEnd); }
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

  function klass(i) { return rex('class', i, /\.[a-z][-_a-zA-Z0-9]*/); }
  function tag(i) { return rex('tag', i, /[a-z][-_a-zA-Z0-9]*/); }

  function head(i) { return seq('head', i, tag, klass, '*'); }

  function codeLine(i) { return seq('cline', i, spacestar, doe, code, eol); }

  function poq(i) { return rex(null, i, /('|\|[ \t]*)/); }
  function stringLine(i) { return seq('sline', i, spacestar, poq, text, eol); }

  function plainEqual(i) { return rex(null, i, /[ \t]*=/); }
  function plainCode(i) { return seq(null, i, plainEqual, code); }
  function plainTail(i) { return alt('tail', i, plainCode, text); }

  function plainLine(i) {
    return seq('pline', i,
      spacestar, head, attributes, '?', spacestar, plainTail, '?', eol); }

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

  function rewrite_text(t) {

    var es = t.subgather().map(rewrite);
    if ( ! es.find(function(e) { return (typeof e.s) === 'string'; })) {
      es.push({ s: '' }); // to ensure it results in a text
    }

    return es;
  };

  function rewrite_attBraValue(t) {

    return { x: '=', c: t.string().trim() };
  }

  function rewrite_attSqValue(t) {

    var s = t.string().slice(1); s = s.substr(0, s.length - 1);
    return { s: s };
  }

  var rewrite_attDqValue = rewrite_text;

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

  function rewrite_string(t) {

    return { s: t.string() };
  };

  function rewrite_code(t) {

    return { x: '=', c: t.string() };
  };
}); // end SlipdfParser


var Slipdf = (function() {

  "use strict";

  var self = this;

  var VERSION = '1.0.1';

  var dataUrls = {};

  // protected

  var debugOn = function() { return (typeof DEBUG) !== 'undefined' };

  // helpers

  var toString = function(o) {

    return (o === null || o === undefined) ? '' : o.toString();
  };

  var isStringArray = function(cn) {

    if ( ! cn) return false;

    var r = false; for (var i = 0, l = cn.length; i < l; i++) {
      var c = cn[i];
      if (Array.isArray(c.cn)) return false;
      if ((typeof c.s) === 'string') r = true;
    }
    return r;
  };

  var push = function(r, o) {

    if (Array.isArray(r)) r.push(o);
    else r.stack.push(o);

    return r;
  };

  var doEval = function(context, code) {

    code = code
      .replace(/(\\\n)/g, '')
      .replace(/,\n/g, ',');

    if ( ! (
      code.match(/\s*\b(if|for)\b/))
    ) {
      code = '(' + code + ')';
    }

    var ks = Object.keys(context);
    if (ks.length < 1) ks.push('_');

    var func =
      eval("(function(code, " + ks.join(',') + ") { return eval(code); })");

    var args = ks.map(function(k) { return context[k]; });
    args.splice(0, 0, code);

    try {
      return func.apply(null, args);
    } catch(e) {
      //throw new Error(
      //  "slipdf couldn't eval >" + code + "<" +
      //  " (cause: >" + e.toString() + "<)");
      e.message =
        "slipdf couldn't eval >" + code + "< (cause: >" + e.toString() + "<)";
      throw e;
    }
  };

  // generic apply functions

  var applyFooterFunction = function(tree, context, result, pk, tpk) {

    var f = function(p, tp) {

      var ctx = {}; for (var k in context) { ctx[k] = context[k]; }
      ctx[pk] = p;
      ctx[tpk] = tp;

//var r = apply(tree.cn[0], ctx, []);
//clog(r);
//clog(JSON.parse(JSON.stringify(r)));
//return r;
      return applyChildren(tree.cn[0], ctx, []);
    };
    if (debugOn) {
      f.toJSON = function() {
        return 'footer function jlen' + JSON.stringify(tree.cn[0].cn).length;
      }
    }

    return f;
  };

  var addStyle = function(context, result, style) {

    var ss = style.split(',').map(function(s) { return s.trim(); });

    ss.forEach(function(s) {
      var h = (context._styles || {})[s]
      if (h) for (var k in h) { result[k] = h[k]; } });

    var css = result.style || []; if ( ! Array.isArray(css)) css = [ css ];
    css = css.concat(ss);
    if (css.length === 1) css = css[0];

    result.style = css;
  };

  var applyStyles = function(tree, context, result) {

    if ( ! tree.cs || tree.cs.length < 1) return;

    tree.cs.forEach(function(c) { addStyle(context, result, c); });
  };

  var RENAME_MAP = { colspan: 'colSpan', rowspan: 'rowSpan' };

  var applyAttributes = function(tree, context, result) {

    if (tree.as) tree.as
      .forEach(function(kv) {
        var k = kv[0]; k = RENAME_MAP[k] || k;
        var v = kv[1];
        apply({ t: 'attribute', k: k, cn: v }, context, result); });
  };

  var applyCodeIf = function(tree, context, result) {

    var ctx = {}; for (var k in context) { ctx[k] = context[k]; }
    ctx.__fun = function() {
      applyChildren(tree, ctx, result); };
    doEval(
      ctx,
      tree.c + ' __fun(arguments); }');
  };

  var applyCodeFor = function(tree, context, result, match) {

    var ctx = {}; for (var k in context) { ctx[k] = context[k]; }
    ctx.__fun = function() {
      applyChildren(tree, ctx, result); };
    doEval(
      ctx,
      tree.c + ' context.' + match[1] + ' = ' + match[1] +';' + ' __fun(); }');
  };

  var applyCodeFunction = function(tree, context, result, match) {

    var as = match[1].trim().split(/\s*,\s*/);
    var ctx = {}; for (var k in context) { ctx[k] = context[k]; }
    ctx.__fun = function(args) {
      as.forEach(function(a, i) { ctx[a] = args[i]; });
      applyChildren(tree, ctx, result); };
    doEval(
      ctx,
      tree.c + ' return __fun(arguments); })');
  };

  var applyReturningCode = function(tree, context, result) {

    push(result, doEval(context, tree.c));
  };

  var applyCode = function(tree, context, result) {

    var m = tree.c.match(/\bfunction\s*\(([^)]*)\s*\)\s*{\s*$/);
    if (m) return applyCodeFunction(tree, context, result, m);

    m = tree.c.match(/\bfor\s*\(var\s+([^\s=]+)\s*=.+{\s*$/);
    if (m) return applyCodeFor(tree, context, result, m);

    m = tree.c.match(/\bif\s*\((.|\n)+\)\s*\{\s*$/);
    if (m) return applyCodeIf(tree, context, result);

    doEval(context, tree.c);
  };

  var applyPseudoAttribute = function(tree, context, result) {

    result[tree.t] = applyAndReduceChildren(tree, context);
  };

  var applyS = function(tree, context, result) {

    push(result, tree.s);
  };

  var applyHeaderOrFooter = function(tree, context, result) {

    if ( ! tree.cn) return;

    var k = tree.t;

    var c0 =
      tree.cn[0];
    var m = ((c0.x === '=' && c0.c) || '')
      .match(/\s*function[ \t]*\(\s*([^,]+),\s*([^,]+)\s*\)\s*{\s*/)

    result[k] =
      m ?
      applyFooterFunction(tree, context, result, m[1], m[2]) :
      applyChildren(tree, context, []);
  };

  var applyChildren = function(tree, context, result) {

    (tree.cn || [])
      .forEach(function(c) { apply(c, context, result); });

    return result;
  };

  var applyAndReduceChildren = function(tree, context) {

    var a = applyChildren(tree, context, []);

    if (a.length < 1) return null;

    if (isStringArray(tree.cn)) return a.reduce(
      function(s, e) {
        if (e === null || e === undefined) return s;
        return s + e.toString(); },
      '');

    if (a.length === 1) return a[0];
    return a;
  };

  var applyText = function(tree, context, result) {

    var t = applyAndReduceChildren(tree, context);

    var tt = (typeof t);
    var ks = Object.keys(t || 1);
      //
    if (Array.isArray(t)) {
      t =
        t.map(function(e) {
          if ((typeof e) === 'string') return { text: e };
          return e; })
    }
    else if (t === null) {
      t = '';
    }
    else if (tt === 'object' && ks.length === 1 && ks[0] === 'text') {
      t = t.text;
    }
    else if (tt === 'object') {
      t = [ t ];
    }
    else if (tt !== 'string') {
      t = toString(t);
    }

    var r = { text: t };

    applyStyles(tree, context, r);
    applyAttributes(tree, context, r);

    push(result, r); return r;
  };

  var applyTaggedText = function(tree, context, result) {

    var r = applyText(tree, context, result);
    r[tree.t] = r.text; delete r.text;

    return r;
  };

  var applyStack = function(tree, context, result) {

    var r = applyText(tree, context, result);

    if ((typeof r.text) === 'string') return r;

    r.stack = r.text; delete r.text;

    if (r.stack.length > 1) return r;

    var rr = r.stack[0];
    for (var k in r) { if (k !== 'stack') rr[k] = r[k]; }

    result.splice(-1, 1, rr);

    return rr;
  };

  // tag apply functions

  var apply_img = function(tree, context, result) {

    var r = {};

    applyStyles(tree, context, r);
    applyAttributes(tree, context, r);

    r.image = r.src; delete r.src;

    return push(result, r);
  };

  var apply_td = applyStack;


  var apply_tr = function(tree, context, result) {

    return push(result, applyChildren(tree, context, []));
  };

  var apply_tbody = applyChildren; // pass through

  var apply_table = function(tree, context, result) {

    var table = {};
    var r = { table: table };

    applyStyles(tree, context, r);
    applyAttributes(tree, context, r);

    [
      'widths', 'heights', 'headerRows'
    ].forEach(function(k) {
      if (r.hasOwnProperty(k)) { table[k] = r[k]; delete r[k]; }
    });

    table.body = applyChildren(tree, context, []);

    push(result, r); return r;
  };

  var apply_attribute = function(tree, context, result) {

    var v = applyAndReduceChildren(tree, context, result);

    if (tree.k === 'class' || tree.k === 'style')
      addStyle(context, result, v);
    else
      result[tree.k] = v;
  };

  var apply_a = function(tree, context, result) {

    var r = apply_p(tree, context, result);

    r.link = r.href; delete r.href;

    return r;
  };

  var apply_li = applyText;

  var apply_ol = applyTaggedText;
  var apply_ul = applyTaggedText;

  var apply_p = applyText;
  var apply_span = applyText;

  var apply_div = applyStack;

  var apply_content = function(tree, context, result) {

    result.content = applyChildren(tree, context, []);
  };
  var apply_body = apply_content;

  var apply_footer = applyHeaderOrFooter;
  var apply_header = applyHeaderOrFooter;

  var apply_colours = function(tree, context, result) {

    if ( ! tree.cn || tree.cn.length < 1) return;

    tree.cn
      .forEach(function(c) {
        context.colours[c.t] = applyAndReduceChildren(c, context, result);
      });
  };

  var apply_styles = function(tree, context, result) {

    result.styles = {};
    context._styles = result.styles;

    if (tree.cn) tree.cn
      .forEach(function(c) {
        result.styles[c.t] = applyAndReduceChildren(c, context, result);
      });
  };

  var apply_document = function(tree, context, result) {

    applyAttributes(tree, context, result);

    (tree.cn || [])
      .forEach(function(c) {
        if ([
          'pageSize', 'pageOrientation', 'pageMargins'
        ].includes(c.t)) { c.pa = true; }
      });

    applyChildren(tree, context, result);
  };

  var apply = function(tree, context, result) {

    var fun;

    if (tree.pa) fun = 'applyPseudoAttribute';
    else if (tree.t) fun = 'apply_' + tree.t;
    else if ((typeof tree.s) === 'string') fun = 'applyS';
    else if (tree.x === '=') fun = 'applyReturningCode';
    else if (tree.x === '-') fun = 'applyCode';
    else
      throw new Error('apply() cannot make sense of ' + JSON.stringify(tree));

    //if ((typeof eval(fun)) !== 'function') throw new Error('fun:' + fun);
    eval(fun)(tree, context, result);

    return result;
  };

  // public

  this.addDataUrl = function(key, uri) {

    if ((typeof Image) === "undefined") { dataUrls[key] = uri; return; }

    var img = new Image();
    img.onload =
      function() {
        var can = document.createElement('canvas');
        can.width = this.naturalWidth;
        can.height = this.naturalHeight;
        can.getContext('2d').drawImage(this, 0, 0);
        dataUrls[key] = can.toDataURL('image/png');
      };
    img.src = uri; // which triggers the loading
  };
  this.addDataURL = self.addDataUrl;

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

      var cs = {};
      context.colours = cs;
      context.colors = cs;

      context.dataUrls = dataUrls;

      context.ffalse = [ false, false, false, false ];

      return apply(tree, context, {}); };
  };

  // done.

  return this;

}).apply({}); // end Slipdf

