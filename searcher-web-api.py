import flask
from flask import request
from flask import jsonify
from flask_cors import CORS, cross_origin
import time
from Searcher import Searcher

app = flask.Flask(__name__)
app.config["DEBUG"] = True
cors = CORS(app)
app.config['CORS_HEADERS'] = 'Content-Type'

Searcher = Searcher()


@app.route('/', methods=['GET'])
def home():
    return "navigate to searh?query=[query]"

@app.route('/search', methods=['GET'])
@cross_origin()
def search():
	if ( "query" in  request.args):
		
		start_time = time.time()
		searchResults = {}
		searchResults['data'] = Searcher.search(request.args['query'])
		searchResults['execution_time'] = (time.time() - start_time)
		return jsonify(searchResults)
	else:
	    return jsonify([{'Error':"No Query Parameters Provided"}])	

app.run()