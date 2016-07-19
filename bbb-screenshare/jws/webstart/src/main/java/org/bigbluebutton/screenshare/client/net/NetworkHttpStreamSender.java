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
package org.bigbluebutton.screenshare.client.net;

import java.io.IOException;
import java.net.HttpURLConnection;
import java.net.MalformedURLException;
import java.net.URL;
import java.net.URLConnection;
import org.bigbluebutton.screenshare.client.ExitCode;
import com.myjavatools.web.ClientHttpRequest;
import java.util.Date;
import java.util.concurrent.BlockingQueue;
import java.util.concurrent.ExecutorService;
import java.util.concurrent.Executors;
import java.util.concurrent.LinkedBlockingQueue;
import java.text.SimpleDateFormat;
import javax.net.ssl.HttpsURLConnection;

public class NetworkHttpStreamSender {	
  private static final String SEQ_NUM = "sequenceNumber";
  private static final String MEETING_ID = "meetingId";
  private static final String STREAM_ID = "streamId";
  
  private static final String EVENT = "event";
  private static final String SCREEN = "screenInfo";
	
  private String host = "localhost";
  private static final String SCREEN_CAPTURE__URL = "/tunnel/screenCapture";
  private URL url;
  private URLConnection conn;
  private String meetingId;
  private String streamId;
  private NetworkStreamListener listener;
  private final SequenceNumberGenerator seqNumGenerator;
  private volatile boolean startSendingMessage = false;

  private ExecutorService executor;   
  private final BlockingQueue<Message> messages = new LinkedBlockingQueue<Message>();
  private volatile boolean sendMessages = false;
  
  public NetworkHttpStreamSender(String meetingId, String streamId, SequenceNumberGenerator seqNumGenerator) {
    this.meetingId = meetingId;
    this.streamId = streamId;
    this.seqNumGenerator = seqNumGenerator;
    
    executor = Executors.newFixedThreadPool(1);
  }

  public void addListener(NetworkStreamListener listener) {
    this.listener = listener;
  }

  private void notifyNetworkStreamListener(ExitCode reason) {
    if (listener != null) listener.networkException(reason);
  }

  public void connect(String host) throws ConnectionException {
    this.host = host;
    //System.out.println("Starting NetworkHttpStreamSender to " + host);
    //openConnection();
  }

  public void send(Message message) {
    messages.offer(message);
  }
  
  public void start() {
    sendMessages = true;
    Runnable sender = new Runnable() {
        public void run() {
            while (sendMessages) {
              Message message;
                try {
                    message = messages.take();
                    sendMessageToServer(message);   
                } catch (InterruptedException e) {
                    // TODO Auto-generated catch block
                    e.printStackTrace();
                }
                                
            }
        }
    };
    executor.execute(sender);           
  }
  
  private void sendMessageToServer(Message message) {
    if (message.getMessageType() == Message.MessageType.UPDATE) {
      if (startSendingMessage) {
        sendUpdateMessage((ShareUpdateMessage) message);
      }
    } else if (message.getMessageType() == Message.MessageType.STARTED) {
      startSendingMessage = true;
      sendStartStreamMessage((ShareStartedMessage)message);
    } else if (message.getMessageType() == Message.MessageType.STOPPED) {
      sendCaptureEndEvent();
      startSendingMessage = false;
    }
  }
  
  public void stop() {
    sendMessages = false;
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
      url = new URL(host + SCREEN_CAPTURE__URL);
      if (host.toLowerCase().startsWith("https://")) {
        conn = (HttpsURLConnection)url.openConnection();
      } else {
        conn = url.openConnection();
      }
    } catch (MalformedURLException e) {
      e.printStackTrace();
      throw new ConnectionException("MalformedURLException " + url.toString());
    } catch (IOException e) {
      e.printStackTrace();
      throw new ConnectionException("IOException while connecting to " + url.toString());
    }
    long end = System.currentTimeMillis();
    //System.out.println("Http Open connection took [" + (end-start) + " ms]");
  }

  private void sendStartStreamMessage(ShareStartedMessage message) {
    try {
      System.out.println("Http Open connection. In sendStartStreamMessage");
      openConnection();
      sendCaptureStartEvent(message.width, message.height);
    } catch (ConnectionException e) {
      e.printStackTrace();
      notifyNetworkStreamListener(ExitCode.DESKSHARE_SERVICE_UNAVAILABLE);
    }
  }

  private void sendCaptureStartEvent(int width, int height) throws ConnectionException {
    ClientHttpRequest chr;
    try {
      System.out.println(getTimeStamp() + " - Sending Start Sharing Event.");
      chr = new ClientHttpRequest(conn);
      chr.setParameter(MEETING_ID, meetingId);	
      chr.setParameter(STREAM_ID, streamId);
      chr.setParameter(SEQ_NUM, seqNumGenerator.getNext());
      String screenInfo = Integer.toString(width) + "x" + Integer.toString(height);
      chr.setParameter(SCREEN, screenInfo);			
      chr.setParameter(EVENT, CaptureEvents.CAPTURE_START.getEvent());
      chr.post();
    } catch (IOException e) {
      e.printStackTrace();
      throw new ConnectionException("IOException while sending capture start event.");
    }

  }

  public void disconnect() throws ConnectionException {
    try {
      System.out.println("Http Open connection. In disconnect");
      openConnection();
      sendCaptureEndEvent();
    } catch (ConnectionException e) {
      e.printStackTrace();
      notifyNetworkStreamListener(ExitCode.DESKSHARE_SERVICE_UNAVAILABLE);
      throw e;			
    } finally {

    }
  }

  private void sendCaptureEndEvent() {
    ClientHttpRequest chr;
    try {
      System.out.println(getTimeStamp() + " - Sending End Sharing Event.");
      chr = new ClientHttpRequest(conn);
      chr.setParameter(MEETING_ID, meetingId);
      chr.setParameter(STREAM_ID, streamId);
      chr.setParameter(SEQ_NUM, seqNumGenerator.getNext());
      chr.setParameter(EVENT, CaptureEvents.CAPTURE_END.getEvent());
      chr.post();
    } catch (IOException e) {
      e.printStackTrace();
    }
  }

  private void sendUpdateMessage(ShareUpdateMessage message) {
      ClientHttpRequest chr;

      try {
        // Open a connection to the web server and create a request that has
        // the room and event type.
        System.out.println(getTimeStamp() + " - Sending Update Sharing Event.");
        openConnection();
        chr = new ClientHttpRequest(conn);
        chr.setParameter(MEETING_ID, meetingId);
        chr.setParameter(STREAM_ID, streamId);
        chr.setParameter(EVENT, CaptureEvents.CAPTURE_UPDATE.getEvent());

        // Post the multi-part form to the server
        chr.post();
        HttpURLConnection httpConnection = (HttpURLConnection) chr.connection;
        int status = httpConnection.getResponseCode();

        //System.out.println("******* POST status = [" + status + "] ***************");

      } catch (IOException e) {
        notifyNetworkStreamListener(ExitCode.NORMAL);
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

}
