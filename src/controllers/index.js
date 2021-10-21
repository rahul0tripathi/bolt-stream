const { stream } = require('./streamHandler');
const { _rtmp } = require('./rtmpHandler');
module.exports = {
  ...stream,
  ..._rtmp
};
