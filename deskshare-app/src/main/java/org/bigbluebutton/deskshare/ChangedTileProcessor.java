package org.bigbluebutton.deskshare;

import java.awt.Graphics2D;
import java.awt.image.BufferedImage;
import java.awt.image.WritableRaster;
import java.util.HashSet;
import java.util.Set;
import java.util.concurrent.BlockingQueue;
import java.util.concurrent.Executor;
import java.util.concurrent.Executors;
import java.util.concurrent.LinkedBlockingQueue;

import org.red5.logging.Red5LoggerFactory;
import org.slf4j.Logger;

public class ChangedTileProcessor {
	final private Logger log = Red5LoggerFactory.getLogger(ChangedTileProcessor.class, "deskshare");
	
	private final Executor exec = Executors.newSingleThreadExecutor();
	private BlockingQueue<CaptureUpdateEvent> queue = new LinkedBlockingQueue<CaptureUpdateEvent>();
	private Runnable eventHandler;
	private volatile boolean handleEvent = false;

	private Set<NewScreenListener> listeners = new HashSet<NewScreenListener>();
	private long lastUpdate;
	
	private BufferedImage capturedScreen;
	private Graphics2D graphics;
	
	public ChangedTileProcessor(int width, int height){
		this.capturedScreen = new BufferedImage(width, height, BufferedImage.TYPE_3BYTE_BGR);
		this.graphics = this.capturedScreen.createGraphics();
		
		lastUpdate = System.currentTimeMillis();
	}
	
	public void appendTile(BufferedImage tile, int x, int y){
		graphics.drawImage(tile, x, y, null);
	}

	public void stop() {
		handleEvent = false;
	}
	
	public void start() {
		handleEvent = true;
		eventHandler = new Runnable() {
			public void run() {
				while (handleEvent) {
					try {
						CaptureUpdateEvent event = queue.take();
						handleCaptureEvent(event);
					} catch (InterruptedException e) {
						log.warn("InterruptedExeption while taking event.");
					}
				}
			}
		};
		exec.execute(eventHandler);
	}
	
	private void handleCaptureEvent(CaptureUpdateEvent event) {
		BufferedImage image = event.getTile();
		appendTile(image, event.getX(), event.getY());	
		
		long now = System.currentTimeMillis();
		if ((now - lastUpdate) > 500) {
			log.debug("Creating new screen");
			notifyNewScreenListener(getNewScreen());
			lastUpdate = now;
		}		
	}
	
	private BufferedImage getNewScreen() { 
		/**
		 * Some kind of double-buffering (richard - aug 20, 2009)
		 * Make a true copy of the captured screen. BufferedImage.getSubImage just returns
		 * a reference to the capturedScreen, so when the tiles get updated we see the tiling
		 * on the client. Creating a copy prevents this and provides a cleaner experience.
		 */
		WritableRaster raster = capturedScreen.copyData( null );
		BufferedImage copy = new BufferedImage( capturedScreen.getColorModel(), raster, capturedScreen.isAlphaPremultiplied(), null );
		
		return copy;
	}
	
	public void accept(CaptureUpdateEvent event) {
		try {
			// Make a copy so we can process safely on our own thread.
			CaptureUpdateEvent copy = CaptureUpdateEvent.copy(event);
			queue.put(copy);
		} catch (InterruptedException e) {
			log.warn("InterruptedException while putting event into queue.");
		}
	}
	
	public void addNewScreenListener(NewScreenListener listener) {
		listeners.add(listener);
	}


	public void removeListener(NewScreenListener listener) {
		listeners.remove(listener);
	}
	
	private void notifyNewScreenListener(BufferedImage newScreen) {
    	for (NewScreenListener ctl : listeners) {
    		ctl.onNewScreen(newScreen);
    	}
    }
}
