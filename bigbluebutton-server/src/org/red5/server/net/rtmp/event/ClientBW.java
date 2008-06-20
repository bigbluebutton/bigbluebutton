package org.red5.server.net.rtmp.event;

import java.io.IOException;
import java.io.ObjectInput;
import java.io.ObjectOutput;
// TODO: Auto-generated Javadoc

/**
 * Client bandwidth event.
 */
public class ClientBW extends BaseEvent {
	
	/** The Constant serialVersionUID. */
	private static final long serialVersionUID = 5848656135751336839L;
    
    /** Bandwidth. */
	private int bandwidth;

    /** /XXX : what is this?. */
    private byte value2;

    /**
     * Instantiates a new client bw.
     */
    public ClientBW() {
    	super(Type.STREAM_CONTROL);
    }
	
	/**
	 * Instantiates a new client bw.
	 * 
	 * @param bandwidth the bandwidth
	 * @param value2 the value2
	 */
	public ClientBW(int bandwidth, byte value2) {
		this();
		this.bandwidth = bandwidth;
		this.value2 = value2;
	}

	/** {@inheritDoc} */
    @Override
	public byte getDataType() {
		return TYPE_CLIENT_BANDWIDTH;
	}

	/**
	 * Getter for property 'bandwidth'.
	 * 
	 * @return Value for property 'bandwidth'.
	 */
    public int getBandwidth() {
		return bandwidth;
	}

	/**
	 * Setter for bandwidth.
	 * 
	 * @param bandwidth  New bandwidth
	 */
    public void setBandwidth(int bandwidth) {
		this.bandwidth = bandwidth;
	}

	/**
	 * Getter for value2.
	 * 
	 * @return Value for property 'value2'.
	 */
    public byte getValue2() {
		return value2;
	}

	/**
	 * Setter for property 'value2'.
	 * 
	 * @param value2 Value to set for property 'value2'.
	 */
    public void setValue2(byte value2) {
		this.value2 = value2;
	}

	/** {@inheritDoc} */
    @Override
	public String toString() {
		return "ClientBW: " + bandwidth + " value2: " + value2;
	}

	/** {@inheritDoc} */
    @Override
	protected void releaseInternal() {

	}

	/* (non-Javadoc)
	 * @see org.red5.server.net.rtmp.event.BaseEvent#readExternal(java.io.ObjectInput)
	 */
	@Override
	public void readExternal(ObjectInput in) throws IOException, ClassNotFoundException {
		super.readExternal(in);
		bandwidth = in.readInt();
		value2 = in.readByte();
	}

	/* (non-Javadoc)
	 * @see org.red5.server.net.rtmp.event.BaseEvent#writeExternal(java.io.ObjectOutput)
	 */
	@Override
	public void writeExternal(ObjectOutput out) throws IOException {
		super.writeExternal(out);
		out.writeInt(bandwidth);
		out.writeByte(value2);
	}
}
