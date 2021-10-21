const { _testRTMP } = require('../controllers/index');
let express = require('express');
let admin = new express.Router();
let rtmpControllerAdmin = new express.Router();

admin.get('/test_stream/:key', _testRTMP);
rtmpControllerAdmin.use('/rtmp', admin);
module.exports = {
  rtmpControllerAdmin
};
