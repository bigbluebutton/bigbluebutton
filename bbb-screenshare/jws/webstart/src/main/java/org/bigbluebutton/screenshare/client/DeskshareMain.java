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

import jargs.gnu.CmdLineParser;
import jargs.gnu.CmdLineParser.Option;
import java.awt.Image;
import java.awt.Toolkit;
import java.io.IOException;
import java.util.ArrayList;
import java.util.Iterator;
import java.util.List;
import java.util.concurrent.BlockingQueue;
import java.util.concurrent.LinkedBlockingQueue;
import javax.imageio.ImageIO;
import javax.swing.JOptionPane;

public class DeskshareMain implements ClientListener, LifeLineListener {
  private final BlockingQueue<ExitCode> exitReasonQ = new LinkedBlockingQueue<ExitCode>(5);

  private List<String> optionHelpStrings = new ArrayList<String>();

  private static DeskshareClient client;

  private Option addHelp(Option option, String helpString) {
    optionHelpStrings.add(" -" + option.shortForm() + ", --" + option.longForm() + ": " + helpString);
    return option;
  }

  private void printUsage() {
    System.err.println("usage: deskshare [options]");
    for (Iterator<String> i = optionHelpStrings.iterator(); i.hasNext(); ) {
      System.err.println(i.next());
    }
  }

  public static void main(String[] args) {
    DeskshareMain dsMain = new DeskshareMain();
    CmdLineParser parser = new CmdLineParser();

    CmdLineParser.Option host = dsMain.addHelp(parser.addStringOption('s', "server"), serverHelpText);
    CmdLineParser.Option port = dsMain.addHelp(parser.addIntegerOption('p', "port"),"The port the application is listening");
    CmdLineParser.Option listenPort = dsMain.addHelp(parser.addIntegerOption('l', "listenPort"),"Port to listen for lifeline");
    CmdLineParser.Option room = dsMain.addHelp(parser.addStringOption('r', "room"),"Room");        
    CmdLineParser.Option cWidth = dsMain.addHelp(parser.addIntegerOption('w', "captureWidth"),"Width of the screen capture");
    CmdLineParser.Option cHeight = dsMain.addHelp(parser.addIntegerOption('t', "captureHeight"),"Height of the screen capture");
    CmdLineParser.Option sWidth = dsMain.addHelp(parser.addIntegerOption('d', "scaleWidth"),"Scale capture width");
    CmdLineParser.Option sHeight = dsMain.addHelp(parser.addIntegerOption('g', "scaleHeight"),"Scale capture height");    
    CmdLineParser.Option xCoord = dsMain.addHelp(parser.addIntegerOption('x', "x"),"Upper-left x coordinate of the screen capture");
    CmdLineParser.Option yCoord = dsMain.addHelp(parser.addIntegerOption('y', "y"),"Upper-left y coordinate of the screen capture");
    CmdLineParser.Option tryHttpTunnel = dsMain.addHelp(parser.addBooleanOption('n', "httptunnel"),"Http tunnel if direct connection fails");
    CmdLineParser.Option icon = dsMain.addHelp(parser.addStringOption('i', "icon"),"Path to system tray icon file");
    CmdLineParser.Option help = dsMain.addHelp(parser.addBooleanOption('h', "help"),"Show this help message");
    CmdLineParser.Option fullScreen = dsMain.addHelp(parser.addBooleanOption('f', "full-screen"),"Capture the full screen.");


    try {
      parser.parse(args);
    } catch (CmdLineParser.OptionException e) {
      System.err.println(e.getMessage());
      dsMain.printUsage();
      System.exit(2);
    }

    if (Boolean.TRUE.equals(parser.getOptionValue(help))) {
      dsMain.printUsage();
      System.exit(0);
    }

    // Extract the values entered for the various options -- if the
    // options were not specified, the corresponding values will be
    // the default.
    Integer portValue = (Integer)parser.getOptionValue(port, new Integer(9123));
    Integer listenPortValue = (Integer)parser.getOptionValue(listenPort, new Integer(9125));
    Integer cWidthValue = (Integer)parser.getOptionValue(cWidth, new Integer(801));
    Integer cHeightValue = (Integer)parser.getOptionValue(cHeight, new Integer(601));

    Integer sWidthValue = (Integer)parser.getOptionValue(sWidth, new Integer(800));
    Integer sHeightValue = (Integer)parser.getOptionValue(sHeight, new Integer(600));

    Integer xValue = (Integer)parser.getOptionValue(xCoord, new Integer(0));
    Integer yValue = (Integer)parser.getOptionValue(yCoord, new Integer(0));
    Boolean tunnelValue = (Boolean)parser.getOptionValue(tryHttpTunnel, new Boolean(false));
    String iconValue = (String)parser.getOptionValue(icon, "");
    
    String url = null;
    String meetingId = null;
    String streamId = null;
    String serverUrl = null;
    Boolean captureFullScreen = false;
    String session = null;
    String codecOptions = null;
    boolean useH264 = true;

    if(args != null && args.length == 9) {
      System.out.println("Using passed args: length=[" + args.length + "]");
      url = args[0];
      serverUrl = args[1];
      meetingId = args[2];
      streamId = args[3];
      captureFullScreen = Boolean.parseBoolean(args[4]);
      useH264 = false;
      
      System.out.println("Using passed args: [" + url + "] meetingId=[" + meetingId + "] streamId=[" + streamId + "] captureFullScreen=" + captureFullScreen);
      codecOptions = args[5];

      session = args[6];

      useH264 = Boolean.parseBoolean(args[7]);

      String errorMessage = args[8];
      
      if (! errorMessage.equalsIgnoreCase("NO_ERRORS")) {
        dsMain.displayJavaWarning(errorMessage);
      } else {
        Image image = null;
        if (iconValue.isEmpty()) {
          try {
            image = ImageIO.read(dsMain.getClass().getResourceAsStream("/images/bbb.gif"));
          } catch (IOException e) {
            // TODO Auto-generated catch block
            e.printStackTrace();
          }
        } else {
          image = Toolkit.getDefaultToolkit().getImage("bbb.gif");
        }

        dsMain.displaySystemProperties();

        System.setProperty("org.bytedeco.javacpp.logger.debug", "true");
        System.out.println("org.bytedeco.javacpp.logger.debug : " + System.getProperty("org.bytedeco.javacpp.logger.debug"));

        client = new DeskshareClient.NewBuilder().host(serverUrl).port(portValue)
            .meetingId(meetingId).streamId(streamId).captureWidth(cWidthValue)
            .captureHeight(cHeightValue).scaleWidth(sWidthValue).scaleHeight(sHeightValue)
            .quality(true).autoScale(0).codecOptions(codecOptions)
            .x(xValue).y(yValue).fullScreen(captureFullScreen).withURL(url)
            .httpTunnel(tunnelValue).trayIcon(image).enableTrayIconActions(true)
                .useH264(useH264).build();

        client.addClientListener(dsMain);
        client.start();

        try {
          System.out.println("Waiting for trigger to Stop client.");
          ExitCode reason = dsMain.exitReasonQ.take();
          System.out.println("Stopping Java Web Start.");
          client.stop();
          System.exit(reason.getExitCode());
        } catch (InterruptedException e) {
          // TODO Auto-generated catch block
          e.printStackTrace();
          System.exit(500);
        }
      }
   } else {
     System.out.println("Using default args: [" + url + "] width=[" + cWidthValue + "] height=[" + cHeightValue + "]");
     System.out.println("args null =[" + (args == null) + "] args.length=[" + args.length + "]");
     dsMain.displayJavaWarning("Invalid number of arguments.");
   }
    
  }	


