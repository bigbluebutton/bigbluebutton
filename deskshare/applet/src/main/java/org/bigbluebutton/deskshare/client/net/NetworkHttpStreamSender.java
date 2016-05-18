/**
* BigBlueButton open source conferencing system - http://www.bigbluebutton.org/
* 
* Copyright (c) 2012 BigBlueButton Inc. and by respective authors (see below).
*
* This program is free software; you can redistribute it and/or modify it under the
* terms of the GNU Lesser General Public License as published by the Free Software
* Foundation; either version 3.0 of the License, or (at your option) any later
* version.
* 
* BigBlueButton is distributed in the hope that it will be useful, but WITHOUT ANY
* WARRANTY; without even the implied warranty of MERCHANTABILITY or FITNESS FOR A
* PARTICULAR PURPOSE. See the GNU Lesser General Public License for more details.
*
* You should have received a copy of the GNU Lesser General Public License along
* with BigBlueButton; if not, see <http://www.gnu.org/licenses/>.
*
*/
package org.bigbluebutton.deskshare.client.net;

import java.awt.Point;
import java.io.ByteArrayInputStream;
import java.io.IOException;

import java.net.HttpURLConnection;
import java.net.MalformedURLException;
import java.net.URL;
import java.net.URLConnection;

import org.bigbluebutton.deskshare.client.ExitCode;
import org.bigbluebutton.deskshare.common.CaptureEvents;
import org.bigbluebutton.deskshare.common.Dimension;

import com.myjavatools.web.ClientHttpRequest;

import java.util.Date;
import java.text.SimpleDateFormat;

public class NetworkHttpStreamSender implements Runnable {	
	private static final String SEQ_NUM = "sequenceNumber";
	private static final String ROOM = "room";
	private static final String BLOCK = "blockInfo";
	private static final String EVENT = "event";
	private static final String SCREEN = "screenInfo";
	private static final String POSITION = "position";
	private static final String KEYFRAME = "keyframe";
	private static final String BLOCKDATA = "blockdata";
	private static final String MOUSEX = "mousex";
	private static final String MOUSEY = "mousey";
   private static final String BLOCKGROUP = "blockgroup";

   // The previously sent location of the mouse pointer
   private static Point previousMouseLocation = new Point(0,0);

	private static final String USE_SVC2 = "svc2";
	
	private String host = "localhost";
	private static final String SCREEN_CAPTURE__URL = "/deskshare/tunnel/screenCapture";
	private URL url;
	private URLConnection conn;
	private String room;
	private Dimension screenDim;
	private Dimension blockDim;
	private boolean useSVC2;
	private final NextBlockRetriever retriever;
	private volatile boolean processBlocks = false;
	private final int id;
	private NetworkStreamListener listener;
	private final SequenceNumberGenerator seqNumGenerator;
	
	public NetworkHttpStreamSender(int id, NextBlockRetriever retriever, String room, 
									Dimension screenDim, Dimension blockDim, SequenceNumberGenerator seqNumGenerator, boolean useSVC2) {
		this.id = id;
		this.retriever = retriever;
		this.room = room;
		this.screenDim = screenDim;
		this.blockDim = blockDim;
		this.seqNumGenerator = seqNumGenerator;
		this.useSVC2 = useSVC2;
	}
	
	public void addListener(NetworkStreamListener listener) {
		this.listener = listener;
	}
	
	private void notifyNetworkStreamListener(ExitCode reason) {
		if (listener != null) listener.networkException(id,reason);
	}
	
	public void connect(String host) throws ConnectionException {
		this.host = host;
		System.out.println("Starting NetworkHttpStreamSender to " + host);
		openConnection();
	}

	private void openConnection() throws ConnectionException {
		/**
		 * Need to re-establish connection each time, otherwise, 
		 * we get java.net.ProtocolException: Cannot write output after reading input.
		 * 
		 * http://bugs.sun.com/bugdatabase/view_bug.do?bug_id=4382944
		 * 
		 */				
		long start = System.currentTimeMillis();
		try {			
			url = new URL("http://" + host + SCREEN_CAPTURE__URL);
			conn = url.openConnection();
		} catch (MalformedURLException e) {
			e.printStackTrace();
			throw new ConnectionException("MalformedURLException " + url.toString());
		} catch (IOException e) {
			e.printStackTrace();
			throw new ConnectionException("IOException while connecting to " + url.toString());
		}
		long end = System.currentTimeMillis();
		System.out.println("Http[" + id + "] Open connection took [" + (end-start) + " ms]");
	}
	
	public void sendStartStreamMessage() {
		try {
			System.out.println("Http[" + id + "] Open connection. In sendStartStreamMessage");
			openConnection();
			sendCaptureStartEvent(screenDim, blockDim);
		} catch (ConnectionException e) {
			e.printStackTrace();
			notifyNetworkStreamListener(ExitCode.DESKSHARE_SERVICE_UNAVAILABLE);
		}
	}

