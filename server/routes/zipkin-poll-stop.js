const express = require('express');
const get_job = require('../zipkin_job/zipkin-poll-job').get_job;
const set_job = require('../zipkin_job/zipkin-poll-job').set_job;
const router = express.Router();


router.post('/', function(req, res, next) {
    let j = get_job();
    if (j !== undefined) {
        j.cancel();
        set_job(undefined);
    }
    return res.status(200).json({
        stopped: true
    });
});


module.exports = router;
