
import java.io.IOException;
import java.util.ArrayList;
import java.util.Collection;
import java.util.List;
import java.util.regex.Pattern;

import org.asteriskjava.live.ManagerCommunicationException;
import org.asteriskjava.manager.AuthenticationFailedException;
import org.asteriskjava.manager.ManagerConnection;
import org.asteriskjava.manager.ManagerConnectionFactory;
import org.asteriskjava.manager.ManagerEventListener;
import org.asteriskjava.manager.TimeoutException;
import org.asteriskjava.manager.action.CommandAction;
import org.asteriskjava.manager.action.StatusAction;
import org.asteriskjava.manager.event.ManagerEvent;
import org.asteriskjava.manager.response.CommandResponse;
import org.asteriskjava.manager.response.ManagerError;
import org.asteriskjava.manager.response.ManagerResponse;
import org.bigbluebutton.webconference.voice.asterisk.konference.events.ConferenceJoinEvent;
import org.bigbluebutton.webconference.voice.asterisk.konference.events.ConferenceLeaveEvent;
import org.bigbluebutton.webconference.voice.asterisk.konference.events.ConferenceMemberMuteEvent;
import org.bigbluebutton.webconference.voice.asterisk.konference.events.ConferenceMemberUnmuteEvent;
import org.bigbluebutton.webconference.voice.asterisk.konference.events.ConferenceStateEvent;

public class HelloEvents implements ManagerEventListener {
    private static final String KONFERENCE_LIST_COMMAND = "konference list";
    private static final Pattern KONFERENCE_LIST_PATTERN = Pattern.compile("^User #: ([0-9]+).*Channel: (\\S+).*$");
    
    private ManagerConnection managerConnection;

    public HelloEvents() throws IOException
    {
        ManagerConnectionFactory factory = new ManagerConnectionFactory(
                "192.168.0.120", "bbb", "secret");

        this.managerConnection = factory.createManagerConnection();
        managerConnection.registerUserEventClass(ConferenceJoinEvent.class);
        managerConnection.registerUserEventClass(ConferenceLeaveEvent.class);
        managerConnection.registerUserEventClass(ConferenceStateEvent.class);
        managerConnection.registerUserEventClass(ConferenceMemberMuteEvent.class);
        managerConnection.registerUserEventClass(ConferenceMemberUnmuteEvent.class);
    }

    public void run() throws IOException, AuthenticationFailedException,
            TimeoutException, InterruptedException
    {
        // register for events
        managerConnection.addEventListener(this);
        
        // connect to Asterisk and log in
        managerConnection.login();

        // request channel state
        managerConnection.sendAction(new StatusAction());
        
        // wait 10 seconds for events to come in
        Thread.sleep(10000);

        populateRoom("85115");
        
        // and finally log off and disconnect
//        managerConnection.logoff();
    }

    private void populateRoom(String room) {	
    	final CommandAction meetMeListAction;
    	ManagerResponse response = null;
    	final List<String> lines;
    	final Collection<Integer> userNumbers = new ArrayList<Integer>(); // list of user numbers in the room

    	meetMeListAction = new CommandAction(KONFERENCE_LIST_COMMAND + " " + room);
    	try {
    		response = managerConnection.sendAction(meetMeListAction);
    	} catch (TimeoutException e) {
    		System.out.println("Unable to send \"" + KONFERENCE_LIST_COMMAND + "\" command");
    		return;
    	} catch (IllegalArgumentException e) {
			// TODO Auto-generated catch block
			e.printStackTrace();
		} catch (IllegalStateException e) {
			// TODO Auto-generated catch block
			e.printStackTrace();
		} catch (IOException e) {
			// TODO Auto-generated catch block
			e.printStackTrace();
		}
    	
    	if (response instanceof ManagerError) {
    		System.out.println("Unable to send \"" + KONFERENCE_LIST_COMMAND + "\" command: " + response.getMessage());
    		return;
    	}
    	
    	if (!(response instanceof CommandResponse)) {
    		System.out.println("Response to \"" + KONFERENCE_LIST_COMMAND + "\" command is not a CommandResponse but "
    	                    + response.getClass());
    		return;
    	}

    	lines = ((CommandResponse) response).getResult();
    	for (String line : lines) {
    		System.out.println(line);
    	/*    		
    		final Matcher matcher;
    		final Integer userNumber;
    		boolean muted = false;
    		boolean talking = false;
    		ConferenceMemberImpl channelUser;
    		ConferenceMemberImpl roomUser;

    		matcher = KONFERENCE_LIST_PATTERN.matcher(line);
    		if (!matcher.matches()) {
    			continue;
    		}

    		userNumber = Integer.valueOf(matcher.group(1));
    		channel = channelManager.getChannelImplByName(matcher.group(2));

    		userNumbers.add(userNumber);

    		if (line.contains("(Admin Muted)") || line.contains("(Muted)")) {
    			muted = true;
    		}

    		if (line.contains("(talking)")) {
    			talking = true;
    		}

    		channelUser = channel.getMeetMeUser();
    		if (channelUser != null && channelUser.getRoom() != room) {
    			channelUser.left(DateUtil.getDate());
    			channelUser = null;
    		}

    		roomUser = room.getUser(userNumber);
    		if (roomUser != null && roomUser.getChannel() != channel) {
    			room.removeUser(roomUser);
    			roomUser = null;
    		}

    		if (channelUser == null && roomUser == null) {
    			final ConferenceMemberImpl user;
    			// using the current date as dateJoined is not correct but we
    			// don't have anything that is better
    			user = new ConferenceMemberImpl(server, room, userNumber, channel, DateUtil.getDate());
    			user.setMuted(muted);
    			user.setTalking(talking);
    			room.addUser(user);
    			channel.setMeetMeUserImpl(user);
    			server.fireNewMeetMeUser(user);
    		} else if (channelUser != null && roomUser == null) {
    			channelUser.setMuted(muted);
    			room.addUser(channelUser);
    		} else if (channelUser == null) {
    			roomUser.setMuted(muted);
    			channel.setMeetMeUserImpl(roomUser);
    		} else {
    			if (channelUser != roomUser) {
    				logger.error("Inconsistent state: channelUser != roomUser, channelUser=" + channelUser + ", roomUser="
    	                            + roomUser);
    			}
    		}
    		*/
    	}
/*
    	Collection<ConferenceMemberImpl> users = room.getUserImpls();
    	Collection<ConferenceMemberImpl> usersToRemove = new ArrayList<ConferenceMemberImpl>();
    	for (ConferenceMemberImpl user : users) {
    		if (!userNumbers.contains(user.getUserNumber())) {
    			// remove user as he is no longer in the room
    			usersToRemove.add(user);
    		}
    	}
    	
    	for (ConferenceMemberImpl user : usersToRemove) {
    		user.left(DateUtil.getDate());
    		room.removeUser(user);
    		user.getChannel().setMeetMeUserImpl(null);
    	}
    */
	}
    
    public void onManagerEvent(ManagerEvent event)
    {
        // just print received events
        System.out.println(event);
    }

    public static void main(String[] args) throws Exception
    {
        HelloEvents helloEvents;

        helloEvents = new HelloEvents();
        helloEvents.run();
        
        while (true) {
        	
        }
    }
}
