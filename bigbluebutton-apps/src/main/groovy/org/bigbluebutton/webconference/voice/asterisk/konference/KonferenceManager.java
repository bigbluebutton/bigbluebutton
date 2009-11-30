package org.bigbluebutton.webconference.voice.asterisk.konference;

import org.asteriskjava.live.ManagerCommunicationException;
import org.asteriskjava.manager.ManagerConnection;
import org.asteriskjava.manager.ManagerEventListener;
import org.asteriskjava.manager.action.CommandAction;
import org.asteriskjava.manager.event.ManagerEvent;
import org.asteriskjava.manager.response.CommandResponse;
import org.asteriskjava.manager.response.ManagerError;
import org.asteriskjava.manager.response.ManagerResponse;
import org.asteriskjava.util.DateUtil;
import org.asteriskjava.util.Log;
import org.asteriskjava.util.LogFactory;
import org.bigbluebutton.webconference.voice.asterisk.konference.events.AbstractKonferenceEvent;
import org.bigbluebutton.webconference.voice.asterisk.konference.events.KonferenceJoinEvent;
import org.bigbluebutton.webconference.voice.asterisk.konference.events.KonferenceLeaveEvent;
import org.bigbluebutton.webconference.voice.asterisk.konference.events.KonferenceMemberMuteEvent;
import org.bigbluebutton.webconference.voice.asterisk.konference.events.KonferenceMemberUnmuteEvent;
import org.bigbluebutton.webconference.voice.asterisk.konference.events.KonferenceStateEvent;

import java.util.*;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

class KonferenceManager implements ManagerEventListener {
    private static final String KONFERENCE_LIST_COMMAND = "konference list";
    private static final Pattern KONFERENCE_LIST_PATTERN = Pattern.compile("^User #: ([0-9]+).*Channel: (\\S+).*$");

    private final Log logger = LogFactory.getLog(getClass());
    private final ManagerConnection manager;

//    private final Map<String, ConferenceRoomImpl> rooms;

    KonferenceManager(ManagerConnection manager) {
        this.manager = manager;
        
//        this.rooms = new HashMap<String, ConferenceRoomImpl>();
        
        manager.registerUserEventClass(KonferenceJoinEvent.class);
        manager.registerUserEventClass(KonferenceLeaveEvent.class);
        manager.registerUserEventClass(KonferenceStateEvent.class);
        manager.registerUserEventClass(KonferenceMemberMuteEvent.class);
        manager.registerUserEventClass(KonferenceMemberUnmuteEvent.class);
    }


    void disconnected()
    {
        /*
        synchronized (rooms)
        {
            rooms.clear();
        }
        */
    }

    private void handleConferenceEvent(AbstractKonferenceEvent event) {

    }

