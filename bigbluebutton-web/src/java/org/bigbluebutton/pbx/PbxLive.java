/* BigBlueButton - http://www.bigbluebutton.org
 * 
 * 
 * Copyright (c) 2008-2009 by respective authors (see below). All rights reserved.
 * 
 * BigBlueButton is free software; you can redistribute it and/or modify it under the 
 * terms of the GNU Lesser General Public License as published by the Free Software 
 * Foundation; either version 3 of the License, or (at your option) any later 
 * version. 
 * 
 * BigBlueButton is distributed in the hope that it will be useful, but WITHOUT ANY 
 * WARRANTY; without even the implied warranty of MERCHANTABILITY or FITNESS FOR A 
 * PARTICULAR PURPOSE. See the GNU Lesser General Public License for more details.
 * 
 * You should have received a copy of the GNU Lesser General Public License along 
 * with BigBlueButton; if not, If not, see <http://www.gnu.org/licenses/>.
 *
 * Author: Richard Alam <ritzalam@gmail.com>
 * 
 * @version $Id: $
 */
package org.bigbluebutton.pbx;

import org.asteriskjava.live.AsteriskChannel;
import org.asteriskjava.live.AsteriskQueue;
import org.asteriskjava.live.AsteriskServer;
import org.asteriskjava.live.AsteriskServerListener;
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
