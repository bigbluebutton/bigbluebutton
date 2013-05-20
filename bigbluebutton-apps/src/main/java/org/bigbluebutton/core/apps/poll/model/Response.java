package org.bigbluebutton.core.apps.poll.model;

import java.util.ArrayList;

public class Response {
	private final String id;
	private final String response;
	private final ArrayList<Responder> responders = new ArrayList<Responder>();
	
	public Response(String id, String response) {
		this.id = id;
		this.response = response;
	}
	
	public String getID() {
		return id;	
	}
	
	public String getResponse() {
		return response;
	}
	
	public void addResponder(Responder resp) {
		responders.add(resp);
	}
	
	public ArrayList<String> getResponders() {
		ArrayList<String> resps = new ArrayList<String>();
		
		for (Responder r : responders) {
			resps.add(r.getUserID());
		}
		
		return resps;
	}
	
	public Response copy() {
		Response resp = new Response(id, response);
		ArrayList<String> resps = getResponders();
		
		for (String userID : resps) {
			resp.addResponder(new Responder(userID));
		}
		
		return resp;
	}
}
