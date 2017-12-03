
# slipdf

A [Slim](http://slim-lang.com/) inspired templating system on top of [pdfmake](http://pdfmake.org/#/).

## An example

```slim
// example.slim

document pageSize='A4'

  header
  footer

  content
    p This is template #{template}
    - users.forEach(function(user) {
      p.name= user.name
      - [ 'alpha', 'bravo' ].forEach(function(k) {
        p.key= k
```

```html
<script src="/scripts/pdfmake-0.1.34.min.js" async="true"></script>
<script src="slip-1.0.0.pdf"></script>
```

```js
// preparation work, grab the example.slim via the Fetch API

var exampleSlim = null;

fetch('/slips/example.slim')
  .then(function(res) { return res.text() })
  .then(function(txt) { exampleSlim = txt; });

// ...

// later on, generation time

var exampleTemplate =
  Slipdf.compile(exampleSlim);
var exampleDocument =
  exampleTemplate({ users: [
    { name: 'Alice' },
    { name: 'Bob' } ] });

var examplePdf = pdfMake.createPdf(exampleDocument);

examplePdf.open();
  // open the PDF immediately, in the browser
//examplePdf.getBuffer(function(exampleBuffer) { /* ... */ });
  // grab the buffer and deal with it ...
```


## License

MIT, see [LICENSE.txt](LICENSE.txt)

