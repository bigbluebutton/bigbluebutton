package org.bigbluebutton.webminer.web.controller;

import java.util.HashMap;
import java.util.Iterator;
import java.util.LinkedHashMap;
import java.util.Map;

import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import org.apache.log4j.Logger;
import org.apache.lucene.document.Document;
import org.apache.lucene.search.ScoreDoc;
import org.apache.lucene.search.Searcher;
import org.apache.lucene.search.TopDocCollector;
import org.apache.lucene.search.TopDocs;
import org.apache.lucene.search.TopFieldDocs;
import org.springframework.validation.BindException;
import org.springframework.web.servlet.ModelAndView;
import org.springframework.web.servlet.mvc.SimpleFormController;

import org.bigbluebutton.webminer.index.Index;
import org.bigbluebutton.webminer.search.Search;
import org.bigbluebutton.webminer.web.model.MatchVO;
import org.bigbluebutton.webminer.web.model.SearchCriteriaCommand;
import org.bigbluebutton.webminer.web.model.SessionHitsOrganizer;

public class SearchController extends SimpleFormController {

	/*
	 * (non-Javadoc)
	 * 
	 * @seeorg.springframework.web.servlet.mvc.SimpleFormController#
	 * processFormSubmission(javax.servlet.http.HttpServletRequest,
	 * javax.servlet.http.HttpServletResponse, java.lang.Object,
	 * org.springframework.validation.BindException)
	 */
	private static Logger logger = Logger.getLogger(SearchController.class);
	
	@Override
	protected ModelAndView processFormSubmission(HttpServletRequest request,
			HttpServletResponse response, Object command, BindException errors)
			throws Exception {

		return super.processFormSubmission(request, response, command, errors);
	}

