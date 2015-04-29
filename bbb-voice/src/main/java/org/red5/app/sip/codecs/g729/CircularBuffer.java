package org.red5.app.sip.codecs.g729;
//package org.mobicents.media.server.impl.dsp.audio.g729;

/**
 * This is just a buffer that stores temporary info. FIFO/old info get's overwritten.
 * Used to compensate irregularly delivered RTP packets.
 * 
 * @author vralev
 *
 */
public class CircularBuffer {
	
	private byte[] buffer;
	private int cursor = 0;
	private int availableData = 0;
	
	public CircularBuffer(int size) {
		buffer = new byte[size];
	}
	
	synchronized public void addData(byte[] data) {
		boolean zeros = false;
		//for(int q=0; q<data.length; q++) if(data[q]!=0) zeros = false;
		if(!zeros) {
			for(int q=0; q<data.length; q++) {
				buffer[(cursor+q)%buffer.length] = data[q];
			}
			availableData += data.length;
			if(availableData > buffer.length) availableData = buffer.length;
		}
	}
	
	synchronized public byte[] getData(int size) {
		if(availableData<size) return null;
		
		byte[] data = new byte[size];
		for(int q=0; q<data.length; q++) {
			data[q] = buffer[(cursor+q)%buffer.length];
		}
		cursor = (cursor + data.length)%buffer.length;
		availableData -= size;
		return data;
	}

}
