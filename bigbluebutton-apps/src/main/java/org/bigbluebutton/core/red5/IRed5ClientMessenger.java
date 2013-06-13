package org.bigbluebutton.core.red5;

import org.bigbluebutton.conference.meeting.messaging.red5.ClientMessage;
import org.red5.server.api.scope.IScope;

public interface IRed5ClientMessenger {
	void setAppScope(IScope scope);
	void sendMessage(final ClientMessage message);
}
