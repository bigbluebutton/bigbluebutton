package org.bigbluebutton.core;

import org.bigbluebutton.core.messages.Message;

public interface BigBlueButtonApp {

	public void handleMessage(Message message);
}
