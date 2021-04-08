import optparse
import time
from Searcher import Searcher

parser = optparse.OptionParser()

parser.add_option('-q', '--query',
    action="store", dest="query",
    help="query string")

options, args = parser.parse_args()

start_time = time.time()

if not options.query:

	print("Please add an input query parameter")
	exit()

else:	
	Searcher = Searcher()
	searchResults = Searcher.search(options.query)
	for result in searchResults:
	 	print("Book ID: " + str(result['id']), "Title: "+result['title'], "Score: " + str(result['score']))


print("--- %s seconds ---" % (time.time() - start_time))