var nunjucks  = require('nunjucks');
var express   = require('express');
var bodyParser = require('body-parser')
var app       = express();

// parse application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({ extended: false }))

// parse application/json
app.use(bodyParser.json())
app.listen( process.env.PORT || 3000);

// app.use(function (req, res) {
//   res.setHeader('Content-Type', 'text/plain')
//   res.write('you posted:\n')
//   res.end(JSON.stringify(req.body, null, 2))
// })


var data = require('./data')

//parse tags and attach them to projects
//this is just to make things easier for now,
//in the future it can be moved a db
for(var i =0; i < data.projects.length; i++) {
  
  var tagids = data.projects[i].tagids;
  var tags = [];
  tagids.forEach(function(tagid) {
     var tag = data.getTagfromID(tagid);
     tags.push(tag);
  });
   data.projects[i].tags = tags;
}



app.use(express.static('assets'));

nunjucks.configure(['/pages','pages'], {
  autoescape: true,
  express   : app
});


app.get('/tags/:tag', function(req, res) {
  var tag = data.getTagfromTagname(req.params.tag);
  res.render('tags.html', {
    bannercopy : tag.description,
    projects : data.getProjectfromTagID(tag.id),
    selectedtag: tag,
    tags: data.tags
  });
});

app.post('/tags', function(req, res) {

  var tag = data.getTagfromID(req.body.tag);
  
  res.send({
    bannercopy : tag.description,
    projects : data.getProjectfromTagID(tag.id),
    tag: tag
  });
});

app.get('/', function(req, res) {
  res.render('home.html', {
    bannercopy : 'Hello Superbright',
    title : 'Superbright'
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