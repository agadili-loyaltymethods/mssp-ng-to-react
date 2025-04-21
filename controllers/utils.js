const router = require('express').Router();
const axios = require('axios');
const config = require('./../config');
const Cognito = require('../modules/cognito');

router.get('/loyaltyid', (req, res, next) => {
    try {
        const { idtoken } = req.headers;
        let idTokenDetails = Cognito.getIdTokenDetails(idtoken);
        if (!idTokenDetails) {
            return next(new Error('Invalid id token'));
        }
        return res.send({ loyaltyId: idTokenDetails.payload['custom:loyaltyId'] });
    } catch (err) {
        console.error(err);
        return next(err);
    }
});

router.get('/partners', async (req, res, next) => {
    try {
        const url = `${config.REST_URL}/api/v1/partners?query=${req.query.query}`;
        console.log(`Getting ${url}`);
        const { data } = await axios({
            url,
            method: 'get'
        }).catch(err => {
            throw err.response.data;
        });
        return res.json(data);
    } catch (err) {
        return res.status(err.status || 500).json({ error: err.message });
    }
});

router.get('/enums', async (req, res, next) => {
    try {
        let url = `${config.REST_URL}/api/v1/enums?query=${req.query.query}`;
        if (req.query.skip || req.query.skip === 0) {
            url += '&skip=' + req.query.skip;
        }
        url += '&sort=label';
        console.log(`Getting ${url}`);
        const { data } = await axios({
            url,
            method: 'get'
        }).catch(err => {
            throw err.response.data;
        });
        return res.json(data);
    } catch (err) {
        return res.status(err.status || 500).json({ error: err.message });
    }
});

router.get('/enums/count', async (req, res, next) => {
    try {
        const url = `${config.REST_URL}/api/v1/enums/count?query=${req.query.query}`;
        console.log(`Getting ${url}`);
        const { data } = await axios({
            url,
            method: 'get'
        }).catch(err => {
            throw err.response.data;
        });
        return res.json(data);
    } catch (err) {
        return res.status(err.status || 500).json({ error: err.message });
    }
});

router.get('/locations', async (req, res, next) => {
    try {
        let url = `${config.REST_URL}/api/v1/locations`;
        if (req.query.sort || req.query.sort === 0) {
            url += '&sort=' + req.query.sort;
        }
        console.log(`Getting ${url}`);
        const { data } = await axios({
            url,
            method: 'get'
        }).catch(err => {
            throw err.response.data;
        });
        return res.json(data);
    } catch (err) {
        return res.status(err.status || 500).json({ error: err.message });
    }
});

router.get('/products', async (req, res, next) => {
    try {
        let url = `${config.REST_URL}/api/v1/products`;
        const query = {
            category: req.query.category,
            $or: [
                {
                    "ext.hideInMSSP": {
                        "$exists": false
                    }
                },
                {
                    "ext.hideInMSSP":
                        false
                }
            ]
        };
        if (req.query) {
            url += `?query=${JSON.stringify(query)}`;
        }
        
        console.log(`Getting ${url}`);
        const { data } = await axios({
            url,
            method: 'get'
        }).catch(err => {
            throw err.response.data;
        });
        return res.json(data);
    } catch (err) {
        return res.status(err.status || 500).json({ error: err.message });
    }
});

router.post('/activity', async (req, res, next) => {
    try {
        const defaultValues = {
            srcChannelType: 'Web',
            loyaltyID: req.loyaltyId
        }
        let url = `${config.REST_URL}/api/v1${req.url}`;
        if (req.body.length) {
            console.log(`Getting Multiple Activities ${url}`);
            const data = await Promise.all(req.body.map(payload => axios.post(`${url}`, {
                ...payload,
                ...defaultValues
            }).then(response => response.data)))
            return res.json(data);
        } else {
            console.log(`Getting ${url}`);
            const { data } = await axios({
                url,
                method: 'post',
                data: {
                    ...req.body,
                    ...defaultValues
                }
            });
            return res.json(data);
        }
    } catch (err) {
        return next(err);
    }
});

module.exports = router;