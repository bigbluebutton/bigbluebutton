package org.bigbluebutton.chat.messages;

public class SendMessageToChatFromAPI implements ISendToChatMsg{
    public String meetingId;
    public String name;
    public String message;
    public SendMessageToChatFromAPI(String meetingId, String name,
                                    String message){
        this.meetingId = meetingId;
        this.name = name;
        this.message = message;
    }
}
