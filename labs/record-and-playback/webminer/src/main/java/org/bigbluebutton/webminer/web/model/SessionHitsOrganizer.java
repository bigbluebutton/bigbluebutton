package org.bigbluebutton.webminer.web.model;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.Iterator;
import java.util.Map;
import java.util.Set;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

import org.apache.log4j.Logger;

import org.bigbluebutton.webminer.web.controller.SearchController;

public class SessionHitsOrganizer {
	String sessionNum;
	int firstHitSlideNum;
	int lastHitSlideNum;
	int range;
	float releventRange;
	
	Map<String, Float> hitsMap= new HashMap <String, Float>();
	Map<String, Object> analyzedHitsMap;
	Map<Integer, String> slideNumURLMap = new HashMap <Integer, String>();
	Map<String, ArrayList> hitSlideGroup = new HashMap <String, ArrayList>();
	
	private static Logger logger = Logger.getLogger(SessionHitsOrganizer.class);
	
	public String getSessionNum() {
		return sessionNum;
	}
	public void setSessionNum(String sessionNum) {
		this.sessionNum = sessionNum;
	}
	public int getFirstHitSlideNum() {
		return firstHitSlideNum;
	}
	public void setFirstHitSlideNum(int firstHitSlideNum) {
		this.firstHitSlideNum = firstHitSlideNum;
	}
	public int getLastHitSlideNum() {
		return lastHitSlideNum;
	}
	public void setLastHitSlideNum(int lastHitSlideNum) {
		this.lastHitSlideNum = lastHitSlideNum;
	}
	public int getRange() {
		return range;
	}
	public void setRange(int range) {
		this.range = range;
	}
	public Map<String, Float> getHitsMap() {
		return hitsMap;
	}
	public void setHitsMap(Map<String, Float> hitsMap) {
		this.hitsMap = hitsMap;
	}
	public Map<String, Object> getAnalyzedHitsMap() {
		return analyzedHitsMap;
	}
	public void setAnalyzedHitsMap(Map<String, Object> analyzedHitsMap) {
		this.analyzedHitsMap = analyzedHitsMap;
	}		
	public Map<Integer, String> getSlideNumURLMap() {
		return slideNumURLMap;
	}
	public void setSlideNumURLMap(Map<Integer, String> slideURLNumMap) {
		this.slideNumURLMap = slideURLNumMap;
	}
	public Map<String, ArrayList> getHitSlideGroup() {
		return hitSlideGroup;
	}
	public void setHitSlideGroup(Map<String, ArrayList> hitSlideGroup) {
		this.hitSlideGroup = hitSlideGroup;
	}
	public float getReleventRange() {
		return releventRange;
	}
	public void setReleventRange(float releventRange) {
		this.releventRange = releventRange;
	}
	public void addExactHits(String URL, float score){
		this.hitsMap.put(URL, new Float(score));
		//System.out.println("hello----------"+URL);
		this.slideNumURLMap.put(getSlideNumFromFilePath(URL),URL);		
	}
	
