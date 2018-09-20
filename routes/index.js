"use strict";
require('dotenv').config();

const express       = require('express');
const router        = express.Router();
const rp            = require('request-promise');
const cookieSession = require("cookie-session");

var favorites  = [];
var database   = [];
var lastSearch = 'shopify';

router.use(cookieSession({
  name: 'session',
  secret: "mylittlesecret",
  maxAge: 24
}));

var githubApi = {
  url: 'https://api.github.com/search/repositories',
  qs: {
    q: 'shopify',
    per_page: 10
  },
  headers: {
    'User-Agent': `${process.env.API_UserName}`,
    'Authorization': `token ${process.env.API_Key}`
  },
  json: true
};

var githubTagApi = {
  url: 'https://api.github.com/search/repositories',
  headers: {
    'User-Agent': `${process.env.API_UserName}`,
    'Authorization': `token ${process.env.API_Key}`
  },
  json: true
};

module.exports = () => {

  router.get("/", (req, res) => {
    let count = 1;
    database = [];
    rp(githubApi) // get repo from user
    .then(function (repos) {
      for(let value of repos.items) {
        githubTagApi.url = value.tags_url;
        rp(githubTagApi) // get verstion tag from project
        .then(function (data) {
          let version = (data.map(a => a.name)[0] === undefined) ? '-' : data.map(a => a.name)[0];
          database.push({
            id:value.id,
            full_name:value.full_name,
            language:value.language,
            tags:version,
            html_url:value.html_url
          })
          if(count === githubApi.qs.per_page) {
            const templateVars = {
              database: database,
              favorites: favorites
            };
            res.render("index",templateVars);
          } else {
            count++;
          }
        });
      }
    })
  });

  router.post("/", (req, res) => {
    githubApi.qs.q = (req.body.search.length !== 0) ? req.body.search : lastSearch;
    res.redirect("/");
  });

  router.post("/add", (req, res) => {
    if(!favorites[favorites.findIndex(x => x.id == req.body.id)]) {
      for (let i in database) {
        if(database[i].id === parseInt(req.body.id)) {
          favorites.push({
            id:database[i].id,
            full_name:database[i].full_name,
            language:database[i].language,
            tags:database[i].tags,
            html_url:database[i].html_url
          })
        }
      }
    }
    const templateVars = {
      database: database,
      favorites: favorites
    };
    res.render("index",templateVars);
  });

  router.post("/remove", (req, res) => {
    favorites.splice(favorites.findIndex(x => x.id == req.body.id),1);
    const templateVars = {
      database: database,
      favorites: favorites
    };
    res.render("index",templateVars);
  });

  return router;
}