	private void sendCaptureStartEvent(Dimension screen, Dimension block) throws ConnectionException {
		ClientHttpRequest chr;
		try {
			chr = new ClientHttpRequest(conn);
			chr.setParameter(ROOM, room);			
			chr.setParameter(SEQ_NUM, seqNumGenerator.getNext());
			String screenInfo = Integer.toString(screen.getWidth()) + "x" + Integer.toString(screen.getHeight());
			chr.setParameter(SCREEN, screenInfo);			
			String blockInfo = Integer.toString(block.getWidth()) + "x" + Integer.toString(block.getHeight());
			chr.setParameter(BLOCK, blockInfo);
			chr.setParameter(EVENT, CaptureEvents.CAPTURE_START.getEvent());
			chr.setParameter(USE_SVC2, Boolean.toString(useSVC2));
			chr.post();
		} catch (IOException e) {
			e.printStackTrace();
			throw new ConnectionException("IOException while sending capture start event.");
		}

	}
	
	public void disconnect() throws ConnectionException {
		try {
			System.out.println("Http[" + id + "] Open connection. In disconnect");
			openConnection();
			sendCaptureEndEvent();
		} catch (ConnectionException e) {
			e.printStackTrace();
			notifyNetworkStreamListener(ExitCode.DESKSHARE_SERVICE_UNAVAILABLE);
			throw e;			
		} finally {
			processBlocks = false;
		}
	}

	private void sendCaptureEndEvent() throws ConnectionException {
		ClientHttpRequest chr;
		try {
			chr = new ClientHttpRequest(conn);
			chr.setParameter(ROOM, room);
			chr.setParameter(SEQ_NUM, seqNumGenerator.getNext());
			chr.setParameter(EVENT, CaptureEvents.CAPTURE_END.getEvent());
			chr.post();
		} catch (IOException e) {
			e.printStackTrace();
			throw new ConnectionException("IOException while sending capture end event.");
		}
	}

  private void processNextMessageToSend(Message message) {

    if (message.getMessageType() == Message.MessageType.BLOCK) {

      long start = System.currentTimeMillis();
      Integer[] changedBlocks = ((BlockMessage) message).getBlocks();
      String blockSize = "Http[" + id + "] Block length [";
      String encodeTime = "Http[" + id + "]Encode times [";
      long encStart = 0;
      long encEnd = 0;
      int totalBytes = 0;
      long totalMillis = 0;

      ClientHttpRequest chr;

      try {

        // Open a connection to the web server and create a request that has
        // the room and event type.
        System.out.println(getTimeStamp() + " Http[" + id + "] Open connection. In sendBlockData");
        openConnection();
        chr = new ClientHttpRequest(conn);
        chr.setParameter(ROOM, room);
        chr.setParameter(EVENT, CaptureEvents.CAPTURE_UPDATE.getEvent());

        //+++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++
        // For each changed block, append an uploaded-file entry to the form data.
        // The file name contains the block info.  The file name has this format:
        // "blockgroup_<seqnum>_<position>".  The original filename is just set to
        // "block<i>".
        //+++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++
        for (int i = 0; i < changedBlocks.length; i++) 
        { // append each changed-block to the form

          EncodedBlockData block = retriever.getBlockToSend((Integer) changedBlocks[i]);
          String changed_blocks_upload_filename = 
                  BLOCKGROUP + "_" + seqNumGenerator.getNext() + "_" + block.getPosition();
          
          chr.setParameter(changed_blocks_upload_filename, "block"+i, new ByteArrayInputStream(block.getVideoData()));

        } // append each changed-block to the form

        // Post the multi-part form to the server
        chr.post();
        HttpURLConnection httpConnection = (HttpURLConnection) chr.connection;
        int status = httpConnection.getResponseCode();
        
        System.out.println("******* POST status = [" + status + "] ***************");
        
        System.out.println(blockSize + "] total=" + totalBytes + " bytes");
        System.out.println(encodeTime + "] total=" + totalMillis + " ms");
        for (int i = 0; i < changedBlocks.length; i++) {
          retriever.blockSent((Integer) changedBlocks[i]);
        }
        long end = System.currentTimeMillis();
        System.out.println("[HTTP " + id + "] Sending " + changedBlocks.length + " blocks took " + (end - start) + " millis");

      } catch (java.io.FileNotFoundException e) {
        System.out.println("java.io.FileNotFoundException: While sending block data.");
        e.printStackTrace();
        listener.networkException(1, ExitCode.CONNECTION_TO_DESKSHARE_SERVER_DROPPED);
      } catch (IOException e) {
        System.out.println("IOException: While sending block data.");
        e.printStackTrace();
        listener.networkException(1, ExitCode.CONNECTION_TO_DESKSHARE_SERVER_DROPPED);
      } catch (ConnectionException e) {
        System.out.println("ERROR: Failed to send block data.");
      }

      }
      else if (message.getMessageType() == Message.MessageType.CURSOR)
      {

        CursorMessage msg = (CursorMessage) message;

        //++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++
        // If the mouse has changed location from the previous time sent,
        // then send its new location.
        //++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++
        if (!msg.getMouseLocation().equals(previousMouseLocation))
        {
           System.out.println("SEND MOUSE: old=" + previousMouseLocation + " new=" + msg.getMouseLocation());
           previousMouseLocation = msg.getMouseLocation();
           sendCursor(previousMouseLocation, msg.getRoom());
        }

    }



	}

