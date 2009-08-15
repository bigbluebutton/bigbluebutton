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

import java.util.Date;

import org.asteriskjava.live.ManagerCommunicationException;
import org.asteriskjava.live.MeetMeUser;
import org.asteriskjava.live.MeetMeUserState;
import org.asteriskjava.manager.action.CommandAction;

class MeetMeUserImpl extends AbstractLiveObject implements MeetMeUser
{
    private static final String COMMAND_PREFIX = "meetme";
    private static final String MUTE_COMMAND = "mute";
    private static final String UNMUTE_COMMAND = "unmute";
    private static final String KICK_COMMAND = "kick";

    private final MeetMeRoomImpl room;
    private final Integer userNumber;
    private final AsteriskChannelImpl channel;
    private final Date dateJoined;

    private Date dateLeft;
    private MeetMeUserState state;
    private boolean talking;
    private boolean muted;

    MeetMeUserImpl(AsteriskServerImpl server, MeetMeRoomImpl room, Integer userNumber,
            AsteriskChannelImpl channel, Date dateJoined)
    {
        super(server);
        this.room = room;
        this.userNumber = userNumber;
        this.channel = channel;
        this.dateJoined = dateJoined;
        this.state = MeetMeUserState.JOINED;
    }

    public MeetMeRoomImpl getRoom()
    {
        return room;
    }

    public Integer getUserNumber()
    {
        return userNumber;
    }

    public AsteriskChannelImpl getChannel()
    {
        return channel;
    }

    public Date getDateJoined()
    {
        return dateJoined;
    }

    public Date getDateLeft()
    {
        return dateLeft;
    }

    /**
     * Sets the status to {@link MeetMeUserState#LEFT} and dateLeft to the given date.
     * 
     * @param dateLeft the date this user left the room.
     */
    void left(Date dateLeft)
    {
        MeetMeUserState oldState;
        synchronized (this)
        {
            oldState = this.state;
            this.dateLeft = dateLeft;
            this.state = MeetMeUserState.LEFT;
        }
        firePropertyChange(PROPERTY_STATE, oldState, state);
    }

    public MeetMeUserState getState()
    {
        return state;
    }

    public boolean isTalking()
    {
        return talking;
    }

    void setTalking(boolean talking)
    {
        boolean oldTalking = this.talking;
        this.talking = talking;
        firePropertyChange(PROPERTY_TALKING, oldTalking, talking);
    }

    public boolean isMuted()
    {
        return muted;
    }

    void setMuted(boolean muted)
    {
        boolean oldMuted = this.muted;
        this.muted = muted;
        firePropertyChange(PROPERTY_MUTED, oldMuted, muted);
    }

    // action methods

    public void kick() throws ManagerCommunicationException
    {
        sendMeetMeUserCommand(KICK_COMMAND);
    }

    public void mute() throws ManagerCommunicationException
    {
        sendMeetMeUserCommand(MUTE_COMMAND);
    }

    public void unmute() throws ManagerCommunicationException
    {
        sendMeetMeUserCommand(UNMUTE_COMMAND);
    }

    private void sendMeetMeUserCommand(String command) throws ManagerCommunicationException
    {
        StringBuffer sb = new StringBuffer();
        sb.append(COMMAND_PREFIX);
        sb.append(" ");
        sb.append(command);
        sb.append(" ");
        sb.append(room.getRoomNumber());
        sb.append(" ");
        sb.append(userNumber);

        server.sendAction(new CommandAction(sb.toString()));
    }
    
    @Override
   public String toString()
    {
        StringBuffer sb;
        int systemHashcode;

        sb = new StringBuffer("MeetMeUser[");

        synchronized (this)
        {
            sb.append("dateJoined='").append(getDateJoined()).append("',");
            sb.append("dateLeft='").append(getDateLeft()).append("',");
            sb.append("talking=").append(isTalking()).append(",");
            sb.append("muted=").append(isMuted()).append(",");
            sb.append("room=").append(room).append(",");
            systemHashcode = System.identityHashCode(this);
        }
        sb.append("channel=AsteriskChannel[");
        synchronized (channel)
        {
            sb.append("id='").append(channel.getId()).append("',");
            sb.append("name='").append(channel.getName()).append("'],");
        }
        sb.append("systemHashcode=").append(systemHashcode);
        sb.append("]");

        return sb.toString();
    }
}
