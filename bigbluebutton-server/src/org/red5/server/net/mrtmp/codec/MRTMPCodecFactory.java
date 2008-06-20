package org.red5.server.net.mrtmp.codec;

import org.apache.mina.filter.codec.ProtocolCodecFactory;
import org.apache.mina.filter.codec.ProtocolDecoder;
import org.apache.mina.filter.codec.ProtocolEncoder;

// TODO: Auto-generated Javadoc
/**
 * A factory for creating MRTMPCodec objects.
 */
public class MRTMPCodecFactory implements ProtocolCodecFactory {
	
	/** The decoder. */
	private ProtocolDecoder decoder = new MRTMPProtocolDecoder();
	
	/** The encoder. */
	private ProtocolEncoder encoder = new MRTMPProtocolEncoder();

	/* (non-Javadoc)
	 * @see org.apache.mina.filter.codec.ProtocolCodecFactory#getDecoder()
	 */
	public ProtocolDecoder getDecoder() throws Exception {
		return decoder;
	}

	/* (non-Javadoc)
	 * @see org.apache.mina.filter.codec.ProtocolCodecFactory#getEncoder()
	 */
	public ProtocolEncoder getEncoder() throws Exception {
		return encoder;
	}

}
