/* jaabro-1.4.0.com.js | MIT license: https://github.com/jmettraux/jaabro/LICENSE.txt */

var Jaabro = { VERSION: '1.4.0' };
Jaabro.Input = {};
Jaabro.Input.slice = function(offset, length) {
if (offset === undefined || offset === null) offset = this.offset;
if (length === undefined) return this.string.slice(offset);
return this.string.slice(offset, offset + length);};
Jaabro.Input.match = function(str_or_rex) {
if ((typeof str_or_rex) === 'string') {
var l = str_or_rex.length;
return this.slice(this.offset, l) === str_or_rex ? l : -1;}
var m = this.slice(this.offset).match(str_or_rex);
return m !== null && m.index === 0 ? m[0].length : -1;};
Jaabro.Tree = {};
Jaabro.Tree.prune = function() {
this.children = this.children.filter(function(c) { return c.result === 1; });};
Jaabro.Tree.string = function() {
return this.input.slice(this.offset, this.length); };
Jaabro.Tree.strinp = function() {
return this.input.slice(this.offset, this.length).trim(); };
Jaabro.Tree.strim = Jaabro.Tree.strinp;
Jaabro.Tree.stringd = function() {
return this.input.slice(this.offset, this.length).toLowerCase(); }
Jaabro.Tree.strind = Jaabro.Tree.stringd;
Jaabro.Tree.stringpd = function() {
return this.input.slice(this.offset, this.length).trim().toLowerCase(); }
Jaabro.Tree.strinpd = Jaabro.Tree.stringpd;
Jaabro.Tree.lookup = function(name) {
if (name === null) { if (this.name) return this; }
else { if (this.name === name) return this; }
return this.sublookup(name);};
Jaabro.Tree.sublookup = function(name) {
for (var i = 0, l = this.children.length; i < l; i++) {
var r = this.children[i].lookup(name);
if (r) return r;}
return null;};
Jaabro.Tree.gather = function(name) {
if ( ! name) name = null;
var acc = arguments[1] || [];
if ((name === null && this.name) || (name && this.name === name))
acc.push(this);
else
this.children.forEach(function(c) { c.gather(name, acc) });
return acc;};
Jaabro.Tree.subgather = function(name) {
var acc = arguments[1] || [];
this.children.forEach(function(c) { c.gather(name, acc) });
return acc;};
Jaabro.Tree.eoChildren = function(start) {
var a = [];
for (var i = start, l = this.children.length; i < l; i = i + 2) {
a.push(this.children[i]);};
return a;};
Jaabro.Tree.oddChildren = function() { return this.eoChildren(1); };
Jaabro.Tree.evenChildren = function() { return this.eoChildren(0); };
Jaabro.Tree.toArray = function(opts) {
var cn = null;
if (this.result === 1 && this.children.length === 0){
cn = this.string();}
else {
cn = []; for (var i = 0, l = this.children.length; i < l; i++) {
cn.push(this.children[i].toArray(opts));}}
return [
this.name, this.result, this.offset, this.length, this.parter, cn ];};
Jaabro.Tree.toString = function() {
var depth = arguments[0] || 0;
var string = arguments[1] || [];
if (depth > 0) string.push('\n');
for (var i = 0; i < depth; i++) string.push('  ');
string.push(this.result, ' ', JSON.stringify(this.name), ' ');
string.push(this.offset, ',', this.length);
if (this.result === 1 && this.children.length === 0) {
string.push(' ', JSON.stringify(this.string()));}
this.children.forEach(function(c) { c.toString(depth + 1, string); });
return depth === 0 ? string.join('') : null;};
Jaabro.Tree._c = function(parentElt, tag, /*atts,*/ text) {
var ss = tag.split('.');
var e = document.createElement(ss.shift());
e.className = ss.map(function(c) { return 'jaabro' + c; }).join(' ');
e.textContent = text || '';
if (parentElt) parentElt.appendChild(e);
return e;};
Jaabro.Tree.toHtml = function(parentElement) {
var div = this._c(
parentElement, 'div.-tree.-' + (this.result === 1 ? 'success' : 'failure'));
var su = this._c(div, 'div.-summary');
var ex = this._c(div, 'div.-extra');
var noname = this.name === null;
var n = noname ? '(null)' : this.name;
var s = this.string()
.replace(/\n/g, '\u21b3').replace(/\r/g, '\u21b2');
var t = this.input.slice(this.offset, 80)
.replace(/\n/g, '\u21b3').replace(/\r/g, '\u21b2');
if (t.length === 80) t = t + '\u2026';
var f = this.parser.toString().replace('return Jaabro.', '');
var fm = f.match(/^function ([^(]+)/);
var fn = fm ? fm[1] : '(core parser)';
var cn = this.children.length;
var fcn = this.children.filter(function(c) { return c.result === 0; }).length;
var xn = noname ? '.-no-name' : '';
this._c(su, 'span.-name' + xn, n);
if (n !== fn) this._c(su, 'span.-parser', fn + '()');
this._c(su, 'span.-offlen', '[' + this.offset + ',' + this.length + ']');
var cl = this._c(su, 'span.-children-count');
this._c(cl, 'span.-total-children-count', 'cn' + cn);
this._c(cl, 'span.-failed-children-count', 'fcn' + fcn);
var ma = this._c(su, 'span.-match');
this._c(ma, 'span.-dquote', '"');
this._c(ma, 'span.-string', s);
this._c(ma, 'span.-post-string', t.slice(s.length));
this._c(ma, 'span.-dquote', '"');
this._c(ex, 'span.-parser', f);
if (this.children.length > 0) {
var cn = this._c(div, 'div.-children');
this.children.forEach(function(c) { c.toHtml(cn); });}
return div;};
Jaabro.str = function(name, input, str) {
var r = this.makeTree(
name, input, (typeof str) === 'string' ? 'str' : 'rex', Jaabro.str.caller);
var l = input.match(str, name);
if (l > -1) {
r.result = 1;
r.length = l;
input.offset = input.offset + l;}
return r;};
Jaabro.rex = Jaabro.str;
Jaabro.alt = function(name, input, parsers_) {
var ps = [];
for (var i = 2, l = arguments.length; i < l; i++) ps.push(arguments[i]);
var l = ps[ps.length - 1];
var g = false; if (l === true || l === false) { ps.pop(); g = l; }
var o = input.offset;
var r = this.makeTree(name, input, g ? 'altg' : 'alt', Jaabro.alt.caller);
var cr = null;
while (true) {
var p = ps.shift(); if ( ! p) break;
var rr = p(input);
r.children.push(rr);
input.offset = o;
if (g) {
if (rr.result === 1 && rr.length >= (cr ? cr.length : -1)) {
if (cr) cr.result = 0;
cr = rr;}
else {
rr.result = 0;}}
else {
cr = rr;
if (rr.result === 1) break;}};
if (cr && cr.result === 1) {
r.result = 1;
r.length = cr.length;
input.offset = o + r.length;}
if (input.options.prune) r.prune();
return r;};
Jaabro.altg = function(name, input, parsers_) {
var as = [];
for (var i = 0, l = arguments.length; i < l; i++) as.push(arguments[i]);
as.push(true);
return this.alt.apply(this, as);};
Jaabro.qmark = function() { return [ 0, 1 ]; };
Jaabro.star = function() { return [ 0, 0 ]; };
Jaabro.plus = function() { return [ 1, 0 ]; };
Jaabro.bang = function() { return -1; };
Jaabro.qmark.quantifier_name = 'qmark';
Jaabro.star.quantifier_name = 'star';
Jaabro.plus.quantifier_name = 'plus';
Jaabro.bang.quantifier_name = 'bang';
Jaabro.toQuantifier = function(parser) {
if (parser === '?') return this.qmark;
if (parser === '*') return this.star;
if (parser === '+') return this.plus;
if (parser === '!') return this.bang;
if (parser && parser.quantifier_name) return parser;
return null;};
Jaabro.quantify = function(parser) {
var q = this.toQuantifier(parser);
return q ? q() : false;};
Jaabro.seq = function(name, input, parsers_) {
var o = input.offset;
var r = this.makeTree(name, input, 'seq', Jaabro.seq.caller);
var cr = null;
var ps = []; for (var i = 2, l = arguments.length; i < l; i++) {
ps.push(arguments[i]);}
while (true) {
var p = ps.shift(); if ( ! p) break;
var q = this.toQuantifier(p);
if (q) throw new Error("lonely quantifier '" + q.quantifier_name + "'");
q = this.quantify(ps[0]);
if (q === -1) {
ps.shift();
cr = this.nott(null, input, p);
r.children.push(cr);}
else if (q) {
ps.shift();
cr = this.rep(null, input, p, q[0], q[1]);
r.children = r.children.concat(cr.children);}
else {
cr = p(input);
r.children.push(cr);}
if (cr.result !== 1) break;}
if (cr.result === 1) {
r.result = 1;
r.length = input.offset - o;}
else {
input.offset = o;}
return r;};
Jaabro.rep = function(name, input, parser, min, max) {
if (min === null || min === undefined || min < 0) min = 0;
if (max === null || max === undefined || max < 0) max = 0;
var o = input.offset;
var r = this.makeTree(name, input, 'rep', Jaabro.rep.caller);
var count = 0;
while (true) {
var cr = parser(input);
r.children.push(cr);
if (cr.result !== 1) break;
count = count + 1;
if (cr.length < 1) break;
if (max > 0 && count === max) break;}
if (count >= min && (max < 1 || count <= max)) {
r.result = 1;
r.length = input.offset - o;}
else {
input.offset = o;}
if (input.options.prune) r.prune();
return r;};
Jaabro.ren = function(name, input, parser) {
var cr = parser(input);
cr.name = name;
return cr;};
Jaabro.nott = function(name, input, parser) {
var o = input.offset;
var r = this.makeTree(name, input, 'nott', Jaabro.nott.caller);
var cr = parser(input);
r.children.push(cr);
r.length = 0;
r.result = cr.result === 1 ? 0 : 1;
input.offset = o;
return r;};
Jaabro.all = function(name, input, parser) {
var o = input.offset;
var l = input.string.length - o;
var r = this.makeTree(name, input, 'all', Jaabro.all.caller);
var cr = parser(input);
r.children.push(cr);
if (cr.length < l) { input.offset = o; }
else { r.result = 1; r.length = l; }
return r;};
Jaabro.eseq = function(name, input, startp, eltp, sepp, endp) {
var j = false; // jseq?
if (sepp === undefined && endp === undefined) {
j = true;
sepp = eltp; eltp = startp; startp = null;}
var o = input.offset;
var r = this.makeTree(name, input, j ? 'jseq' : 'eseq', Jaabro.eseq.caller);
r.result = 1;
var cr = null;
if (startp) {
cr = startp(input);
r.children.push(cr);
if (cr.result !== 1) r.result = 0;}
if (r.result === 1) {
var i = 1;
var count = 0;
var emptyStack = 0;
while (true) {
i = (i + 1) % 2;
cr = (i === 0 ? eltp : sepp)(input);
emptyStack = cr.length == 0 ? emptyStack + 1 : 0;
if (emptyStack > 1) cr.result = 0;
r.children.push(cr);
if (cr.result !== 1) {
if (i === 0 && count > 0) {
var lsep = r.children[r.children.length - 2];
lsep.result = 0;
input.offset = lsep.offset;}
break;}
count = count + 1;}
if (j && count < 1) r.result = 0;}
if (r.result === 1 && endp) {
cr = endp(input);
r.children.push(cr);
if (cr.result !== 1) r.result = 0;}
if (r.result === 1) r.length = input.offset - o;
else input.offset = o;
if (input.options.prune) r.prune();
return r;};
Jaabro.jseq = Jaabro.eseq;
Jaabro.make = function(fun) {
var rw_ = function(t) {
for (var i = 0, l = t.children.length; i < l; i++) {
var c = t.children[i];
if (c.length > 0 || c.name) return rewrite(c);}
return null;};
var rw = function(t) {
return eval('rewrite_' + (t.name ? t.name : ''))(t);};
var p = Object.create(Jaabro);
var funs = fun.toString();
'all alt altg eseq jseq ren rep rex seq str nott'
.split(' ')
.forEach(function(f) {
funs = funs.replace(
new RegExp(" +" + f + "\\(", 'g'),
' Jaabro.' + f + '(');});
funs =
funs.slice(0, funs.lastIndexOf('}')) +
'var rewrite_; rewrite_ = rewrite_ || ' + rw_ + ';' +
'var rewrite; rewrite = rewrite ||' + rw + ';' +
'try { eval("root"); } catch(err) {' +
'throw new Error("missing function root() parser");' +
'};' +
'return [ root, rewrite ];' +
'}';
fun = eval('(' + funs + ')');
var rw = fun(p); // pass the parser, could be useful
p.root = rw[0];
p.rewrite = rw[1];
return p;};
Jaabro.makeParser = Jaabro.make;
Jaabro.makeInput = function(string, opts) {
var i = Object.create(Jaabro.Input);
i.string = string;
i.offset = 0;
i.options = opts || {};
return i;};
Jaabro.makeTree = function(name, input, parter, parser) {
var r = Object.create(Jaabro.Tree);
r.name = name;
r.result = 0;
r.input = input;
r.offset = input.offset;
r.length = 0;
r.parter = parter;
r.parser = parser;
r.children = [];
return r;};
Jaabro.parse = function(string, opts) {
opts = opts || {};
d = parseInt(opts.debug, 10) || 0;
if (d > 0) opts.rewrite = false;
if (d > 1) opts.all = false;
if (d > 2) opts.prune = false;
if ( ! opts.hasOwnProperty('prune')) opts.prune = true;
var t = null;
if (opts.all === false) t = this.root(this.makeInput(string, opts));
else t = Jaabro.all(null, this.makeInput(string, opts), this.root);
if (opts.prune !== false && t.result !== 1) return null;
if (t.parter === 'all') t = t.children[0];
if (opts.rewrite !== false) return this.rewrite(t);
return t;};
/* compacted from commit 2fdf568 on Tue Apr 27 08:58:17 JST 2021 */
