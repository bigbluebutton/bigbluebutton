package org.bigbluebutton.webminer.search;

/**
 * Licensed to the Apache Software Foundation (ASF) under one or more
 * contributor license agreements.  See the NOTICE file distributed with
 * this work for additional information regarding copyright ownership.
 * The ASF licenses this file to You under the Apache License, Version 2.0
 * (the "License"); you may not use this file except in compliance with
 * the License.  You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

import java.io.IOException;

import org.apache.log4j.Logger;
import org.apache.lucene.analysis.Analyzer;
import org.apache.lucene.analysis.standard.StandardAnalyzer;
import org.apache.lucene.document.Document;
import org.apache.lucene.index.FilterIndexReader;
import org.apache.lucene.index.IndexReader;
import org.apache.lucene.queryParser.ParseException;
import org.apache.lucene.queryParser.QueryParser;
import org.apache.lucene.queryParser.QueryParser.Operator;
import org.apache.lucene.search.IndexSearcher;
import org.apache.lucene.search.Query;
import org.apache.lucene.search.Searcher;
import org.apache.lucene.search.Sort;
import org.apache.lucene.search.TopDocCollector;
import org.apache.lucene.search.TopFieldDocCollector;
import org.apache.lucene.search.TopFieldDocs;
import org.apache.lucene.store.FSDirectory;

import org.bigbluebutton.webminer.config.ConfigHandler;

/** Simple command-line based search demo. */
public class Search {

	private static Search instance;
	private IndexReader reader = null;
	private Searcher searcher;
	private Analyzer analyzer;

	private static Logger logger = Logger.getLogger(Search.class);

	/**
	 * Use the norms from one field for all fields. Norms are read into memory,
	 * using a byte of memory per document per searched field. This can cause
	 * search of large collections with a large number of fields to run out of
	 * memory. If all of the fields contain only a single token, then the norms
	 * are all identical, then single norm vector may be shared.
	 */
	private static class OneNormsReader extends FilterIndexReader {
		private String field;

		public OneNormsReader(IndexReader in, String field) {
			super(in);
			this.field = field;
		}

		public byte[] norms(String field) throws IOException {
			return in.norms(this.field);
		}
		
	}

	private Search() {

	}

	public void startSearch() {
		try {
			IndexReader.unlock(FSDirectory
					.getDirectory(ConfigHandler.indexPath));
			reader = IndexReader.open(ConfigHandler.indexPath);

			searcher = new IndexSearcher(reader);
			analyzer = new StandardAnalyzer();
		} catch (IOException e) {
			// TODO Auto-generated catch block
			e.printStackTrace();
		}
	}

	public TopDocCollectorSearchResult searchByScore(String queryStr,
			int startFrom, String operator) {

		try {
			queryStr = queryStr.trim();
			QueryParser parser = new QueryParser("contents", analyzer);
			if (QueryParser.AND_OPERATOR.toString().equalsIgnoreCase(operator)){
				parser.setDefaultOperator(QueryParser.AND_OPERATOR);
			} else {
				parser.setDefaultOperator(QueryParser.OR_OPERATOR);
			}
			Query query;
			query = parser.parse(queryStr);
			TopDocCollector collector = doPagingSearch(query, startFrom);
			TopDocCollectorSearchResult result = new TopDocCollectorSearchResult(
					collector, searcher);
			return result;
		} catch (ParseException e) {
			// TODO Auto-generated catch block
			e.printStackTrace();
		} catch (IOException e) {
			// TODO Auto-generated catch block
			e.printStackTrace();
		}

		return null;

		// System.out.println("Searching for: " + query.toString("contents"));

		// doPagingSearch(in, searcher, query, hitsPerPage, raw, queries ==
		// null);

		// }
		// reader.close();
	}

	public TopFieldDocsSearchResult searchBySession(String queryStr,
			int startFrom, String operator) {

		try {
			queryStr = queryStr.trim();
			QueryParser parser = new QueryParser("contents", analyzer);
			Operator op = QueryParser.AND_OPERATOR;
			if (QueryParser.AND_OPERATOR.toString().equalsIgnoreCase(operator)){
				parser.setDefaultOperator(QueryParser.AND_OPERATOR);
			} else {
				parser.setDefaultOperator(QueryParser.OR_OPERATOR);
			}
			
			Query query;
			query = parser.parse(queryStr);
			Sort sort = new Sort("summary",true);
						
			TopFieldDocs tfd = searcher.search(query,null,startFrom+10,sort);
			TopFieldDocsSearchResult result = new TopFieldDocsSearchResult(
					tfd, searcher);
			return result;
		} catch (ParseException e) {
			// TODO Auto-generated catch block
			e.printStackTrace();
		} catch (IOException e) {
			// TODO Auto-generated catch block
			e.printStackTrace();
		}

		return null;

		
	}

	public void finishSearch() {
		try {
			reader.close();
		} catch (IOException e) {
			// TODO Auto-generated catch block
			e.printStackTrace();
		}
	}

	public static Search getInstance() {
		if (instance == null) {
			instance = new Search();
		}
		return instance;
	}

	private TopDocCollector doPagingSearch(Query query, int startFrom)
			throws IOException {

		TopDocCollector collector = new TopDocCollector(startFrom + 10);
		searcher.search(query, collector);
		if (logger.isDebugEnabled()) {
			logger.debug(query.toString());
			logger.debug(collector.toString());
		}

		return collector;
	}

	public class TopDocCollectorSearchResult {
		private TopDocCollector collector;
		private Searcher searcher;

		public TopDocCollectorSearchResult(TopDocCollector collector,
				Searcher searcher) {
			this.collector = collector;
			this.searcher = searcher;
		}

		public TopDocCollector getCollector() {
			return collector;
		}

		public Searcher getSearcher() {
			return searcher;
		}

	}

	public class TopFieldDocsSearchResult {
		private TopFieldDocs topFieldDocs;
		private Searcher searcher;

		public TopFieldDocsSearchResult(TopFieldDocs tfd,
				Searcher searcher) {
			this.topFieldDocs = tfd;
			this.searcher = searcher;
		}

		public TopFieldDocs getTopFieldDocs() {
			return topFieldDocs;
		}

		public Searcher getSearcher() {
			return searcher;
		}

	}
}
