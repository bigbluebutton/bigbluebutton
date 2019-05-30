package org.bigbluebutton.freeswitch.voice.freeswitch.actions;

import org.bigbluebutton.freeswitch.voice.events.ConferenceEventListener;
import org.freeswitch.esl.client.transport.message.EslMessage;

import java.util.Iterator;

public class ConferenceCheckRecordCommand extends FreeswitchCommand {

  public ConferenceCheckRecordCommand(String room, String requesterId) {
    super(room, requesterId);
  }

  @Override
  public String getCommandArgs() {
    return room + " chkrecord";
  }

  public void handleResponse(EslMessage response, ConferenceEventListener eventListener) {

    Iterator iterator = response.getBodyLines().iterator();
    while(iterator.hasNext()) {
      System.out.println(iterator.next());
    }
  }
}
