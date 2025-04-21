var Client = require('node-rest-client').Client;
var config = require('../config');
var log = require('log4js').getLogger();
var options = {
    mimetypes: {
        json: ["application/json", "application/json; charset=UTF-8", "application/json;charset=utf-8"]
    }
};
var api = new Client(options);
log.info('------CONFIG INFOs---------');
log.info('REST_URL', config.REST_URL);
log.info('PROXY_URL', config.PROXY_URL);
log.info('ENVIRONMENT', process.env.NODE_ENV || 'development');
log.info('---------------------------');
var API_URL = config.REST_URL + config.VERSION;

function get(req, res) {
    api.get(API_URL + req.url, {
        headers: {
            'Content-Type': 'application/json',
            Authorization: req.headers.authorization
        }
    }, function(data, response) {
        log.trace('Getting: ' + req.url + ' Status: ' + response.statusCode);
    });
}

function post(req, res) {
    api.post(API_URL + req.url, {
        data: req.body,
        headers: {
            'Content-Type': 'application/json',
            Authorization: req.headers.authorization
        }
    }, function(data, response) {
        res.status(response.statusCode).json(data);
        log.trace('Posting to : ' + req.url + ' Status: ' + response.statusCode + 'Data: ' + req.body);
    });
}

function logout(req, res) {
    api.get(API_URL + '/myaccount/logout', {
        headers: {
            'Content-Type': 'application/json',
            Authorization: req.headers.authorization
        }
    }, function(data, response) {
        log.trace('Logging out.' + ' Status: ' + response.statusCode);
        res.status(response.statusCode).json(data);
    });
}

function put(req, res) {
    api.put(API_URL + req.url, {
        data: req.body,
        headers: {
            'Content-Type': 'application/json',
            Authorization: req.headers.authorization
        }
    }, function(data, response) {
        res.status(response.statusCode).json(data);
        log.trace('Editing : ' + req.url + ' Status: ' + response.statusCode + 'Data: ' + req.body);
    });
}

function patch(req, res) {
    api.patch(API_URL + req.url, {
        data: req.body,
        headers: {
            'Content-Type': 'application/json',
            Authorization: req.headers.authorization
        }
    }, function(data, response) {
        res.status(response.statusCode).json(data);
        log.trace('Editing (patching) : ' + req.url + ' Status: ' + response.statusCode + 'Data: ' + req.body);
    });
}

function del(req, res) {
    api.delete(API_URL + req.url, {
        data: {},
        headers: {
            'Content-Type': 'application/json',
            Authorization: req.headers.authorization
        }
    }, function(data, response) {
        var result = data ? data : JSON.parse(true);
        res.status(response.statusCode).json(result);
        log.trace('Editing : ' + req.url + ' Status: ' + response.statusCode);
    });
}
var router = require('express').Router();
router.route('/logout').get(logout);
router.route(/\/(.*?)/).get(get).post(post).put(put).patch(patch).delete(del);
module.exports = router;