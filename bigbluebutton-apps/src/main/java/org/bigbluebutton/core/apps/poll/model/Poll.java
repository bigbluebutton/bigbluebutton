package org.bigbluebutton.core.apps.poll.model;

public class Poll {
	public String title;					
	public Boolean allowMultipleAnswers;	
	public Question question;		
	public final String id;								
	public Boolean active = false;
	
	public Poll(String id) {
		this.id = id;
	}

	public String getTitle() {
		return title;
	}

	public void setTitle(String title) {
		this.title = title;
	}

	public Boolean getAllowMultipleAnswers() {
		return allowMultipleAnswers;
	}

	public void setAllowMultipleAnswers(Boolean allowMultipleAnswers) {
		this.allowMultipleAnswers = allowMultipleAnswers;
	}

	public Question getQuestion() {
		return question;
	}

	public void setQuestion(Question question) {
		this.question = question;
	}

	public Boolean getActive() {
		return active;
	}

	public void setActive(Boolean active) {
		this.active = active;
	}

	public String getId() {
		return id;
	}
	
	
}
