package org.bigbluebutton.webconference.voice.asterisk.meetme.commands;

import java.util.List;
import java.util.regex.Pattern;

import org.asteriskjava.manager.action.CommandAction;
import org.asteriskjava.manager.response.CommandResponse;
import org.asteriskjava.manager.response.ManagerResponse;
import org.bigbluebutton.webconference.voice.asterisk.meetme.MeetMeEventHandler;

public class GetParticipantsCommand extends MeetMeCommand {
	private static final Pattern MEETME_LIST_PATTERN = Pattern.compile("^User #: ([0-9]+).*Channel: (\\S+).*$");
	
	public GetParticipantsCommand(String room, Integer requesterId) {
		super(room, requesterId);
	}

	@Override
	public CommandAction getCommandAction() {
		return new CommandAction("meetme list " + room);
	}

	@Override
	public void handleResponse(ManagerResponse response, MeetMeEventHandler eventHandler) {
		final CommandAction meetMeListAction;
        final List<String> lines;
      
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

}
