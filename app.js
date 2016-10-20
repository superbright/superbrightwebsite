var nunjucks  = require('nunjucks');
var express   = require('express');
var bodyParser = require('body-parser')
var app       = express();
var basicAuth = require('basic-auth');
var unirest = require('unirest');

var url = "http://162.243.67.91/wp-json/wp/v2";

// parse application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({ extended: false }))

// parse application/json
app.use(bodyParser.json())
app.listen( process.env.PORT || 3000);


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
// app.use(function(req, res, next) {
//     var user = basicAuth(req);

//     if (user === undefined || user['name'] !== 'superbright' || user['pass'] !== 'partytime') {
//         res.statusCode = 401;
//         res.setHeader('WWW-Authenticate', 'Basic realm="MyRealmName"');
//         res.end('Unauthorized');
//     } else {
//         next();
//     }
// });

nunjucks.configure(['/pages','pages'], {
  autoescape: true,
  express   : app
});

function getSortFunction(fieldName) {
    return function(post1, post2) {
        return post1[fieldName] > post2[fieldName];
    }
}

app.get('/test', function(req, res) {
    unirest.get(url + '/sb_home')
    .type('json')
    .end(function (response) {
      var home_array = new Array();
      home_array = home_array.concat(response.body[0]["projects"]);
      home_array = home_array.concat(response.body[0]["labs"]);
      home_array = home_array.sort(getSortFunction("post_modified"));
      res.send(home_array);
    });
});

app.get('/tags/:tag', function(req, res) {


  var tagslug = req.params.tag;
  var currenttag;
  var results = new Array();
  unirest.get(url + '/sb_tags')
  .type('json')
  .end(function (response) {
    var taglist = response.body;
      for(var k = 0; k < taglist.length; k++) {
          if(taglist[k].slug == tagslug) {
            //set currenttag
            currenttag = taglist[k];
            var urlstosearch = taglist[k]._links["wp:post_type"];
            unirest.get(urlstosearch[0].href)
            .type('json')
            .end(function (response) {
                results = results.concat(response.body);
                //call again
                unirest.get(urlstosearch[1].href)
                .type('json')
                .end(function (response) {
                    results = results.concat(response.body);
                  //  res.send(taglist);
                    res.render('tags.html', {
                      bannercopy : currenttag.description,
                      projects : results,
                      selectedtag: currenttag,
                      tags: taglist
                    });
                });
            });
          }
      }
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
  function first(obj) {
    for (var a in obj) return a;
  }

  unirest.get(url + '/sb_home')
  .type('json')
  .end(function (response) {

    var projectslist = new Array();
    projectslist = projectslist.concat(response.body[0].projects);
    console.log(projectslist[1].project_type[first(projectslist[1].project_type)].name);
    for(var i = 0; i < projectslist.length; i++) {
        var arr = Object.keys(projectslist[i].tags).map(function (key) { return projectslist[i].tags[key]; });
        projectslist[i].tags = arr;
        projectslist[i].type = projectslist[1].project_type[first(projectslist[1].project_type)].name;
    }

    res.render('home.html', {
      bannercopy : 'Superbright is a studio for play which uses contemporary technology to produce unique products, engaging content, and powerful exchanges.',
      title : 'Superbright',
      projects: projectslist
    });
  });
});

app.get('/portfolio', function(req, res) {
  unirest.get(url  + '/sb_projects')
  .type('json')
  .end(function (response) {
    var projectslist = new Array();
    projectslist = projectslist.concat(response.body);
    res.render('portfolio.html', {
      projects : projectslist,
      bannercopy : 'Hello Portfolio',
    });
  });
});

app.get('/portfolio/:name', function(req, res) {

  console.log("id is " + req.params.id);

  unirest.get(url + '/sb_projects?filter[name]=' + req.params.name)
  .type('json')
  .end(function (response) {
    console.log(response.body[0]);
    //var projectdata = projectslist.concat(response.body);
    res.render('portfoliodetail.html', {
      title : 'Superbright',
      bannercopy : '',
      project : response.body[0]
    });
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

  // unirest.get('http://me.superbright:8888//wp-json/wp/v2/sb_projects')
  // .type('json')
  // .end(function (response) {
  //   var projectslist = new Array();
  //   projectslist = projectslist.concat(response.body[0]);
  //   res.render('portfolio.html', {
  //     projects : projectslist,
  //     bannercopy : 'Hello Portfolio',
  //   });
  // });

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

  unirest.get(url + '/sb_contact')
  .type('json')
  .end(function (response) {
    console.log(response.body);
    //var projectdata = projectslist.concat(response.body);
    res.render('contact.html', {
      bannercopy : 'say hi',
      title : 'Superbright',
      data : response.body[0]
    });
  });

});
