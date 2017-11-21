
var SlipdfParser = Jaabro.makeParser(function() {

  // parse

  function eol(i) { return rex(null, i, /\n+/); }
  function comment(i) { return rex(null, i, / \s*\/[^\n]+/); }
  function equal(i) { return rex(null, i, /[ \t]*=[ \t]*/); }
  function space(i) { return rex('space', i, /[ \t]+/
  function spacestar(i) { return rex('space', i, /[ \t]*/

  function name(i) { return rex('name', i, /[-_a-zA-Z0-9]+/); }

  function attribute(i) { return seq('att', i, space, name, equal, value); }

  function klass(i) { return rex('class', i, /\.[-_a-z]+/); }
  function tag(i) { return rex('name', i, /(pdf|text|image|table)/); }

  function head(i) { return seq('head', i, tag, klass, '*'); }

  function plainLine(i) {
    return seq('line', i, spacestar, head, attribute, '*', comment '?', eol); }

  function blankLine(i) { return rex(null, i, /\s*\n+/); }
  function commentLine(i) { return rex(null, i, /\s*\/[^\n]*\n+/); }

  function line(i) { return alt(null, i, blankLine, commentLine, plainLine); }
  function lines(i) { return seq('lines', i, line, '*'); }

  var root = lines;

  // rewrite

//  function rewrite_cmp(t) {
//
//    //if (t.children.length === 1) return rewrite(t.children[0]);
//    //return [
//    //  'cmp',
//    //  t.children[1].children[0].string().trim(),
//    //  rewrite(t.children[0]),
//    //  rewrite(t.children[1].children[1])
//    //];
//  }
}); // end SlipdfParser


var Slipdf = (function() {

  "use strict";

  //var self = this;

  var VERSION = '1.0.0';

  // protected

  // public

  // done.

  return this;

}).apply({}); // end Slipdf

