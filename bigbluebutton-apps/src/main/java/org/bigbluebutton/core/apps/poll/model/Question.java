package org.bigbluebutton.core.apps.poll.model;

import java.util.ArrayList;
import java.util.Map;
import java.util.HashMap;

public class Question {
	private final String id;
	private String question;
	private Map<String, Response> responses = new HashMap<String, Response>();
	
	public Question(String id, String question) {
		this.id = id;
		this.question = question;
	}
	
	public String getID() {
		return id;
	}
	
	public void setQuestion(String q) {
		question = q;
	}
	
	public String getQuestion() {
		return question;
	}
	
	public void addResponse(String id, Response r) {
		responses.put(id, r);
	}
	
	public void removeResponse(String id) {
		responses.remove(id);
	}
	
	public ArrayList<Response> getResponses() {
		ArrayList<Response> resps = new ArrayList<Response>();
		for (Response r : responses.values()) {
		    resps.add(r.copy());
		}
		return resps;
	}
	
	public int numResponses() {
		return responses.size();
	}
}
