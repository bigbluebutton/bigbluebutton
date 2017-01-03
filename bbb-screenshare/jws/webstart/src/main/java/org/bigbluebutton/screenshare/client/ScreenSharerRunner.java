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
package org.bigbluebutton.screenshare.client;

import java.awt.AWTException;
import java.io.IOException;

import org.bigbluebutton.screenshare.client.javacv.FfmpegScreenshare;
import org.bigbluebutton.screenshare.client.net.NetworkConnectionListener;
import org.bigbluebutton.screenshare.client.net.NetworkStreamListener;

public class ScreenSharerRunner {
  public static final String NAME = "SCREENSHARERUNNER: ";

  boolean connected = false;
  private boolean started = false;
  private ScreenShareInfo ssi;
  private int x, y, width, height;
  private FfmpegScreenshare jcs;
  private NetworkConnectionListener listener;

  public ScreenSharerRunner(ScreenShareInfo ssi, NetworkConnectionListener listener) {
    this.ssi = ssi;
    this.listener = listener;

    System.out.println("ScreenSharerRunner[captureWidth=" + ssi.captureWidth + ",captureHeight=" + ssi.captureHeight + "][" + ssi.x + "," + ssi.y +"]"
        + "[scaleWidth=" + ssi.scaleWidth + ",scaleHeight=" + ssi.scaleHeight + "]");

      jcs = new FfmpegScreenshare(ssi, listener);
  }

  public void updateScreenShareInfo(int x, int y, int width, int height) {
    this.x = x;
    this.y = y;
    this.width = width;
    this.height = height;
  }
  
  public void startSharing(String streamId) {
    //    printHeader();

    try {
      String publishUrl = ssi.URL + "/" + streamId;
      System.out.println("Publishing stream [" + streamId + "] to " + publishUrl);
      jcs.go(publishUrl, x, y, width, height);
      jcs.start();
    } catch (IOException e) {
      // TODO Auto-generated catch block
      e.printStackTrace();
    } catch (AWTException e) {
      // TODO Auto-generated catch block
      e.printStackTrace();
    } catch (InterruptedException e) {
      // TODO Auto-generated catch block
      e.printStackTrace();
    } catch (Exception e) {
      // TODO Auto-generated catch block
      e.printStackTrace();
    }
  }

  public void disconnectSharing(){
    System.out.println(NAME + "Disconnected");
    jcs.stop();
  }

  public void stopSharing() {
    System.out.println(NAME + "Stopping");
    jcs.stop();
  }

  public void setCaptureCoordinates(int x, int y) {
    jcs.setCaptureCoordinates(x, y);
  }


  public void addClientListener(ClientListener l) {
    //		NetworkConnectionListener netConnListener = new NetworkConnectionListenerImp(listener);
    //		if (sender != null)
    //			sender.addNetworkConnectionListener(netConnListener);
    //		else
    //			System.out.println(NAME + "ERROR - Cannot add listener to network connection.");
  }

  private void printHeader() {
    System.out.println("-----------------------------------------------------------------------");
    System.out.println(LICENSE_HEADER);
    System.out.println("-----------------------------------------------------------------------\n\n");
    System.out.println("Desktop Sharing v0.9.0");
    System.out.println("Start");
    System.out.println("Connecting to " + ssi.host + ":" + ssi.port + " meetingId " + ssi.meetingId);
    System.out.println("Sharing " + ssi.captureWidth + "x" + ssi.captureHeight + " at " + ssi.x + "," + ssi.y);
    System.out.println("Scale to " + ssi.scaleWidth + "x" + ssi.scaleHeight + " with quality = " + ssi.quality);
    //		System.out.println("Http Tunnel: " + ssi.httpTunnel);
  }

  private static final String LICENSE_HEADER = "This program is free software: you can redistribute it and/or modify\n" +
      "it under the terms of the GNU Lesser General Public License as published by\n" +
      "the Free Software Foundation, either version 3 of the License, or\n" +
      "(at your option) any later version.\n\n" +
      "This program is distributed in the hope that it will be useful,\n" +
      "but WITHOUT ANY WARRANTY; without even the implied warranty of\n" +
      "MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the\n" +
      "GNU General Public License for more details.\n\n" +
      "You should have received a copy of the GNU Lesser General Public License\n" +
      "along with this program.  If not, see <http://www.gnu.org/licenses/>.\n\n" +
      "Copyright 2010 BigBlueButton. All Rights Reserved.\n\n";
}