	/*
	 * (non-Javadoc)
	 * 
	 * @see
	 * org.springframework.web.servlet.mvc.SimpleFormController#onSubmit(javax
	 * .servlet.http.HttpServletRequest, javax.servlet.http.HttpServletResponse,
	 * java.lang.Object, org.springframework.validation.BindException)
	 */
	@Override
	protected ModelAndView onSubmit(HttpServletRequest request,
			HttpServletResponse response, Object command, BindException errors)
			throws Exception {

		SearchCriteriaCommand srchCriteriaCommand = (SearchCriteriaCommand) command;
		int startFrom = (new Integer(srchCriteriaCommand.getStartFrom())).intValue();
		int endIndex = 0;
		String queryStr = srchCriteriaCommand.getKeyWords();
		String sortBy = srchCriteriaCommand.getSort();
		String operator = srchCriteriaCommand.getOperator();
		String relRange = srchCriteriaCommand.getRangeValue();
		boolean bSmart = (relRange!=null)&&(!relRange.isEmpty());
		
		boolean bSortByScore = sortBy.equalsIgnoreCase("byScore");
		
		if (logger.isInfoEnabled()) {
			logger.info("---search offset="+startFrom+" sortBy="+sortBy+"qryString="+queryStr+"operator="+operator);
		}

		Map<String, Object> model = new HashMap<String, Object>();
		LinkedHashMap<String, MatchVO> sortedMap = new LinkedHashMap<String, MatchVO>();
		Map<String, SessionHitsOrganizer> hitsOrganizerMap = new HashMap<String, SessionHitsOrganizer>();
		Map<String, String> resultMap = new HashMap<String, String>();

		synchronized (Index.getInstance()) {
			Search search = Search.getInstance();
			search.startSearch();
			TopDocs tps = null;
			Searcher searcher = null;
			ScoreDoc[] hits = null;
			if (bSortByScore){
				Search.TopDocCollectorSearchResult result = search.searchByScore(queryStr, startFrom, operator);
				TopDocCollector collector = result.getCollector();
				if (collector != null) {
					tps = collector.topDocs();
				} 
				hits = tps.scoreDocs;
				searcher = result.getSearcher();
			} else {
				Search.TopFieldDocsSearchResult result = search.searchBySession(queryStr, startFrom, operator);
				TopFieldDocs tfd = result.getTopFieldDocs();
				if (tfd!=null){
					hits = tfd.scoreDocs;
				}	
				searcher = result.getSearcher();				
			}						
			if (hits == null) {
				if (logger.isInfoEnabled()) {
					logger.info("---No hit");
				}
			} else {				
				
				int start = startFrom;
				int end = hits.length;
				endIndex = end;
				if (logger.isInfoEnabled()) {
					logger.info("total match number="+endIndex);
				}				
				String currentSession="0";
				String lastSession="0";
				
				
				SessionHitsOrganizer hitsOrganizer = null;			
			
				for (int i = start; i < end; i++) {
					float score = hits[i].score;					
					Document doc = searcher.doc(hits[i].doc);					
					String path = doc.get("path");			
					
					if (path != null) {
						MatchVO matchVO = new MatchVO();
						matchVO.setFilePath(path);
						String fullContent = doc.get("title");
						String summary = getKeywordContext(queryStr, fullContent);
						matchVO.setContentSummary(summary);
						
						String fileName = doc.get("fileName");
						matchVO.setFileName(fileName);
						String indexSummary = doc.get("summary");
						matchVO.setIndexingSummary(indexSummary);
						matchVO.setScore(score);
						String title = indexSummary+": "+fileName+" (Match Score = "+score+")";
						
						//String content = doc.get("contents");								
						
						String allData=title+"%"+summary;
						if (doc.get("slideTime")!=null){
							allData += "%"+doc.get("slideTime");
							matchVO.setSlidePlayTime(doc.get("slideTime"));
						}
						//sortedMap.put(path, allData);
						sortedMap.put(path, matchVO);
						
						//model.put(path, newTitle+"%"+doc.get("summary")+"%"+doc.get("slideTime"));
						if (logger.isInfoEnabled()) {
							logger.info("----"+allData);
							logger.info((i + 1) + ". " + path);
						}

						if (title != null) {
							if (logger.isInfoEnabled()) {
								logger.info("   Title: " + doc.get("title"));
							}
						}
						if (bSmart){
							//Prepare for the grouping results						
							currentSession = getSessionNumberFromFileURL(path);
							//get existing current session organizer
							hitsOrganizer = hitsOrganizerMap.get(currentSession);
							if (hitsOrganizer==null){
								//create a new session organizer object
								hitsOrganizer = new SessionHitsOrganizer();
								hitsOrganizer.setSessionNum(currentSession);
								hitsOrganizerMap.put(currentSession, hitsOrganizer);
							} 
							hitsOrganizer.setReleventRange((new Float(relRange)).floatValue());
							hitsOrganizer.addExactHits(path, score);
							matchVO.setSessionHitOrganier(hitsOrganizer);		
						}
						
					} else {
						System.out.println((i + 1) + ". "
								+ "No path for this document");
					}
				}
				
			}
			search.finishSearch();
		
			//post processing for result grouping...			
			Iterator hitsOrganizerIt = hitsOrganizerMap.keySet().iterator();
			while (hitsOrganizerIt.hasNext()){
				String key = (String) hitsOrganizerIt.next();
				SessionHitsOrganizer organizer = hitsOrganizerMap.get(key);
				organizer.generateResultGroup();					
			}			
			model.put("result", sortedMap);
			if (bSmart){
				model.put("hitsOrganizer", hitsOrganizerMap);
			}
			model.put("searchKeyword", queryStr);
			model.put("startFrom", (new Integer(startFrom)).toString());
			model.put("endAt", (new Integer(endIndex)).toString());	
			model.put("sortBy",sortBy);		
			model.put("operator",operator);
			model.put("rangeValue",relRange);
			
		}		
		ModelAndView mav = new ModelAndView(this.getSuccessView(), model);
		return mav;
	}

	private String getKeywordContext(String keyWord, String fullText) {

		String[] contentTokens = fullText.split(",");
		// If there is only one token, return the entire matched content
		String rtnValue = fullText;
		for (int i = 0; i < contentTokens.length; i++) {
			if (contentTokens[i].indexOf(keyWord) > -1) {
				rtnValue = contentTokens[i];
				break;
			}
		}
		return rtnValue;

	}

	private String getSessionNumberFromFileURL(String filePath) {

		String[] pathTokens = filePath.split("/");
		String rtnValue = pathTokens[pathTokens.length - 3];

		return rtnValue;

	}

	private LinkedHashMap groupResultBySession(LinkedHashMap singleHitMap,
			int extdRange) {
		LinkedHashMap extdResultMap = new LinkedHashMap<String, Object>();
		int lastSessionNum = 0;
		int currentSessionNum = 0;
		//

		return extdResultMap;

	}

}