    private void populateRoom(String room) {
/*    	
        final CommandAction meetMeListAction;
        final ManagerResponse response;
        final List<String> lines;
        final Collection<Integer> userNumbers = new ArrayList<Integer>(); // list of user numbers in the room

        meetMeListAction = new CommandAction(KONFERENCE_LIST_COMMAND + " " + room.getRoomName());
        try
        {
            response = manager.sendAction(meetMeListAction);
        }
        catch (ManagerCommunicationException e)
        {
            logger.error("Unable to send \"" + KONFERENCE_LIST_COMMAND + "\" command", e);
            return;
        }
        if (response instanceof ManagerError)
        {
            logger.error("Unable to send \"" + KONFERENCE_LIST_COMMAND + "\" command: " + response.getMessage());
            return;
        }
        if (!(response instanceof CommandResponse))
        {
            logger.error("Response to \"" + KONFERENCE_LIST_COMMAND + "\" command is not a CommandResponse but "
                    + response.getClass());
            return;
        }

        lines = ((CommandResponse) response).getResult();
        for (String line : lines)
        {
            final Matcher matcher;
            final Integer userNumber;
            boolean muted = false;
            boolean talking = false;
            ConferenceMemberImpl channelUser;
            ConferenceMemberImpl roomUser;

            matcher = KONFERENCE_LIST_PATTERN.matcher(line);
            if (!matcher.matches())
            {
                continue;
            }

            userNumber = Integer.valueOf(matcher.group(1));
            channel = channelManager.getChannelImplByName(matcher.group(2));

            userNumbers.add(userNumber);

            if (line.contains("(Admin Muted)") || line.contains("(Muted)"))
            {
                muted = true;
            }

            if (line.contains("(talking)"))
            {
                talking = true;
            }

            channelUser = channel.getMeetMeUser();
            if (channelUser != null && channelUser.getRoom() != room)
            {
                channelUser.left(DateUtil.getDate());
                channelUser = null;
            }

            roomUser = room.getUser(userNumber);
            if (roomUser != null && roomUser.getChannel() != channel)
            {
                room.removeUser(roomUser);
                roomUser = null;
            }

            if (channelUser == null && roomUser == null)
            {
                final ConferenceMemberImpl user;
                // using the current date as dateJoined is not correct but we
                // don't have anything that is better
                user = new ConferenceMemberImpl(server, room, userNumber, channel, DateUtil.getDate());
                user.setMuted(muted);
                user.setTalking(talking);
                room.addUser(user);
                channel.setMeetMeUserImpl(user);
                server.fireNewMeetMeUser(user);
            }
            else if (channelUser != null && roomUser == null)
            {
                channelUser.setMuted(muted);
                room.addUser(channelUser);
            }
            else if (channelUser == null)
            {
                roomUser.setMuted(muted);
                channel.setMeetMeUserImpl(roomUser);
            }
            else
            {
                if (channelUser != roomUser)
                {
                    logger.error("Inconsistent state: channelUser != roomUser, channelUser=" + channelUser + ", roomUser="
                            + roomUser);
                }
            }
        }

        Collection<ConferenceMemberImpl> users = room.getUserImpls();
        Collection<ConferenceMemberImpl> usersToRemove = new ArrayList<ConferenceMemberImpl>();
        for (ConferenceMemberImpl user : users)
        {
            if (!userNumbers.contains(user.getUserNumber()))
            {
                // remove user as he is no longer in the room
                usersToRemove.add(user);
            }
        }
        for (ConferenceMemberImpl user : usersToRemove)
        {
            user.left(DateUtil.getDate());
            room.removeUser(user);
            user.getChannel().setMeetMeUserImpl(null);
        }
*/
    }
/*
    private ConferenceMemberImpl getOrCreateUserImpl(AbstractKonferenceEvent event)
    {
        final String roomName;
        final ConferenceRoomImpl room;
        final String uniqueId;
        final String channel;
        ConferenceMemberImpl user;

        roomName = event.getConferenceName();
        room = getOrCreateRoomImpl(roomName);
        user = room.getUser(event.getUserNum());
        if (user != null)
        {
            return user;
        }

        // ok create a new one
        uniqueId = event.getUniqueId();
        if (uniqueId == null)
        {
            logger.warn("UniqueId is null. Ignoring MeetMeEvent");
            return null;
        }

        channel = channelManager.getChannelImplById(uniqueId);
        if (channel == null)
        {
            logger.warn("No channel with unique id " + uniqueId + ". Ignoring MeetMeEvent");
            return null;
        }

        user = channel.getMeetMeUser();
        if (user != null)
        {
            logger.error("Got MeetMeEvent for channel " + channel.getName() + " that is already user of a room");
            user.left(event.getDateReceived());
            if (user.getRoom() != null)
            {
                user.getRoom().removeUser(user);
            }
            channel.setMeetMeUserImpl(null);
        }

        logger.info("Adding channel " + channel.getName() + " as user " + event.getUserNum() + " to room " + roomNumber);
        user = new ConferenceMemberImpl(server, room, event.getUserNum(), channel, event.getDateReceived());
        room.addUser(user);
        channel.setMeetMeUserImpl(user);
        server.fireNewMeetMeUser(user);

        return user;
    }

    ConferenceRoomImpl getOrCreateRoomImpl(String roomName)
    {
        ConferenceRoomImpl room;
        boolean created = false;

        synchronized (rooms)
        {
            room = rooms.get(roomName);
            if (room == null)
            {
                room = new ConferenceRoomImpl(manager, roomName);
                populateRoom(room);
                rooms.put(roomName, room);
                created = true;
            }
        }

        if (created)
        {
            logger.debug("Created Conference Room " + roomName);
        }

        return room;
    }
*/
	public void onManagerEvent(ManagerEvent event) {
		handleConferenceEvent((AbstractKonferenceEvent)event);		
	}
}
