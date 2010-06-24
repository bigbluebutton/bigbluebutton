package org.bigbluebutton.voiceconf.red5;

import org.bigbluebutton.voiceconf.red5.media.CallStream;
import org.bigbluebutton.voiceconf.sip.SipConnectInfo;
import org.red5.app.sip.codecs.Codec;
import org.red5.server.api.IScope;

public class CallStreamFactory {
	private IScope scope;
	
	public CallStream createCallStream(Codec sipCodec, SipConnectInfo connInfo) {
		return new CallStream(sipCodec, connInfo, scope);
	}
	
	public void setScope(IScope scope) {
		this.scope = scope;
	}
}
