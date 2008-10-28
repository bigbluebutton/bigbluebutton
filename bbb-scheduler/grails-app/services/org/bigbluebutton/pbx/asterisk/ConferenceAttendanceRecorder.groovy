package org.bigbluebutton.pbx.asterisk;

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

import javax.sql.DataSource;

import Attendees;

class ConferenceAttendanceRecorder implements AsteriskServerListener, PropertyChangeListener
{
    private AsteriskServer asteriskServer;
	DataSource dataSource
	
    def void setAsteriskServer(AsteriskServer server) {
    	asteriskServer = server;
    }

    def void startup() throws ManagerCommunicationException
    {
        // listen for new events
        asteriskServer.addAsteriskServerListener(this);

        for (MeetMeRoom meetMeRoom : asteriskServer.getMeetMeRooms())
        {
            for (MeetMeUser user : meetMeRoom.getUsers())
            {         
            	System.out.println("Startup")   	
            	printUser(user)
                user.addPropertyChangeListener(this)
            }
        }
    }

    def void onNewAsteriskChannel(AsteriskChannel channel)
    {
    }
    
    def void onNewMeetMeUser(MeetMeUser user)
    {
    	user.addPropertyChangeListener(this);
    	System.out.print("onNewMeetMeUser ")    	
		saveRecord(user)        
    }

    def void propertyChange(PropertyChangeEvent propertyChangeEvent)
    {
    	System.out.println("propertyChange 0")
    	if (propertyChangeEvent.getSource() instanceof MeetMeUser) {
    		System.out.println("propertyChange 1")
//    		System.out.println(propertyChangeEvent);
    		MeetMeUser user = (MeetMeUser) propertyChangeEvent.getSource();
			saveRecord(user)
    	}
    		
    }

   def void shutdown() {
	   asteriskServer.shutdown();
   }

	def printUser(MeetMeUser user) {
	        System.out.println(
        	user.getRoom().getRoomNumber() + " " +
        	user.getChannel().getId() + " " + 
        	user.getDateJoined() + " " +
        	user.getDateLeft() + " " +
        	user.getUserNumber() + " " +
        	user.getChannel().getCallerId().getName() + " " + 
        	user.getChannel().getCallerId().getNumber());
	}

	def saveRecord(MeetMeUser user) {
		printUser(user)
		System.out.println("Saving Record ")
		
     	def cdr = Attendees.findByChannelIdAndConferenceNumber(user.getChannel().getId(),
            			user.getRoom().getRoomNumber())
        def conf = Conference.findByConferenceNumber(user.getRoom().getRoomNumber())
        
        System.out.println("Finding Record " + conf)
            			
        if (!cdr) {
        	System.out.println("Creating ")
        	def rec = new Attendees(
        		conferenceNumber : user.getRoom().getRoomNumber(),
        		channelId : user.getChannel().getId(),
        		dateJoined : user.getDateJoined(),
        		dateLeft : user.getDateLeft() ? user.getDateLeft() : new Date(),
        		userNumber : user.getUserNumber(),
        		callerName : user.getChannel().getCallerId().getName() ? user.getChannel().getCallerId().getName() : "Unknown",
        		callerNumber : user.getChannel().getCallerId().getNumber() ? user.getChannel().getCallerId().getNumber() : "Unknown"     		
        	)

        	rec.save()
        	System.out.println("Created ${cdr.conferenceNumber} ${cdr.channelId}")
        } else {
        	System.out.println("Updating ")
//         	cdr.conferenceNumber = user.getRoom().getRoomNumber() 
//        	cdr.channelId = user.getChannel().getId()
        	cdr.dateJoined = user.getDateJoined()
        	cdr.dateLeft = user.getDateLeft()
        	cdr.userNumber = user.getUserNumber()
        	cdr.callerName = user.getChannel().getCallerId().getName() ? user.getChannel().getCallerId().getName() : "Unknown"
        	cdr.callerNumber = user.getChannel().getCallerId().getNumber() ? user.getChannel().getCallerId().getNumber() : "Unknown"
        	cdr.save()     
        	System.out.println("updated ${cdr.conferenceNumber} ${cdr.channelId}")  
        }		
        System.out.println("Saved Record ")
	}


}