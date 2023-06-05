const http = require('http');
const express = require('express');
const bodyParser = require('body-parser');
const fs = require('fs');
const { URL, URLSearchParams } = require('url');

const app = express();
const port = 3000;

app.set('view engine', 'ejs');
app.use(express.static('public'));
app.use(bodyParser.urlencoded({ extended: true }));

app.get('/', (req, res) => {
  res.render('index');
});

app.post('/sendRequest', (req, res) => {
  let url = req.body.url.trim();
  const headers = {};

  const headerString = req.body.headers;
  const headerPairs = headerString.split(',');

  for (const pair of headerPairs) {
    const [key, value] = pair.split(':');
    if (key && value) {
      headers[key.trim()] = value.trim();
    }
  }

  const numRequests = parseInt(req.body.numRequests);
  const method = req.body.method.toUpperCase();

  if (!/^(?:f|ht)tps?:\/\//.test(url)) {
    url = `http://${url}`;
  }

  const urlObj = new URL(url);
  const fullUrl = urlObj.href;

  // Optional fields
  const path = req.body.path.trim();
  if (path) {
    urlObj.pathname = path;
  }

  const params = req.body.params.trim();
  if (params) {
    const searchParams = new URLSearchParams(params);
    urlObj.search = searchParams.toString();
  }

  const options = {
    method: method,
    headers: headers,
  };

  // Send the HTTP request
  for (let i = 0; i < numRequests; i++) {
    const request = http.request(urlObj, options, (response) => {
      console.log(`Request ${i + 1} sent with status code: ${response.statusCode}`);
    });

    request.on('error', (error) => {
      console.error(`Error sending request: ${error.message}`);
    });

    request.end();
  }

  console.log('-------------------------');
  console.log('Request Details:');
  console.log('-------------------------');
  console.log('URL:', urlObj.href);
  console.log('Method:', method);
  console.log('Headers:', headers);
  console.log('Number of Requests:', numRequests);
  console.log('-------------------------');

  res.redirect('/');
});

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
