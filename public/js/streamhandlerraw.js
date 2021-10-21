var video = document.getElementById(`stream-${_streamId}`);
const server = axios.create({
  baseURL: `http://${window.location.host}/api/client`
});
var playloadListner = null;
const timeInterval = 60000;
var defaultTimeFactor = 2;
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
  if (Hls.isSupported()) {
    hls.loadSource(
      `http://${window.location.host}/live/${_streamId}/output.M3U8`
    );
    hls.attachMedia(video);
    hls.on(Hls.Events.MANIFEST_PARSED, function () {
      video.play();
    });
  } else if (video.canPlayType('application/vnd.apple.mpegurl')) {
    video.src = `http://${window.location.host}/live/${_streamId}/output.M3U8`;

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
  video.removeAttribute('controls');
  source.setAttribute(
    'src',
    `http://${window.location.host}/static/techissue.mov`
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
        video.removeAttribute('controls');
        source.setAttribute(
          'src',
          `http://${window.location.host}/static/notFound.mov`
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

//ad listner
