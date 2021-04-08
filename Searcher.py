import sys
import mmap
import os
import operator
import time
import pymongo
import multiprocessing as mp
from celery import Celery

mongodb = pymongo.MongoClient("mongodb://localhost:27017/")
mdb = mongodb["invertedIndexes"]

class Searcher:

	fileName = "data.tsv"
	#prepare words for matching
	def processWords(self,w):

		return  [w for w in w.split(" ") 
				if w != ' '
				and w !='and'
				and w !='if' 
				and w !='in' 
				and w !='to' 
				and w !='of' 
				and w !='the' 
				and w !='a'  
				and w !='&' 
				and w !='('
				and w !=')'  
				and w !='...']


	# this method interetes through the data source and finds indexes of maching keywords
	def findKeywordIndexes(self,query):
		mathcesDict = {}
		with open(self.fileName,"rb") as f:
				map_file = mmap.mmap(f.fileno(), 0, access=mmap.ACCESS_READ)
				i=0
				queryToArray =  self.processWords(query)

				for  line in iter(map_file.readline, b""):
					
					res = [kw for kw in queryToArray if(kw.lower() in line.decode("utf-8").split("\t")[2].lower())]
				
					if len(res)>0:
						mathcesDict[i] = []
						mathcesDict[i].append(line.decode("utf-8").split("\t")[2].lower())
						mathcesDict[i].append(line.decode("utf-8").split("\t")[2])
						
				
					i += 1
				map_file.close()
	
		return mathcesDict

	def insertInvertedIndexes(self,query,data):
		coll = mdb["invertedIndexes"]
		q = { "keywords": query }
		findIndex = coll.find(q)
		if (findIndex.count()  == 0 ):

			docs = []
			for d in data:
				docs.append([d['id'],d['score']])
			insertData = {"keywords":query, "docs":docs}	
			insertToColl = coll.insert_one(insertData)	
			

	def getIndexesFromDb(self, query):
		coll = mdb["invertedIndexes"]
		q = { "keywords": query }
		findIndex = coll.find(q)
		return findIndex

	def search(self,query):
		queryToArray =  self.processWords(query)
		getDbData = self.getIndexesFromDb(query)
		mathcesDict = {}
		results = []
		
		if getDbData.count() > 0:
			with open(self.fileName,encoding="utf8") as f:
				lines=f.readlines()
				for line in getDbData:
					for index in line['docs']:
						mathcesDict[index[0]] = []
						mathcesDict[index[0]].append((lines[int(index[0])].split("\t")[2].lower()))
						mathcesDict[index[0]].append((lines[int(index[0])].split("\t")[2]))
		else:
			mathcesDict = self.findKeywordIndexes(query)
				

		#this iteration is uses for ranking results	by keyword score			
		for key, value in mathcesDict.items():
			matches = {} 
			for kw in queryToArray:
				if kw.lower() in self.processWords(value[0]):
					if ( key in matches ):

						 matches[key][0]['found_keyword'].append(kw)
						 matches[key][0]['score'] += 1

					else:
						matches[key] = []
						match = {'id':key,'title':value[1], 'found_keyword':[kw], 'not_found_keyword':[], 'score':1}
						matches[key].append(match)

				else:
					if key in matches:

						matches[key][0]['not_found_keyword'].append(kw)
					else:
						matches[key] = []
						match = {'id':key,'title':value[1], 'found_keyword':[], 'not_found_keyword':[kw], 'score':0}
						matches[key].append(match)
								

			if any(matches):
				results.append(matches[key][0])

		results.sort(key=operator.itemgetter('score'),reverse=True)
		self.insertInvertedIndexes(query, results)
		return results

