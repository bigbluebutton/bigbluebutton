package org.asteriskjava.live;

import java.util.Collection;

public class MeetMeTest extends AsteriskServerTestCase
{
    public void testMeetMeRoom() throws Exception
    {
        server.originateToExtension("Local/1201@basa", "conference", "1000", 1, 5000L);
        
        server.getMeetMeRoom("1000");
        printRooms();
        System.out.println("waiting...");
        Thread.sleep(20000);
        printRooms();
    }
    
    private void printRooms() throws Exception
    {
        Collection<MeetMeRoom> rooms;
        rooms = server.getMeetMeRooms();
        for (MeetMeRoom room : rooms)
        {
            System.out.println(room);
            for (MeetMeUser user : room.getUsers())
            {
                System.out.println("  " + user);
            }
        }
    }
}