	private void processNextMessageToSend_OLD(Message message) {
		if (message.getMessageType() == Message.MessageType.BLOCK) {	
			long start = System.currentTimeMillis();
			Integer[] changedBlocks = ((BlockMessage)message).getBlocks();
			String blockSize = "Http[" + id + "] Block length [";
			String encodeTime = "Http[" + id + "]Encode times [";
			long encStart = 0;
			long encEnd = 0;
			int totalBytes = 0;
			long totalMillis = 0;
			for (int i = 0; i < changedBlocks.length; i++) {
				encStart = System.currentTimeMillis();
				EncodedBlockData block = retriever.getBlockToSend((Integer)changedBlocks[i]);
				totalBytes += block.getVideoData().length;
				blockSize += block.getVideoData().length + ",";
				encEnd = System.currentTimeMillis();
				totalMillis += (encEnd - encStart);
				encodeTime += (encEnd - encStart) + ",";
				BlockVideoData	bv = new BlockVideoData(room, block.getPosition(), block.getVideoData(), false /* should remove later */);	
				sendBlockData(bv);
			}
			System.out.println(blockSize + "] total=" + totalBytes + " bytes");
			System.out.println(encodeTime + "] total=" + totalMillis + " ms");
			for (int i = 0; i< changedBlocks.length; i++) {
				retriever.blockSent((Integer)changedBlocks[i]);
			}
			long end = System.currentTimeMillis();
			System.out.println("[HTTP " + id + "] Sending " + changedBlocks.length + " blocks took " + (end - start) + " millis");
		} else if (message.getMessageType() == Message.MessageType.CURSOR) {
			CursorMessage msg = (CursorMessage)message;
			sendCursor(msg.getMouseLocation(), msg.getRoom());
		}
	}

   // NEW
   public void stopProcessingBlocks() { processBlocks = false; }


	public void run() {
		processBlocks = true;
		
		while (processBlocks) {
			Message message;
			try {
				message = retriever.getNextMessageToSend();
				processNextMessageToSend(message);
			} catch (InterruptedException e) {
				e.printStackTrace();
				notifyNetworkStreamListener(ExitCode.DESKSHARE_SERVICE_UNAVAILABLE);
				processBlocks = false;
			}								
		}
	}
	
	private void sendCursor(Point mouseLoc, String room) {
		ClientHttpRequest chr;
		try {
			System.out.println("Http[" + id + "] Open connection. In sendCursor");
			openConnection();
			chr = new ClientHttpRequest(conn);
			chr.setParameter(ROOM, room);
			chr.setParameter(SEQ_NUM, seqNumGenerator.getNext());
			chr.setParameter(EVENT, CaptureEvents.MOUSE_LOCATION_EVENT.getEvent());
			chr.setParameter(MOUSEX, mouseLoc.x);
			chr.setParameter(MOUSEY, mouseLoc.y);
			chr.post();		
			} catch (IOException e) {
				e.printStackTrace();
			} catch (ConnectionException e) {
				System.out.println("ERROR: Failed to send block data.");
			}
	}

        private String getTimeStamp() 
        { 
         SimpleDateFormat sdfDate = new SimpleDateFormat("yyyy-MM-dd HH:mm:ss.SSSS");//dd/MM/yyyy
    Date now = new Date();
    String strDate = sdfDate.format(now);
    return strDate; 
        }
	
	private void sendBlockData(BlockVideoData blockData) {
		long start = System.currentTimeMillis();
	    ClientHttpRequest chr;
		try {
			System.out.println(getTimeStamp()+ " Http[" + id + "] Open connection. In sendBlockData");
			openConnection();
			chr = new ClientHttpRequest(conn);
		    chr.setParameter(ROOM, blockData.getRoom());
		    chr.setParameter(SEQ_NUM, seqNumGenerator.getNext());
		    chr.setParameter(POSITION, blockData.getPosition());
		    chr.setParameter(KEYFRAME, blockData.isKeyFrame());
		    chr.setParameter(EVENT, CaptureEvents.CAPTURE_UPDATE.getEvent());
			ByteArrayInputStream block = new ByteArrayInputStream(blockData.getVideoData());				
			chr.setParameter(BLOCKDATA, "block", block);
			chr.post();
               //         try {
               //         Thread.sleep(1000);
               //         }
               //         catch (InterruptedException e)
               //         { }
		
		} catch (IOException e) {
			e.printStackTrace();
		} catch (ConnectionException e) {
			System.out.println("ERROR: Failed to send block data.");
		}
		long end = System.currentTimeMillis();
		System.out.println(getTimeStamp() + " [HTTP " + id + "] Sending " + blockData.getVideoData().length + " bytes took " + (end - start) + " ms");
	}		
}
