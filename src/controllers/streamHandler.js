let ffmpeg = require('fluent-ffmpeg');
let fs = require('fs');
let path = require('path');
const _rtmpConfig = require('../../config/rtmp.json');
const _ffmpegConfig = require('../../config/ffmpeg.json');
var _db = require('../controllers/quarkHandler');
const _rtmpHostUrl = `rtmp://${_rtmpConfig.host}:${_rtmpConfig.port}/${_rtmpConfig.path}`;
const shortid = require('shortid');
var stream = {};
var streamPayload = {};
var _adcontrol = { status: false, _adUrl: null };
var timeInterval = 5000;
const chalk = require('chalk');
var config = [];
var streamId = null;
var timestamp = null;
const removeDir = function (path) {
  if (fs.existsSync(path)) {
    const files = fs.readdirSync(path);

    if (files.length > 0) {
      files.forEach(function (filename) {
        if (fs.statSync(path + '/' + filename).isDirectory()) {
          removeDir(path + '/' + filename);
        } else {
          fs.unlinkSync(path + '/' + filename);
        }
      });
      fs.rmdirSync(path);
    } else {
      fs.rmdirSync(path);
    }
  } else {
    console.log('Directory path not found.');
  }
};
const _buildCopy = () => {
  try {
    if (config) {
      config = [];
      config.push(_ffmpegConfig._video.copy);
      config.push('-tune zerolatency');
      config.push('-movflags +faststart');
      config.push(_ffmpegConfig._audio.copy);
      config.push(_ffmpegConfig._strict);
      config.push(_ffmpegConfig._hls._crf);
      config.push(_ffmpegConfig._hls._presets.ultrafast);
      config.push(_ffmpegConfig._hls._hls_time['10']);
      config.push(_ffmpegConfig._hls._hls_wrap['10']);
      config.push(_ffmpegConfig._hls._start_time['1']);
    }
  } catch (err) {
    console.log(chalk.red(`[ERR :Copy] ${err}`));
  }
};
stream._createStream = async (req, res) => {
  streamId = shortid.generate();
  _db
    .push({
      id: streamId,
      exec: null,
      status: false,
      created: new Date().getTime(),
      startTime: null,
      endTime: null
    })
    .then(data => {
      res.json(data);
    });
};
stream._startStream = async (req, res) => {
  if (req.body.copy) {
    streamId = req.body.streamId;
    console.log(
      chalk.blue(
        `[INFO] Stream With Key: ${streamId} Requested In Copy Mode And Id ${streamId}`
      )
    );
    await _buildCopy();
    await fs.mkdirSync(path.join(__dirname + `../../../streams/${streamId}`));
    console.group(
      chalk.blue(`[INFO] FFmpeg Stream Parser Started Wit Config ${config} At `)
    );
    let _ffmpegProcess = ffmpeg(`${_rtmpHostUrl}/${req.body.streamId}`, {
      timeout: 432000
    })
      .addOptions(config)
      .output(path.join(__dirname + `../../../streams/${streamId}/output.M3U8`))
      .on('start', metadat => {
        _db
          .push({
            id: streamId,
            exec: JSON.stringify(metadat),
            status: true,
            startTime: new Date().getTime(),
            endTime: null
          })
          .then(data => {
            res.send(data);
          });
      })
      .on('progress', progress => {
        timestamp = progress.timemark;
      })
      .on('error', function (err, stdout, stderr) {
        console.log(err);
        console.log(chalk.red('[ERROR] ffmpeg stdout:\n' + stdout));
        console.log(chalk.red('[ERROR] ffmpeg stderr:\n' + stderr));
      })
      .on('exit', exit => {
        console.log(chalk.yellow(`[WARNING] Process Exited data: ${exit}`));
      })
      .on('end', async function (err, stdout, stderr) {
        if (stderr) {
          console.log(stderr);
        }
        await removeDir(path.join(__dirname + `../../../streams/${streamId}`));
        await _db.find(streamId).then(data => {
          _db.push({
            id: streamId,
            exec: data.exec,
            status: false,
            startTime: data.startTime,
            endTime: new Date().getTime()
          });
        });
        console.log(
          chalk.green(
            `[INFO] Strean ${streamId} Has Ended With Following Errors:!  ${err},${stderr}`
          )
        );
      })
      .run();
    console.log(_ffmpegProcess);
  } else {
    res.end('invalid dataset found');
  }
};
stream._testStreamRoute = async (req, res) => {
  res.send('hello From Stream Server @ Leauge Of Crusaders Ⓒ 2020-2021');
};
stream._stopStream = async (req, res) => {
  if (req.params._id == streamId) {
    console.log(_ffmpegProcess);
    await _ffmpegProcess.kill('SIGINT');
    await removeDir(
      path.join(__dirname + `../../../streams/${req.params._id}`)
    );

    res.send('Successfully Stopped The Stream');
  }
};
stream._getStreamKey = (req, res, next) => {
  res.json({ streamKey: streamId });
};
stream._registerUser = (req, res) => {
  console.log(req.body);
  res.send('hello');
};
stream._getStreamPayload = (req, res) => {
  console.log(streamPayload[req.params._id]);
  res.send(
    JSON.stringify({
      streamPayload: streamPayload[req.params._id],
      _ad: { ..._adcontrol },
      timeInterval
    })
  );
};
module.exports = {
  stream,
  streamId
};
