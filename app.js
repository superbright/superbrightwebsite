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
app.use(express.static('assets'));

// Authenticator
// app.use(function(req, res, next) {
//     var user = basicAuth(req);
//
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
  unirest.get(url + '/sb_tags?per_page=100')
  .type('json')
  .end(function (response) {
    var taglist = response.body;
    var urls = ['/sb_projects?filter[sb_tag]=','/sb_products?filter[sb_tag]=','/sb_lab?filter[sb_tag]=']

    var searchcalls = urls.map(function(urlpath) {
      return new Promise(function(resolve, reject) {
        return unirest.get(url + urlpath +tagslug)
                      .end(function(data){
                        resolve(data);
        });
      });
    });

    // Use Promise.all to wait for all requests to finish
    // and send the response to the client.
    Promise.all(searchcalls).then(function(result) {
      var content = result.map(function(searchresult) {
        return searchresult.body;
      });
      var merged = [].concat.apply([], content);
      console.log(merged.length);
      for(var i = 0; i < merged.length; i++) {
        //console.log(merged[i].project_type[0].name);
        merged[i].type  = merged[i].project_type[0].name;
          //merged[i].type = merged[i].project_type[first(merged[i].project_type)].name;
      }
      //res.send(merged);
      for(var k = 0; k < taglist.length; k++) {
          if(taglist[k].slug == tagslug) {
            //set currenttag
            currenttag = taglist[k];
          }
      }
      res.render('tags.html', {
                      bannercopy : currenttag.description,
                      projects : merged,
                      selectedtag: currenttag,
                      tags: taglist
                    });
    });
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
    projectslist = projectslist.concat(response.body[0].products);
    projectslist = projectslist.concat(response.body[0].labs);
    projectslist = projectslist.sort(function(a,b){
      return new Date(b.post_date) - new Date(a.post_date);
    });

    for(var i = 0; i < projectslist.length; i++) {
        var arr = Object.keys(projectslist[i].tags).map(function (key) { return projectslist[i].tags[key]; });
        projectslist[i].tags = arr;
        projectslist[i].type = projectslist[i].project_type[first(projectslist[i].project_type)].name;
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
      bannercopy : '',
    });
  });
});

app.get('/portfolio/:name', function(req, res) {

  unirest.get(url + '/sb_projects?filter[name]=' + req.params.name)
  .type('json')
  .end(function (response) {
    console.log(response.body[0]);
    res.render('portfoliodetail.html', {
      title : 'Superbright',
      bannercopy : '',
      project : response.body[0]
    });
  });
});

app.get('/products/:name', function(req, res) {

  unirest.get(url + '/sb_products?filter[name]=' + req.params.name)
  .type('json')
  .end(function (response) {
    //res.send(response.body[0]);
    res.render('productdetail.html', {
      title : 'Superbright',
      bannercopy : '',
      project : response.body[0]
    });
  });

});

app.get('/products', function(req, res) {
  // /sb_products
  unirest.get(url  + '/sb_products')
  .type('json')
  .end(function (response) {
    var projectslist = new Array();
    projectslist = projectslist.concat(response.body);
    res.render('products.html', {
      projects : projectslist,
      bannercopy : '',
    });
  });
});

app.get('/lab', function(req, res) {
  unirest.get(url +  '/sb_lab')
  .type('json')
  .end(function (response) {
    var projectslist = new Array();
    projectslist = projectslist.concat(response.body);

    res.render('lab.html', {
      projects : projectslist,
      bannercopy : '',
    });
  });

});

app.get('/lab/:name', function(req, res) {
    unirest.get(url + '/sb_lab?filter[name]=' + req.params.name)
    .type('json')
    .end(function (response) {
      var projectslist = new Array();
      projectslist = projectslist.concat(response.body[0].lab_entry);
      //sort lab response.body[0]
      projectslist = projectslist.sort(function(a,b){
        // Turn your strings into dates, and then subtract them
        // to get a value that is either negative, positive, or zero.
        return new Date(a.post_date) - new Date(b.post_date);
      });
      response.body[0].lab_entry = projectslist;
      //res.send(response.body[0]);
      res.render('labdetail.html', {
        title : 'Superbright',
        bannercopy : '',
        project : response.body[0]
      });
    });
});


app.get('/contact', function(req, res) {

  unirest.get(url + '/sb_contact')
  .type('json')
  .end(function (response) {
    console.log(response.body);
    //var projectdata = projectslist.concat(response.body);
    res.render('contact.html', {
      bannercopy : '',
      title : 'Superbright',
      data : response.body[0]
    });
  });

});
