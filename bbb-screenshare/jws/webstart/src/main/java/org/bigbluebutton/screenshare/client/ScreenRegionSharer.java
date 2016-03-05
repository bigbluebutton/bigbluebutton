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

import org.bigbluebutton.screenshare.client.frame.CaptureRegionFrame;
import org.bigbluebutton.screenshare.client.frame.CaptureRegionListener;
import org.bigbluebutton.screenshare.client.net.NetworkConnectionListener;
import org.bigbluebutton.screenshare.client.net.NetworkStreamSender;

public class ScreenRegionSharer implements ScreenSharer, NetworkConnectionListener {
  public static final String NAME = "SCREENREGIONSHARER: ";

  private final ScreenShareInfo ssi;
  private ScreenSharerRunner sharer;
  private CaptureRegionFrame frame;
  private NetworkStreamSender signalChannel;
  private DeskshareSystemTray tray = new DeskshareSystemTray();
  private ClientListener listener;
  
  public ScreenRegionSharer(ScreenShareInfo ssi) {
    signalChannel = new NetworkStreamSender(ssi.host, ssi.meetingId, ssi.streamId);
    signalChannel.addNetworkConnectionListener(this);
    signalChannel.start();
    this.ssi = ssi;
    sharer = new ScreenSharerRunner(ssi);
  }

  public void start(boolean autoStart) {
    CaptureRegionListener crl = new CaptureRegionListenerImp(this);
    frame = new CaptureRegionFrame(crl, 5);
    frame.setHeight(ssi.captureHeight);
    frame.setWidth(ssi.captureWidth);
    frame.setLocation(ssi.x, ssi.y);		
    System.out.println(NAME + "Launching Screen Capture Frame");
    frame.start(autoStart);
  }

  public void addClientListener(ClientListener l) {
    listener = l;
    SystemTrayListener systrayListener = new SystemTrayListenerImp(listener);
    tray.addSystemTrayListener(systrayListener);
    tray.displayIconOnSystemTray(ssi.sysTrayIcon, ssi.enableTrayActions);   
  }

  public void disconnected(){
    frame.setVisible(false);
    sharer.disconnectSharing();
    System.out.println(NAME + "Change system tray icon message");
    tray.disconnectIconSystemTrayMessage();
    System.out.println(NAME + "Desktop sharing disconneted");
  } 

  public void stop() {
    frame.setVisible(false);	
    sharer.stopSharing();
    signalChannel.stopSharing();
    tray.removeIconFromSystemTray();
    System.out.println(NAME + "Closing Screen Capture Frame");
  }

  @Override
  public void networkConnectionException(ExitCode reason) {
    if (listener != null) listener.onClientStop(reason);
  }
  
  private class CaptureRegionListenerImp implements CaptureRegionListener {
    private final ScreenRegionSharer srs;

    public CaptureRegionListenerImp(ScreenRegionSharer srs) {
      this.srs = srs;
    }

    @Override
    public void onCaptureRegionMoved(int x, int y) {
      ssi.x = x;
      ssi.y = y;
      if (sharer != null)
        sharer.setCaptureCoordinates(x, y);
    }

    @Override
    public void onStartCapture(int x, int y, int width, int height) {
      ssi.x = x;
      ssi.y = y;
      ssi.captureWidth = width;
      ssi.captureHeight = height;
      ssi.scaleWidth = width;
      ssi.scaleHeight = height;
      sharer.updateScreenShareInfo(x, y, width, height);
     
      signalChannel.startSharing(width, height);
      sharer.addClientListener(listener);

      sharer.startSharing();
    }

    @Override
    public void onStopCapture() {
      srs.stop();
    }
  }


}
