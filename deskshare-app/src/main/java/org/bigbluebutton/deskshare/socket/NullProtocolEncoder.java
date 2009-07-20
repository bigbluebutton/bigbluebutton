package org.bigbluebutton.deskshare.socket;

import org.apache.mina.core.session.IoSession;
import org.apache.mina.filter.codec.ProtocolEncoder;
import org.apache.mina.filter.codec.ProtocolEncoderOutput;

public class NullProtocolEncoder implements ProtocolEncoder {

	public void dispose(IoSession in) throws Exception {
		// TODO Auto-generated method stub

	}

	public void encode(IoSession session, Object message, ProtocolEncoderOutput out)
			throws Exception {
		// TODO Auto-generated method stub

	}

}
