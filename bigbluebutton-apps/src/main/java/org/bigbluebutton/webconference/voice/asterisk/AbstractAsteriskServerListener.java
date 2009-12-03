
package org.bigbluebutton.webconference.voice.asterisk;

import org.asteriskjava.live.AsteriskChannel;
import org.asteriskjava.live.AsteriskQueueEntry;
import org.asteriskjava.live.AsteriskServerListener;
import org.asteriskjava.live.MeetMeUser;
import org.asteriskjava.live.internal.AsteriskAgentImpl;

public abstract class AbstractAsteriskServerListener implements AsteriskServerListener {
    
    public abstract void onNewMeetMeUser(MeetMeUser user);
   
    public void onNewAgent(AsteriskAgentImpl agent) {}
    public void onNewAsteriskChannel(AsteriskChannel channel) {}
    public void onNewQueueEntry(AsteriskQueueEntry entry) {}
}
