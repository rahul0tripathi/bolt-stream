const util = require('util');
const exec = util.promisify(require('child_process').exec);
const _rtmpConfig = require('../../config/rtmp.json');
const _rtmpHostUrl = `rtmp://${_rtmpConfig.host}:${_rtmpConfig.port}/${_rtmpConfig.path}`;
const shortid = require('shortid');
var _rtmp = {};
const chalk = require('chalk');

_rtmp._testRTMP = async (req, res) => {
  console.log(
    chalk.yellow(
      `[TEST] Testing Rtmp Stream With Key ${req.params.key} At ${_rtmpHostUrl}`
    )
  );
  var { stdout, stderr } = await exec(
    `ffprobe -v quiet -print_format json -show_streams ${_rtmpHostUrl}/${req.params.key}`
  );
  stdout = JSON.parse(stdout);
  if (stderr) {
    stderr = JSON.parse(stderr);
  }
  res.json({ stdout: stdout, stderr: stderr });
};
module.exports = {
  _rtmp
};
