var fs = require('fs');
var path = require('path');
const _dbName = `quark.json`;
var _streams = {};
var _version = 0;
var dboperations = 0;
var dbfails = 0;
const _db = path.join(__dirname, `../../quark/${_dbName}`);
async function InitDb() {
  console.log('Initializing Quark DB');
  if (fs.existsSync(_db)) {
    console.log('Db Found');
    let data = JSON.parse(fs.readFileSync(_db));
    if (data) {
      _streams = data.streams;
    }
  } else {
    fs.writeFileSync(
      _db,
      JSON.stringify({ _updated: null, _version: 0, streams: _streams })
    );
  }
}
async function push(streamData) {
  if (streamData) {
    _streams[streamData.id] = streamData;
    _version++;
    fs.writeFile(
      _db,
      JSON.stringify({
        _updated: new Date().getTime(),
        _version: _version,
        streams: _streams
      }),
      (err, data) => {
        dboperations++;
        if (err) {
          dbfails++;
        }
      }
    );
    return {
      _updated: new Date().getTime(),
      _version: _version,
      data: streamData
    };
  }
}
async function find(key) {
  if (_streams[key]) {
    return _streams[key];
  } else {
    return null;
  }
}
module.exports = {
  InitDb,
  push,
  find
};
