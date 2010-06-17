package org.bigbluebutton.voice.conf.sip;

import org.red5.app.sip.codecs.Codec;

public class CallStreamFactory {
	private ScopeProvider scopeProvider;
	
	public CallStream createCallStream(Codec sipCodec, SipConnectInfo connInfo) {
		return new CallStream(sipCodec, connInfo, scopeProvider);
	}
	
	public void setScopeProvider(ScopeProvider scopeProvider) {
		this.scopeProvider = scopeProvider;
	}
}
