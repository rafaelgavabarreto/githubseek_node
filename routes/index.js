"use strict";

const express = require('express');
const router  = express.Router();
const rp = require('request-promise');

var lcboApi = {
  uri: "https://lcboapi.com/products",
  qs: {
    access_key: process.env.API_Key,
    primary_category:"beer"
  },
  headers: {
      'User-Agent': 'Request-Promise'
  },
  json: true // Automatically parses the JSON string in the response
};

module.exports = (knex) => {

  router.get("/", (req, res) => {
    if (req.session.current_page > 0) {
      lcboApi.uri = 'https://lcboapi.com/products?page='+req.session.current_page;
    }
    rp(lcboApi)
    .then(function (repos) {
      const templateVars = {
        username: req.session.username,
        current_page: repos.pager.current_page,
        first_page: repos.pager.is_first_page,
        final_page: repos.pager.is_final_page,
        database: repos.result
      };
      req.session.current_page = repos.pager.current_page;
      // console.log(repos);
      res.render("index",templateVars);
    });
  });

  router.post("/:page", (req,res) => {
    console.log(req.params);
    lcboApi.uri = 'https://lcboapi.com/products?page='+req.params.page;
    req.session.current_page = req.params.page;
    res.redirect("/");
  });

  return router;
}