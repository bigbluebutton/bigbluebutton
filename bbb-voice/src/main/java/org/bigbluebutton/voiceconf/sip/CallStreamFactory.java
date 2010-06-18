package org.bigbluebutton.voiceconf.sip;

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
