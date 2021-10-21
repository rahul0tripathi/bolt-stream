docker run -d -p 1935:1935 --name nginx-rtmp tiangolo/nginx-rtmp
docker build -t bolt-stream -f docker/server.dockerfile .
docker run -d -p 3000:3000 bolt-stream 