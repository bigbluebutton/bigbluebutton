package org.bigbluebutton.webconference.voice;

import java.util.ArrayList;
import org.bigbluebutton.webconference.voice.Participant;

public interface Room {		
	public String getName();	
	public int countParticipants();	
	public Participant getParticipant(Integer id);
	public boolean hasParticipant(Integer id);
	public ArrayList<Participant> getParticipants();
}
