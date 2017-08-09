package org.bigbluebutton.api.messaging;

import org.bigbluebutton.api.messaging.messages.IMessage;

public class ReceivedMessage {
  private final IMessage message;

  public ReceivedMessage(IMessage message) {

    this.message = message;
  }

  public IMessage getMessage() {
    return message;
  }
}
