

let express = require('express')
let app = express()
let cors = require('cors')
let fs = require('fs')

let morgan = require('morgan')
let bodyParser = require('body-parser')
const chalk = require('chalk');
app.use(express.static('public'))
app.use(function(req, res, next) {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
  next();
});
app.use('/live',express.static('streams'))

app.use(morgan('tiny'))
app.use(bodyParser.json({ limit: '100mb' }));
app.use(bodyParser.urlencoded({
  limit: '100mb',
  extended: true
}));
var {InitDb} = require('./src/controllers/quarkHandler')
InitDb()
const { adminApi,clientApi} = require('./src/routes/index')
app.use('/api',adminApi,clientApi)
app.get('/api/live/:_id/',(req,res)=>{
console.log(chalk.magenta(`[GET] Stream requested By ${req.get('host')}`)) 
if(fs.existsSync(`./streams/${req.params._id}`)){}
else{req.params._id=null
  console.log(chalk.red(`[ERROR] Stream Not Found ${req.params._id} `))}
  //controls to be removed later on
res.write(`
<script src='https://ajax.googleapis.com/ajax/libs/jquery/2.1.1/jquery.min.js'></script>
<script src="https://cdn.jsdelivr.net/npm/hls.js@latest"></script>
<script src="https://unpkg.com/axios/dist/axios.min.js"></script>
<video id="stream-${req.params._id}" allowfullscreen  style="height:100%; width:100%;" class="responsive-video"  ></video>
<script>
const host = 'http://'+window.location.host+'/js/streamhandlerraw.js'
const _streamId = '${req.params._id}';
  var streamHandler = document.createElement('script');
  streamHandler.onload = function () {
    console.log('loaded _streamHandler')
};
streamHandler.src = host;
document.head.appendChild(streamHandler);
</script>
`)
    res.end();
})

 app.listen(3000,()=>{
     console.log(chalk.cyan('Server Running On Port 3000'))
 })
/*
::FFMPEG CONFIGS::
 '-c:v copy',
        '-c:a copy',
        '-c:v libx264',
    '-c:a aac',
    '-ac 1',
    '-strict -2',
    '-crf 18',
    '-profile:v baseline',
    '-maxrate 2500k',
    '-bufsize 3470k',
    '-pix_fmt yuv420p',
         '-strict -2',
        '-crf 18',
        '-preset ultrafast',
        '-hls_time 20',
        '-hls_wrap 4',
        '-start_number 1'
*/
