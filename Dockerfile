FROM python:3.9


COPY . /python-search

RUN make /python-search

WORKDIR /python-search


RUN pip3 install -r requirements.txt --ignore-installed


ENV FLASK_APP=searcher-web-api.py
ENV FLASK_DEBUG=1
CMD  ["flask", "run", "--host", "0.0.0.0", "--port", "5000"]



EXPOSE 5000
EXPOSE 3000