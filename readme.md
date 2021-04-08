# How to run


First build a docker image from root folder with 

```
docker-compose build
```

Mount and run backend and mongo container with

```
docker-compose ud -d
```

Open search-fron-end folder and from there we are going to build the docker container for the front end app

```
docker build -t search-front-end/react-app .
```


```
docker run -d -it  -p 80:80/tcp --name react-app search-front-end/react-app:latest
```

This is going to run the react app on port 80 and should be accessbile on http://localhost


Running app from console

```
python searcher-cli.py -q "once upon a time in america"
```

