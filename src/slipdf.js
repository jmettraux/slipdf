
var SlipdfParser = Jaabro.makeParser(function() {

  // parse

  function eol(i) { return rex(null, i, /\n+/); }
  function comment(i) { return rex(null, i, / \s*\/[^\n]+/); }
  function equal(i) { return rex(null, i, /[ \t]*=[ \t]*/); }
  function space(i) { return rex('space', i, /[ \t]+/); }
  function spacestar(i) { return rex('space', i, /[ \t]*/); }

  function name(i) { return rex('name', i, /[-_a-zA-Z0-9]+/); }
  function value(i) { return rex('value', i, /[^ ]+/); }

  function attribute(i) { return seq('att', i, space, name, equal, value); }

  function klass(i) { return rex('class', i, /\.[-_a-z]+/); }
  function tag(i) { return rex('tag', i, /[a-z][a-zA-Z0-9]*/); }

  function head(i) { return seq('head', i, tag, klass, '*'); }

  function plainLine(i) {
    return seq('line', i, spacestar, head, attribute, '*', comment, '?', eol); }

  function blankLine(i) { return rex(null, i, /\s*\n+/); }
  function commentLine(i) { return rex(null, i, /\s*\/[^\n]*\n+/); }

  function line(i) { return alt(null, i, blankLine, commentLine, plainLine); }
  function lines(i) { return seq('lines', i, line, '*'); }

  var root = lines;

  // rewrite

  function rewrite_lines(t) {
    return t.gather('line').map(function(l) { return rewrite(l); });
  }

  function rewrite_line(t) {

    var o = {};

    o.indent = t.lookup('space').length;

    var head = t.lookup('head');

    o.tag = head.lookup('tag').string();

    var cs = head
      .gather('class')
      .map(function(c) { return c.string().slice(1); });
    if (cs.length > 0) o.classes = cs;

    return o;
  }
}); // end SlipdfParser


var Slipdf = (function() {

  "use strict";

  //var self = this;

  var VERSION = '1.0.0';

  // protected

  // public

  this.compile = function(s) {

    var t = SlipdfParser.parse(s);

    var root =
      { indent: -1, tag: 'root', children: [] };
    t.reduce(
      function(parent, line) {
        while (line.indent <= parent.indent) parent = parent.parent;
        if ( ! parent.children) parent.children = [];
        parent.children.push(line);
        line.parent = parent;
        return line;
      },
      root);
    t.forEach(
      function(line) {
        delete line.indent;
        delete line.parent; });

    if (root.children.length === 1) return root.children[0];
    return root;
  };

  // done.

  return this;

}).apply({}); // end Slipdf