	public void generateResultGroup(){
		//loop hitsMap, for each exact match, generate a group of slides.
		Set<String> ksHitsMap = this.hitsMap.keySet();
		if (ksHitsMap!=null){
			Iterator it = this.hitsMap.keySet().iterator();
			while (it.hasNext()){
				String url = (String) it.next();
				ArrayList <String> relevantSlidesURL = new ArrayList<String>();
				
				int slideNum = getSlideNumFromFilePath(url);
				float currentScore = this.hitsMap.get(url);
				/* The code blow is to find the previous qualified slides*/
				String prevHitURL = getPrevHitURL(slideNum);
				int prevHitSlideNum = getPrevHitSlideNum(slideNum);
				if (logger.isInfoEnabled()) {
					logger.info("Current hit ("+slideNum+")="+url);
					logger.info("PrevHitURL ("+prevHitSlideNum+")="+prevHitURL);
				}
				
				String lastQualifyURL=null;
				int lastQualifySlideNum=-1;
				float prevHitScore = -1;
				while (prevHitURL != null){
					//compare last previous hit score and current hit score
					prevHitScore = this.hitsMap.get(prevHitURL);
					if (logger.isInfoEnabled()) {
						logger.info("Prev hit slide number="+prevHitSlideNum+"; Score="+prevHitScore+"current hit score="+currentScore);
					}
					if (Math.abs(currentScore-prevHitScore)<this.releventRange){
						//find the first not qualified slide
						lastQualifyURL=prevHitURL;
						lastQualifySlideNum=prevHitSlideNum;
						prevHitURL = getPrevHitURL(prevHitSlideNum);
						
						if (prevHitURL==null){
							//all the previous hits are relevant
							for (int num=prevHitSlideNum; num<slideNum; num++){
								relevantSlidesURL.add(getFilePathFromSlideNumber(num, url));
							}
						} else {
							prevHitSlideNum = getPrevHitSlideNum(prevHitSlideNum);
						}
					}else{
						if (lastQualifySlideNum<0){
							//the first previous slide is not qualify already, there is no need to add prev slide
							break;
						} else if ((lastQualifySlideNum-prevHitSlideNum)<2){
							//estimate score and determine which slide in between is qualify
							//there is no slide in between two slides
							for (int num=slideNum-1; num>=lastQualifySlideNum; num--){
								relevantSlidesURL.add(getFilePathFromSlideNumber(num, url));
							}
							break;
						} else {
							//find the last qualify slide number with estimated score
							if (lastQualifyURL!=null){
							    float lastQualifyScore = this.hitsMap.get(lastQualifyURL);
								float factor = Math.abs((lastQualifyScore-prevHitScore)/(lastQualifySlideNum-prevHitSlideNum));
								for (int k=1; k<(lastQualifySlideNum-prevHitSlideNum);k++){
									float estimatedScore = factor*k+prevHitScore;
									System.out.println("Score------------"+estimatedScore);
									if (Math.abs(estimatedScore-lastQualifyScore)<this.releventRange){
										for (int num=slideNum-1; num>=lastQualifySlideNum-k; num--){
											relevantSlidesURL.add(getFilePathFromSlideNumber(num, url));
											if (logger.isInfoEnabled()) {
												logger.info("add relevant slide:"+getFilePathFromSlideNumber(num, url));
											}
										}
										break;
									}
								}
							}
						}
						break;
					}					
				}			
				/* The code blow is to find the next qualified slides*/
				//add relevant slide slide to exact match
				if (logger.isInfoEnabled()) {
					for (int x=0; x<relevantSlidesURL.size();x++){
						logger.info("====Previous Hit form "+url+"===========");
						logger.info((x + 1) + ": " + relevantSlidesURL.get(x));
						logger.info("===============");
					}
				}
				hitSlideGroup.put(url, relevantSlidesURL);					
			}
		}		
	}
	
	private int getPrevHitSlideNum(int slideNum) {
		for (int i=slideNum-1; i>-1; i--){
			if (this.slideNumURLMap.containsKey(i)){
				return i;
			}
		}
		return 0;
	}
	private String getPrevHitURL(int slideNum) {
		for (int i=slideNum-1; i>-1; i--){
			if (this.slideNumURLMap.containsKey(i)){
				return (String) this.slideNumURLMap.get(i);
			}
		}
		return null;
	}
	private int getSlideNumFromFilePath(String filePath){
		Integer rtnValue = null;
		String[] pathTokens = filePath.split("/");
		String fileName = pathTokens[pathTokens.length - 1];
		
		String[] nameTokens = fileName.split("-");
		
		String slideNumPart = nameTokens[nameTokens.length-1];
		
		if (slideNumPart!=null && slideNumPart.length()>0){
			int index = slideNumPart.indexOf(".");
			String number = slideNumPart.substring(0,index);
			
			rtnValue = (new Integer(number)).intValue();
		}
		//System.out.println("===slide number===="+rtnValue);
		return rtnValue;
		
	}
	
	private String getFilePathFromSlideNumber(int slideNum, String baseURL){
		String rtnValue = "";
		Pattern p = Pattern.compile("-slide-\\d{1,3}.swf");
		Matcher matcher = p.matcher(baseURL);		
		rtnValue = matcher.replaceAll("-slide-"+(new Integer(slideNum)).toString()+".swf");
		return rtnValue;		
		
	}
	
	
	

}
