let express = require('express');
let adminApi = new express.Router();
let clientApi = new express.Router();
const {
  streamControllerClient,
  streamControllerAdmin
} = require('./streamHandler');
const { rtmpControllerAdmin } = require('./rtmpHandler');
adminApi.use('/admin', streamControllerAdmin, rtmpControllerAdmin);
clientApi.use('/client', streamControllerClient);

module.exports = {
  adminApi,
  clientApi
};
