package org.bigbluebutton.core.apps.poll.model;

import java.util.HashMap;
import java.util.Map;

public class Poll {
	public String title;					
	public Boolean allowMultipleAnswers;	
	public final Map<String, Question> questions = new HashMap<String, Question>();		
	public String id;								
	public Boolean active = false;
	
	public Poll(String id) {
		this.id = id;
	}
}
