package org.red5.server.net.rtmp.event;

// TODO: Auto-generated Javadoc
/**
 * Flex method invocation. To be implemented.
 */
public class FlexMessage extends Invoke {
	
	/** The Constant serialVersionUID. */
	private static final long serialVersionUID = 1854760132754344723L;

	/**
	 * Instantiates a new flex message.
	 */
	public FlexMessage() {
		super();
	}
	
	/** {@inheritDoc} */
    @Override
	public byte getDataType() {
		return TYPE_FLEX_MESSAGE;
	}

}
