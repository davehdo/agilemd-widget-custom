# Introduction
This is a fork of AgileMD's widget. AgileMD is a programmatic, embeddable, web-based view for medical information.

I changed settings to display custom content by redirecting the data source to the local API rather than AgileMD's.

# Setup
Because AgileMD uses Browserify to manage js dependencies, we need to build package
into a single js file and a single css file, to be included in our final app.

1. `cd` into the project folder and run `npm install`. Then, execute:
2. To run, execute `npm run dev`
3. Edit API paths in `src/services/uris.js`
4. To compile, type `npm run build`. This generates `_build/app.js` and `_build/css/app.css`.

### Instantiation




Within the `<body>` of your document:

```html
    <div id="agilemd"></div>
    <script src="js/app.js"></script>
    <link rel="stylesheet" type="text/css" href="css/app.css">
	<script type="text/javascript" charset="utf-8">


	  // use in local development only; toggles asset location (local vs CDN)
	  agilemd.DEBUG = true;

	  // the public demo account; no referer or CDIR validation; throttled
	  agilemd.init({
	    // disableNavigation: true,
	    key: 'pk_test_2anGbkcDbLVnMxfZa3ghfmz61syheLFfnDYCQEDxUTaf3axr'
	  });

	  // agilemd.open('file', '518d6b4d8c0cc8a65f000001');

	  agilemd.on('all', function (eventName, eventData) {
	    console.log(eventName, eventData);
	  });
	</script>
```
