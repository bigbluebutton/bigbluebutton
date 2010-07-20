package org.bigbluebutton.webminer.swf;

import org.apache.log4j.Logger;

import org.bigbluebutton.webminer.web.controller.CourseIndexingController;

public class PresentationMeta {
	private static Logger logger = Logger.getLogger(CourseIndexingController.class);
	private String fileName = null;
	private String summary = null;
	private String uid = null;
	private String slideTime = null;
	public String getUid() {
		return uid;
	}
	public void setUid(String uid) {
		this.uid = uid;
	}
	public String getSummary() {
		return summary;
	}
	public void setSummary(String summary) {
		this.summary = summary;
	}
	public String getFileName() {
		return fileName;
	}
	public void setFileName(String fileName) {
		this.fileName = fileName;
	}
	public String getSlideTime() {
		return slideTime;
	}
	public void setSlideTime(String slideTime) {
		this.slideTime = slideTime;
	}
	
	
	
	
}
