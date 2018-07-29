docker run --log-opt max-size=500m -d -it -p 7104:7104 --name=proxy_microservice proxy_microservice npm run prod -- --host=0.0.0.0
