var nunjucks  = require('nunjucks');
var express   = require('express');
var bodyParser = require('body-parser')
var app       = express();
var basicAuth = require('basic-auth');

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

for(var i =0; i < data.lab.length; i++) {
  
  var tagids = data.lab[i].tagids;
  var tags = [];
  tagids.forEach(function(tagid) {
     var tag = data.getTagfromID(tagid);
     tags.push(tag);
  });
   data.lab[i].tags = tags;
}

for(var i =0; i < data.products.length; i++) {
  
  var tagids = data.products[i].tagids;
  var tags = [];
  tagids.forEach(function(tagid) {
     var tag = data.getTagfromID(tagid);
     tags.push(tag);
  });
   data.products[i].tags = tags;
}



app.use(express.static('assets'));

// Authenticator
app.use(function(req, res, next) {
    var user = basicAuth(req);

    if (user === undefined || user['name'] !== 'superbright' || user['pass'] !== 'partytime') {
        res.statusCode = 401;
        res.setHeader('WWW-Authenticate', 'Basic realm="MyRealmName"');
        res.end('Unauthorized');
    } else {
        next();
    }
});

nunjucks.configure(['/pages','pages'], {
  autoescape: true,
  express   : app
});


app.get('/tags/:tag', function(req, res) {
  var tag = data.getTagfromTagname(req.params.tag);

  var projects = data.getProjectfromTagID(tag.id);
  var products = data.getProductfromTagID(tag.id);
  var labitems = data.getLabfromTagID(tag.id);
  
  res.render('tags.html', {
    bannercopy : tag.description,
    projects : projects.concat(labitems).concat(products),
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
  console.log(data.lab.concat(data.products).concat(data.projects));
  res.render('home.html', {
    bannercopy : 'Superbright is a studio for [play] which uses contemporary technology to produce unique products, engaging content, and powerful exchanges.',
    title : 'Superbright',
    projects: data.lab.concat(data.products).concat(data.projects)
  });
});

app.get('/portfolio', function(req, res) {
  res.render('portfolio.html', {
    projects : data.projects,
    bannercopy : 'Hello Portfolio',
  });
});

app.get('/portfolio/:id', function(req, res) {

  var foundproject = {};

  for(var i =0; i < data.projects.length; i++) {  
    if(data.projects[i].slug === req.params.id) {
        foundproject = data.projects[i];
        break;
    }
  }

  res.render('portfoliodetail.html', {
    title : 'Superbright',
    bannercopy : '',
    project : foundproject
  });
});

app.get('/products/:id', function(req, res) {

  var foundproduct = {};

  for(var i =0; i < data.products.length; i++) {  
    if(data.products[i].slug === req.params.id) {
        foundproduct = data.products[i];
        break;
    }
  }

  res.render('productdetail.html', {
    title : 'Superbright',
    bannercopy : '',
    project : foundproduct
  });
});

app.get('/products', function(req, res) {
  res.render('products.html', {
    projects : data.products,
    bannercopy : '',
  });
});

app.get('/lab', function(req, res) {
  res.render('lab.html', {
    bannercopy : 'Hello Lab',
    title : 'Superbright',
    projects : data.lab
  });
});

app.get('/lab/:id', function(req, res) {

  var foundproject = {};

  for(var i =0; i < data.lab.length; i++) {  
    if(data.lab[i].slug === req.params.id) {
        foundproject = data.lab[i];
        break;
    }
  }

  res.render('labdetail.html', {
    bannercopy : 'Hello Lab',
    title : 'Superbright',
    project : foundproject
  });
});


app.get('/contact', function(req, res) {
  res.render('contact.html', {
    bannercopy : 'say hi',
    title : 'Superbright',
    data : data.contact
  });
});