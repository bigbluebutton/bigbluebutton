package org.bigbluebutton.deskshare.client;

import org.bigbluebutton.deskshare.client.blocks.ChangedBlocksListener;
import org.bigbluebutton.deskshare.client.net.BlockMessage;
import org.bigbluebutton.deskshare.client.net.NetworkStreamSender;

public class ChangedBlockListenerImp implements ChangedBlocksListener {

	private final NetworkStreamSender sender;
	
	public ChangedBlockListenerImp(NetworkStreamSender sender) {
		this.sender = sender;
	}
	
	@Override
	public void onChangedBlock(BlockMessage blockPosition) {
		sender.send(blockPosition);
	}

}
