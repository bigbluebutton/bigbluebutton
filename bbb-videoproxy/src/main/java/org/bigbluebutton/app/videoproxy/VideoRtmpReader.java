package org.bigbluebutton.app.videoproxy;

import java.util.ArrayList;
import java.util.Date;
import java.util.List;


import org.slf4j.Logger;
import org.slf4j.LoggerFactory;



import com.flazr.rtmp.RtmpReader;
import com.flazr.rtmp.message.Metadata;
import com.flazr.rtmp.message.Video;

public class VideoRtmpReader implements RtmpReader {

	private static final Logger log = LoggerFactory.getLogger(VideoRtmpReader.class);
	
	 	
	private List<Video> framesList;
	
	    
    
    private String streamName;
    private int width;
    private int height;
    private static final int START = 0;
    private static final int STOP = 1;

    public int state;
    
    
    
	
	        
    public VideoRtmpReader(String streamName, int width, int height) {
        state = START;
        this.streamName = streamName;	
        this.width = width;
        this.height = height;
        framesList = new ArrayList<Video>();
        System.out.println("INITIALIZED");
    }
    
    /*
    public int onReadyFrame (int bufferSize, int timestamp)
    {    	
    	if(firstTimestamp == 0){
    		firstTimestamp = timestamp;
    	}    	
    	timestamp = timestamp - firstTimestamp;
    	int interval = timestamp - lastTimestamp;
    	lastTimestamp = timestamp;
    	
    	byte[] aux = new byte[bufferSize];
    	System.arraycopy(sharedBuffer, 0, aux, 0, bufferSize); //\TODO see if we can avoid this copy
    	
       	Video video = new Video(timestamp, aux, bufferSize);
   	    video.getHeader().setDeltaTime(interval);

   	    if (framesListAvailable) {
   	    	framesList.add(video);
			if (firstFrameWrote) {
				firstFrameWrote = false;
				videoPublishHandler.fireFirstFrame();
			}
			synchronized(this) {
				this.notifyAll();
			}
   	    }
    	return 0;
    }
    */

    public void addFrame(Video video) {
        synchronized(this) {
           framesList.add(video);
           this.notifyAll();
        }
     
    }

	@Override
	public void close() {		
        System.out.println("CLOSED CLOSED");
		if(framesList != null){
			framesList.clear();
		}
		framesList = null;
	}

	@Override
	public Metadata getMetadata() {
		return null;
	}

	@Override
	public Video[] getStartMessages() {
		Video[] startMessages = new Video[0];
        return startMessages;
	}

	@Override
	public long getTimePosition() {
		return 0;
	}

	@Override
	public boolean hasNext() {
        synchronized(this) {
            if(framesList.isEmpty())
                        try {
                                this.wait();
                        } catch (InterruptedException e) {
                                e.printStackTrace();
                        }
        }

		if(state == START)
            return true;
        else
            return false;
	}

	@Override
	public Video next() {
        synchronized(this) {
            if(framesList != null && !framesList.isEmpty())
                return framesList.remove(0);
            else
                return new Video();
        }
	}

	@Override
	public long seek(long timePosition) {
		return 0;
	}

	@Override
	public void setAggregateDuration(int targetDuration) {
	}
	
	@Override
	public int getWidth() {
		return width;
	}

	@Override
	public int getHeight() {
		return height;
	}

	public void setHeight(int height) {
		this.height = height;
	}

	public void setWidth(int width) {
		this.width = width;
	}
}