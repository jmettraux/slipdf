
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

### images

Images are to be added first to the Slipdf library itself, for example:

```js
Slipdf.addDataUrl('darts', '/images/gecbl/darts.png');
Slipdf.addDataUrl('shield', '/images/shield.jpg');
Slipdf.addDataUrl('office', 'https://images.example.org/office.png');
```

Slipdf then fetches the images and turns them into dataURLs. Those URLs can then be referenced in the Slim document as in:

```slim
  p
    | This is our new office:
    img src=(dataUrls.office)
```

Although mimicking the img HTML tag, the slip img tag accepts the PdfMake attributes (width, height, fit, ...) see under "Images" in the [PdfMake documentation](http://pdfmake.org/#/gettingstarted).


### tables

Warning about tables and `colspan` and `rowspan`: pdfmake requires us to have the overridden `td` cells.

Bad (will fail badly):
```slim
  table
    tr
      td colspan=2 A
      td B
    tr
      td a
      td b
      td c
```

Good:
```slim
  table
    tr
      td colspan=2 A
      td (will get overriden)
      td B
    tr
      td a
      td b
      td c
```


## License

MIT, see [LICENSE.txt](LICENSE.txt)

