/*
 *  Copyright 2004-2006 Stefan Reuter
 *
 *  Licensed under the Apache License, Version 2.0 (the "License");
 *  you may not use this file except in compliance with the License.
 *  You may obtain a copy of the License at
 *
 *      http://www.apache.org/licenses/LICENSE-2.0
 *
 *  Unless required by applicable law or agreed to in writing, software
 *  distributed under the License is distributed on an "AS IS" BASIS,
 *  WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 *  See the License for the specific language governing permissions and
 *  limitations under the License.
 *
 */
package org.asteriskjava.live.internal;

import org.asteriskjava.live.ManagerCommunicationException;
import org.asteriskjava.live.MeetMeRoom;
import org.asteriskjava.manager.action.CommandAction;
import org.asteriskjava.manager.event.AbstractMeetMeEvent;
import org.asteriskjava.manager.event.MeetMeLeaveEvent;
import org.asteriskjava.manager.event.MeetMeMuteEvent;
import org.asteriskjava.manager.event.MeetMeTalkingEvent;
import org.asteriskjava.manager.response.CommandResponse;
import org.asteriskjava.manager.response.ManagerError;
import org.asteriskjava.manager.response.ManagerResponse;
import org.asteriskjava.util.DateUtil;
import org.asteriskjava.util.Log;
import org.asteriskjava.util.LogFactory;

import java.util.*;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

/**
 * Manages MeetMe events on behalf of an AsteriskServer.
 *
 * @author srt
 */
class MeetMeManager
{
    private static final String MEETME_LIST_COMMAND = "meetme list";
    private static final Pattern MEETME_LIST_PATTERN = Pattern.compile("^User #: ([0-9]+).*Channel: (\\S+).*$");

    private final Log logger = LogFactory.getLog(getClass());
    private final AsteriskServerImpl server;
    private final ChannelManager channelManager;

    /**
     * Maps room number to MeetMe room.
     */
    private final Map<String, MeetMeRoomImpl> rooms;

    MeetMeManager(AsteriskServerImpl server, ChannelManager channelManager)
    {
        this.server = server;
        this.channelManager = channelManager;
        this.rooms = new HashMap<String, MeetMeRoomImpl>();
    }

