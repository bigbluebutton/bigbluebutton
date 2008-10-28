package org.bigbluebutton.pbx;
import org.asteriskjava.live.AsteriskChannel;
import org.asteriskjava.live.AsteriskQueue;
import org.asteriskjava.live.AsteriskServer;
import org.asteriskjava.live.AsteriskServerListener;
import org.asteriskjava.live.DefaultAsteriskServer;
import org.asteriskjava.live.ManagerCommunicationException;
import org.asteriskjava.live.MeetMeRoom;
import org.asteriskjava.live.MeetMeUser;
import java.beans.PropertyChangeListener;
import java.beans.PropertyChangeEvent;

public class PbxLive implements AsteriskServerListener, PropertyChangeListener
{
    private AsteriskServer asteriskServer;

    public PbxLive() {}

    public void setAsteriskServer(AsteriskServer server) {
    	asteriskServer = server;
    }
    
    public void startup() throws ManagerCommunicationException
    {
        // listen for new events
        asteriskServer.addAsteriskServerListener(this);

        // add property change listeners to existing objects
        for (AsteriskChannel asteriskChannel : asteriskServer.getChannels())
        {
        //    System.out.println(asteriskChannel);
        //    asteriskChannel.addPropertyChangeListener(this);
        }

        for (AsteriskQueue asteriskQueue : asteriskServer.getQueues())
        {
        //    System.out.println(asteriskQueue);
            for (AsteriskChannel asteriskChannel : asteriskQueue.getEntries())
            {
        //        asteriskChannel.addPropertyChangeListener(this);
            }
        }

        for (MeetMeRoom meetMeRoom : asteriskServer.getMeetMeRooms())
        {
            System.out.println(meetMeRoom);
            for (MeetMeUser user : meetMeRoom.getUsers())
            {
                user.addPropertyChangeListener(this);
            }
        }
    }

    public void onNewAsteriskChannel(AsteriskChannel channel)
    {
     //   System.out.println(channel);
     //   channel.addPropertyChangeListener(this);
    }

    public void onNewMeetMeUser(MeetMeUser user)
    {
        System.out.println(user);
        user.addPropertyChangeListener(this);
    }

    public void propertyChange(PropertyChangeEvent propertyChangeEvent)
    {
    	if (propertyChangeEvent.getSource() instanceof MeetMeUser) {
//    		System.out.println(propertyChangeEvent);
    		MeetMeUser user = (MeetMeUser) propertyChangeEvent.getSource();
    		System.out.println(user.getChannel().getCallerId().getName() + " " + user.getChannel().getCallerId().getNumber());
    	}
    		
    }

   public void shutdown() {
	   asteriskServer.shutdown();
   }

}
