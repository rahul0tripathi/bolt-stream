const {
  _startStream,
  _testStreamRoute,
  _stopStream,
  _getStreamKey,
  _createStream,
  _registerUser,
  _getStreamPayload
} = require('../controllers');
let express = require('express');
let admin = new express.Router();
let client = new express.Router();
let streamControllerAdmin = new express.Router();
let streamControllerClient = new express.Router();
admin.post('/start_stream', _startStream);
admin.get('/:_id/stop_stream', _stopStream);
admin.post('/create_stream', _createStream);
admin.get('/test_stream_server', _testStreamRoute);
client.get('/test_stream_server', _testStreamRoute);
client.get('/:_id/payload', _getStreamPayload);
client.get('/streamKey', _getStreamKey);
client.post('/register/:_id', _registerUser);
streamControllerAdmin.use('/stream', admin);
streamControllerClient.use('/stream', client);
module.exports = {
  streamControllerAdmin,
  streamControllerClient
};