    void initialize()
    {
        synchronized (rooms)
        {
            for (MeetMeRoomImpl room : rooms.values())
            {
                populateRoom(room);
            }
        }
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

    Collection<MeetMeRoom> getMeetMeRooms()
    {
        final Collection<MeetMeRoom> result;

        result = new ArrayList<MeetMeRoom>();
        synchronized (rooms)
        {
            for (MeetMeRoom room : rooms.values())
            {
                if (!room.isEmpty())
                {
                    result.add(room);
                }
            }
        }
        return result;
    }

    void handleMeetMeEvent(AbstractMeetMeEvent event)
    {
        String roomNumber;
        Integer userNumber;
        AsteriskChannelImpl channel;
        MeetMeRoomImpl room;
        MeetMeUserImpl user;

        roomNumber = event.getMeetMe();
        if (roomNumber == null)
        {
            logger.warn("RoomNumber (meetMe property) is null. Ignoring " + event.getClass().getName());
            return;
        }

        userNumber = event.getUserNum();
        if (userNumber == null)
        {
            logger.warn("UserNumber (userNum property) is null. Ignoring " + event.getClass().getName());
            return;
        }

        user = getOrCreateUserImpl(event);
        if (user == null)
        {
            return;
        }

        channel = user.getChannel();
        room = user.getRoom();

        if (event instanceof MeetMeLeaveEvent)
        {
            logger.info("Removing channel " + channel.getName() + " from room " + roomNumber);
            if (room != user.getRoom())
            {
                if (user.getRoom() != null)
                {
                    logger.error("Channel " + channel.getName() + " should be removed from room " + roomNumber
                            + " but is user of room " + user.getRoom().getRoomNumber());
                    user.getRoom().removeUser(user);
                }
                else
                {
                    logger.error("Channel " + channel.getName() + " should be removed from room " + roomNumber
                            + " but is user of no room");
                }
            }
            // Mmmm should remove from the room before firing PropertyChangeEvents ?
            user.left(event.getDateReceived());
            room.removeUser(user);
            channel.setMeetMeUserImpl(null);
        }
        else if (event instanceof MeetMeTalkingEvent)
        {
            Boolean status;

            status = ((MeetMeTalkingEvent) event).getStatus();
            if (status != null)
            {
                user.setTalking(status);
            }
            else
            {
                user.setTalking(true);
            }
        }
        else if (event instanceof MeetMeMuteEvent)
        {
            Boolean status;

            status = ((MeetMeMuteEvent) event).getStatus();
            if (status != null)
            {
                user.setMuted(status);
            }
        }
    }

    private void populateRoom(MeetMeRoomImpl room)
    {
        final CommandAction meetMeListAction;
        final ManagerResponse response;
        final List<String> lines;
        final Collection<Integer> userNumbers = new ArrayList<Integer>(); // list of user numbers in the room

        meetMeListAction = new CommandAction(MEETME_LIST_COMMAND + " " + room.getRoomNumber());
        try
        {
            response = server.sendAction(meetMeListAction);
        }
        catch (ManagerCommunicationException e)
        {
            logger.error("Unable to send \"" + MEETME_LIST_COMMAND + "\" command", e);
            return;
        }
        if (response instanceof ManagerError)
        {
            logger.error("Unable to send \"" + MEETME_LIST_COMMAND + "\" command: " + response.getMessage());
            return;
        }
        if (!(response instanceof CommandResponse))
        {
            logger.error("Response to \"" + MEETME_LIST_COMMAND + "\" command is not a CommandResponse but "
                    + response.getClass());
            return;
        }

        lines = ((CommandResponse) response).getResult();
        for (String line : lines)
        {
            final Matcher matcher;
            final Integer userNumber;
            final AsteriskChannelImpl channel;
            boolean muted = false;
            boolean talking = false;
            MeetMeUserImpl channelUser;
            MeetMeUserImpl roomUser;

            matcher = MEETME_LIST_PATTERN.matcher(line);
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
                final MeetMeUserImpl user;
                // using the current date as dateJoined is not correct but we
                // don't have anything that is better
                user = new MeetMeUserImpl(server, room, userNumber, channel, DateUtil.getDate());
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

        Collection<MeetMeUserImpl> users = room.getUserImpls();
        Collection<MeetMeUserImpl> usersToRemove = new ArrayList<MeetMeUserImpl>();
        for (MeetMeUserImpl user : users)
        {
            if (!userNumbers.contains(user.getUserNumber()))
            {
                // remove user as he is no longer in the room
                usersToRemove.add(user);
            }
        }
        for (MeetMeUserImpl user : usersToRemove)
        {
            user.left(DateUtil.getDate());
            room.removeUser(user);
            user.getChannel().setMeetMeUserImpl(null);
        }
    }

    private MeetMeUserImpl getOrCreateUserImpl(AbstractMeetMeEvent event)
    {
        final String roomNumber;
        final MeetMeRoomImpl room;
        final String uniqueId;
        final AsteriskChannelImpl channel;
        MeetMeUserImpl user;

        roomNumber = event.getMeetMe();
        room = getOrCreateRoomImpl(roomNumber);
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
        user = new MeetMeUserImpl(server, room, event.getUserNum(), channel, event.getDateReceived());
        room.addUser(user);
        channel.setMeetMeUserImpl(user);
        server.fireNewMeetMeUser(user);

        return user;
    }

    /**
     * Returns the room with the given number or creates a new one if none is
     * there yet.
     *
     * @param roomNumber number of the room to get or create.
     * @return the room with the given number.
     */
    MeetMeRoomImpl getOrCreateRoomImpl(String roomNumber)
    {
        MeetMeRoomImpl room;
        boolean created = false;

        synchronized (rooms)
        {
            room = rooms.get(roomNumber);
            if (room == null)
            {
                room = new MeetMeRoomImpl(server, roomNumber);
                populateRoom(room);
                rooms.put(roomNumber, room);
                created = true;
            }
        }

        if (created)
        {
            logger.debug("Created MeetMeRoom " + roomNumber);
        }

        return room;
    }
}
