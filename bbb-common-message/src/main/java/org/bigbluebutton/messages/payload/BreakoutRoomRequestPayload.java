package org.bigbluebutton.messages.payload;

import java.util.ArrayList;

public class BreakoutRoomRequestPayload {
    // Name of the breakout room
    public final String name;
    // Sequence of the breakout room
    public final Integer sequence;
    // List of user ids to assign to the breakout room
    public final ArrayList<String> users;

    public BreakoutRoomRequestPayload(String name, Integer sequence, ArrayList<String> users) {
        this.name = name;
        this.sequence = sequence;
        this.users = users;
    }
}
