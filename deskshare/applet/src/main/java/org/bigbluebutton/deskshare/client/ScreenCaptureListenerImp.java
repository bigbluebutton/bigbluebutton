package org.bigbluebutton.deskshare.client;

import java.awt.image.BufferedImage;

import org.bigbluebutton.deskshare.client.blocks.BlockManager;

public class ScreenCaptureListenerImp implements ScreenCaptureListener {

	private final BlockManager blockManager;
	
	public ScreenCaptureListenerImp(BlockManager blockManager) {
		this.blockManager = blockManager;
	}
	
	@Override
	public void onScreenCaptured(BufferedImage screen) {
		blockManager.processCapturedScreen(screen);				
	}

}
