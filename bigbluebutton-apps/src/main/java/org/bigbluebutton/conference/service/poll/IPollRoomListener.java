package org.bigbluebutton.conference.service.poll;
import java.util.ArrayList;
import org.bigbluebutton.conference.service.poll.Poll;

public interface IPollRoomListener {
	public String getName();
	public  void savePoll(Poll poll ); 
}