  /**
   * Create the GUI and show it.  For thread safety,
   * this method should be invoked from the
   * event-dispatching thread.
   */
  private void createAndShowGUI(final String warning) {
    JOptionPane.showMessageDialog(null,
        warning,
        "Java Version Error",
        JOptionPane.ERROR_MESSAGE);
  }

  private void displayJavaWarning(final String warning) {   
    //Schedule a job for the event-dispatching thread:
    //creating and showing this application's GUI.
    javax.swing.SwingUtilities.invokeLater(new Runnable() {
      public void run() {
        createAndShowGUI(warning);
      }
    });
  }
  
  private void displaySystemProperties() {
    System.out.println("========== SYSTEM PROPERTIES ================ ");
    System.out.println("Java temp dir : " + System.getProperty("java.io.tmpdir"));
    System.out.println("Java name : " + System.getProperty("java.vm.name"));
    System.out.println("OS name : " + System.getProperty("os.name"));
    System.out.println("OS arch : " + System.getProperty("os.arch"));
    System.out.println("JNA Path : " + System.getProperty("jna.library.path"));
    System.out.println("========== END SYSTEM PROPERTIES ================ ");
  }
  
  public void onClientStop(ExitCode reason) {
    queueExitCode(reason);
  }

  @Override
  public void disconnected(ExitCode reason) {
    queueExitCode(reason);
  }

  private void queueExitCode(ExitCode reason) {
    try {
      System.out.println("Trigger stop client. " + exitReasonQ.remainingCapacity());
      exitReasonQ.put(reason);
      System.out.println("Triggered stop client. reason=" + reason.getExitCode());
    } catch (InterruptedException e) {
      // TODO Auto-generated catch block
      e.printStackTrace();
      client.stop();
      System.exit(reason.getExitCode());
    }
  }

  private static final String serverHelpText = "\n\t The host or IP of the desktop sharing server. Default is localhost.";
}
