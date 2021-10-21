var video = document.getElementById(`stream-${_streamId}`);
const server = axios.create({
  baseURL: `http://${window.location.hostname}:3000/api/client`
});

function uuidv4() {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
    var r = (Math.random() * 16) | 0,
      v = c == 'x' ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}

//INIT
function register() {
  server
    .post(
      `/stream/register/${_streamId}`,
      JSON.parse(localStorage.getItem('_udata'))
    )
    .then(data => {
      console.log(data);
    });
}
if (localStorage.getItem('_udata')) {
  var _udata = JSON.parse(localStorage.getItem('_udata'));
  axios.get('https://jsonip.com').then(res => {
    if (_udata._ip != res.data.ip) {
      localStorage.setItem(
        '_udata',
        JSON.stringify({
          _uid: _udata._uid,
          _streamId: _streamId,
          _session: new Date().getTime(),
          _ip: res.data.ip
        })
      );
    }
    register();
  });
} else {
  var _uid = uuidv4();
  axios.get('https://jsonip.com').then(res => {
    localStorage.setItem(
      '_udata',
      JSON.stringify({
        _uid: _uid,
        _streamId: _streamId,
        _session: new Date().getTime(),
        _ip: res.data.ip
      })
    );
    register();
  });
}

var playloadListner = null;
const timeInterval = 5000;
var defaultTimeFactor = 1;
let getMetadata = () => {
  server.get('/stream/t_stre_ser').then(res => {
    console.log(res.data);
  });
};
const initAd = async source => {
  let playback_id = '_' + Math.random().toString(36).substr(2, 9);
  var adPlayer = document.createElement('video');
  adPlayer.id = playback_id;
  adPlayer.src = source;
  adPlayer.type = 'video/mp4';
  adPlayer.control = true;
  $('body').append(adPlayer);
  $(`#${playback_id}`).css('height', '320px').css('width', '580px').hide();
  return playback_id;
};
var hls = new Hls();

function initHls() {
  // $(`#stream-${_streamId}`).css('height', '320px')
  //   .css('width', '580px')
  if (Hls.isSupported()) {
    hls.loadSource(
      `http://${window.location.hostname}:3000/live/${_streamId}/output.M3U8`
    );
    hls.attachMedia(video);
    hls.on(Hls.Events.MANIFEST_PARSED, function () {
      video.play();
    });
  } else if (video.canPlayType('application/vnd.apple.mpegurl')) {
    video.src = `http://${window.location.hostname}:3000/live/${_streamId}/output.M3U8`;

    video.addEventListener('loadedmetadata', function () {
      video.play();
    });
  }
}

function techIssue() {
  hls.destroy();
  var source = document.createElement('source');
  video.removeAttribute('src');
  video.setAttribute('loop', 'true');
  //video.removeAttribute("controls")
  source.setAttribute(
    'src',
    `http://${window.location.hostname}:3000/static/techissue.mov`
  );
  video.appendChild(source);
  video.play();
}
hls.on(Hls.Events.ERROR, (e, data) => {
  if (data.fatal) {
    switch (data.type) {
      case Hls.ErrorTypes.NETWORK_ERROR:
        hls.destroy();
        var source = document.createElement('source');
        video.removeAttribute('src');
        video.setAttribute('loop', 'true');
        //  video.removeAttribute("controls")
        source.setAttribute(
          'src',
          `http://${window.location.hostname}:3000/static/techissue.mov`
        );
        video.appendChild(source);
        video.play();
        break;
      default:
        console.log(data);
        techIssue();
        break;
    }
  }
});
initHls();
const payloadAd = data => {
  initAd(data).then(async playback_id => {
    console.log(playback_id);
    var ad = $('video').get(1);
    video.pause();
    $(`#stream-${_streamId}`).fadeOut(100, function () {
      $(`#${playback_id}`).fadeIn(100);
      ad.play();
      $(`#${playback_id}`).on('ended', function () {
        $(`#${playback_id}`).fadeOut(100);
        $(`#stream-${_streamId}`).fadeIn();
        video.play();
      });
    });
  });
};
//ad listner

function streamPlayloadFetcher() {
  server
    .get(`/stream/${_streamId}/payload`)
    .then(payload => {
      console.log(payload);
      if (payload.data._ad.status) {
        window.clearTimeout(playloadListner);
        payloadAd(payload.data._ad._adUrl);
        setTimeout(streamPlayloadFetcher, 4 * timeInterval);
      } else {
        playloadListner = setTimeout(
          streamPlayloadFetcher,
          defaultTimeFactor * payload.data.timeInterval
        );
      }
    })
    .catch(err => {
      console.log(err);
      clearTimeout(playloadListner);
      //server.post('')
    });
}
//playloadListner = setTimeout(streamPlayloadFetcher, defaultTimeFactor * timeInterval);
if (video.requestFullscreen) {
  video.requestFullscreen().catch(error => {
    console.log(error);
  });
} else if (video.mozRequestFullScreen) {
  video.mozRequestFullScreen();
} else if (video.webkitRequestFullscreen) {
  video.webkitRequestFullscreen();
} else if (video.msRequestFullscreen) {
  video.msRequestFullscreen();
}
