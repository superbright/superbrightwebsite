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


 var bannercopyhome = "Superbright is a creative technology studio that makes AR, VR, and Physical Computing experiences thought-provoking as they are practical. Our studio in Bushwick also provides an interdisciplinary hacker-space in which artists and developers combine product development, commissioned client work, and ongoing residencies to form a holistic perspective on these nascent tools and their future application. Thus, our brand work leverages the sophistication of the artistic dialog, telling industry stories not only through a new experiential dimension but also through a critical social lens.";
 var bannercopyint = "These are things we’ve built to satisfy our own curiosity.";
 var bannercopyext = "These are things we’ve built with brands.";
 var bannercopynoc = "These are quick projects we’ve done in the name of experimentation: focus groups, quick hacks, prototypes, and research that’s of value to the community."

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

    var meta = {};
    meta.title = response.body[0].meta_title;
    meta.description = response.body[0].meta_description;
    if(response.body[0].meta_image != null) {
      meta.image = response.body[0].meta_image.guid;
    }
    meta.url = req.protocol + '://' + req.get('host') + req.originalUrl;

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
      bannercopy : response.body[0].content.rendered,
      title : 'Superbright',
      projects: projectslist,
      meta : meta
    });
  });
});

app.get('/external', function(req, res) {
  unirest.get(url  + '/sb_projects')
  .type('json')
  .end(function (response) {
    var projectslist = new Array();
    projectslist = projectslist.concat(response.body);
    res.render('portfolio.html', {
      projects : projectslist,
      bannercopy : response.body[0].content.rendered,
    });
  });
});

app.get('/external/:name', function(req, res) {

  unirest.get(url + '/sb_projects?filter[name]=' + req.params.name)
  .type('json')
  .end(function (response) {
    var meta = {};
    meta.title = response.body[0].title.rendered;
    meta.description = response.body[0].short_description;
    meta.url = req.protocol + '://' + req.get('host') + req.originalUrl;
    meta.image1 = response.body[0].images[0].guid;
    meta.image2 = response.body[0].images[1].guid;

    res.render('portfoliodetail.html', {
      title : 'Superbright',
      bannercopy : "",
      project : response.body[0],
      meta:meta
    });
  });
});

app.get('/internal/:name', function(req, res) {

  unirest.get(url + '/sb_products?filter[name]=' + req.params.name)
  .type('json')
  .end(function (response) {
    var meta = {};
    meta.title = response.body[0].title.rendered;
    meta.description = response.body[0].short_description;
    meta.image1 = response.body[0].images[0].guid;
    meta.image2 = response.body[0].images[1].guid;
    meta.url = req.protocol + '://' + req.get('host') + req.originalUrl;

    res.render('productdetail.html', {
      title : 'Superbright',
      bannercopy : '',
      project : response.body[0],
      meta:meta
    });
  });
});

app.get('/internal', function(req, res) {
  // /sb_products
  unirest.get(url  + '/sb_products')
  .type('json')
  .end(function (response) {
    var projectslist = new Array();
    projectslist = projectslist.concat(response.body);
    res.render('products.html', {
      projects : projectslist,
      bannercopy : response.body[0].content.rendered
    });
  });
});

app.get('/nocturnal', function(req, res) {
  unirest.get(url +  '/sb_lab')
  .type('json')
  .end(function (response) {
    var projectslist = new Array();
    projectslist = projectslist.concat(response.body);

    res.render('lab.html', {
      projects : projectslist,
      bannercopy : response.body[0].content.rendered
    });
  });
});

app.get('/nocturnal/:name', function(req, res) {
    unirest.get(url + '/sb_lab?filter[name]=' + req.params.name)
    .type('json')
    .end(function (response) {

      var meta = {};
      meta.title = response.body[0].title.rendered;
      meta.description = response.body[0].short_description;
      meta.image1 = response.body[0].images[0].guid;
      meta.image2 = response.body[0].images[1].guid;
      meta.url = req.protocol + '://' + req.get('host') + req.originalUrl;

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
        project : response.body[0],
        meta: meta
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
