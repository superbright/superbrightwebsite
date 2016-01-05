var nunjucks  = require('nunjucks');
var express   = require('express');
var app       = express();

app.listen(3000);


var data = require('./data')

app.use(express.static('assets'));

nunjucks.configure(['/pages','pages'], {
  autoescape: true,
  express   : app
});

 

app.get('/', function(req, res) {
  res.render('home.html', {
    bannercopy : 'Hello Superbright',
    title : 'Superbright',
    items : [
      { name : 'item #1' },
      { name : 'item #2' },
      { name : 'item #3' },
      { name : 'item #4' },
    ]
  });
});

app.get('/portfolio', function(req, res) {
  res.render('portfolio.html', {
    projects : data.projects,
    bannercopy : 'Hello Portfolio',
  });
});

app.get('/portfolio/:id', function(req, res) {
  res.render('portfoliodetail.html', {
    title : 'Superbright',
    bannercopy : 'Hello Project',
    items : [
      { name : 'item #1' },
      { name : 'item #2' },
      { name : 'item #3' },
      { name : 'item #4' },
    ]
  });
});

app.get('/lab', function(req, res) {
  res.render('lab.html', {
    bannercopy : 'Hello Lab',
    title : 'Superbright',
    items : [
      { name : 'item #1' },
      { name : 'item #2' },
      { name : 'item #3' },
      { name : 'item #4' },
    ]
  });
});


app.get('/contact', function(req, res) {
  res.render('contact.html', {
    bannercopy : 'Hello Contact',
    title : 'Superbright',
    items : [
      { name : 'item #1' },
      { name : 'item #2' },
      { name : 'item #3' },
      { name : 'item #4' },
    ]
  });
});