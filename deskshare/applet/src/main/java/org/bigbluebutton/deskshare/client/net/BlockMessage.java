package org.bigbluebutton.deskshare.client.net;

public class BlockMessage implements Message {

	private int position;
	
	public BlockMessage(int position) {
		this.position = position;
	}
	
	@Override
	public MessageType getMessageType() {
		return MessageType.BLOCK;
	}

	public int getPosition() {
		return position;
	}
}
