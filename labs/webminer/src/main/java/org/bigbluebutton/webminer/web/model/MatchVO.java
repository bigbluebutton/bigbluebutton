package org.bigbluebutton.webminer.web.model;

public class MatchVO {
	private String filePath;
	private String fileName;
	private String indexingSummary;
	private float score;
	private String contentSummary;
	private String slidePlayTime;
	private SessionHitsOrganizer sessionHitOrganier;
	
	public String getFilePath() {
		return filePath;
	}
	public void setFilePath(String filePath) {
		this.filePath = filePath;
	}
	public String getFileName() {
		return fileName;
	}
	public void setFileName(String fileName) {
		this.fileName = fileName;
	}
	public String getIndexingSummary() {
		return indexingSummary;
	}
	public void setIndexingSummary(String indexingSummary) {
		this.indexingSummary = indexingSummary;
	}
	public float getScore() {
		return score;
	}
	public void setScore(float score) {
		this.score = score;
	}
	public String getSlidePlayTime() {
		return slidePlayTime;
	}
	public void setSlidePlayTime(String slidePlayTime) {
		this.slidePlayTime = slidePlayTime;
	}

	public SessionHitsOrganizer getSessionHitOrganier() {
		return sessionHitOrganier;
	}

	public void setSessionHitOrganier(SessionHitsOrganizer sessionHitOrganier) {
		this.sessionHitOrganier = sessionHitOrganier;
	}
	public void setContentSummary(String contentSummary) {
		this.contentSummary = contentSummary;
	}
	public String getContentSummary() {
		return contentSummary;
	}	
	
	

}
