package org.bigbluebutton.deskshare.client;

import jargs.gnu.CmdLineParser;
import jargs.gnu.CmdLineParser.Option;

import java.awt.Dimension;
import java.awt.Image;
import java.awt.Toolkit;
import java.util.ArrayList;
import java.util.Iterator;
import java.util.List;
import java.util.concurrent.BlockingQueue;
import java.util.concurrent.LinkedBlockingQueue;

public class DeskshareMain implements ClientListener, LifeLineListener {
	private final BlockingQueue<ExitCode> exitReasonQ = new LinkedBlockingQueue<ExitCode>(5);
	
	private List<String> optionHelpStrings = new ArrayList<String>();
	private static DeskshareMain dsMain;
	private static LifeLine lifeline;
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
    	CmdLineParser.Option host = dsMain.addHelp(parser.addStringOption('s', "server"),"The address of Red5 server");
        CmdLineParser.Option port = dsMain.addHelp(parser.addIntegerOption('p', "port"),"The port the application is listening");
        CmdLineParser.Option listenPort = dsMain.addHelp(parser.addIntegerOption('l', "listenPort"),"Port to listen for lifeline");
        CmdLineParser.Option room = dsMain.addHelp(parser.addStringOption('r', "room"),"Room");        
    	CmdLineParser.Option cWidth = dsMain.addHelp(parser.addIntegerOption('w', "captureWidth"),"Width of the screen capture");
    	CmdLineParser.Option cHeight = dsMain.addHelp(parser.addIntegerOption('t', "captureHeight"),"Height of the screen capture");
    	CmdLineParser.Option sWidth = dsMain.addHelp(parser.addIntegerOption('d', "scaleWidth"),"Scale capture width");
    	CmdLineParser.Option sHeight = dsMain.addHelp(parser.addIntegerOption('g', "scaleHeight"),"Scale capture height");    
    	CmdLineParser.Option quality = dsMain.addHelp(parser.addBooleanOption('q', "quality"),"Scale with better quality instead of speed");
    	CmdLineParser.Option aspectRatio = dsMain.addHelp(parser.addBooleanOption('a', "aspectRatio"),"Maintain aspect ratio when scaling");
    	CmdLineParser.Option xCoord = dsMain.addHelp(parser.addIntegerOption('x', "x"),"Upper-left x coordinate of the screen capture");
    	CmdLineParser.Option yCoord = dsMain.addHelp(parser.addIntegerOption('y', "y"),"Upper-left y coordinate of the screen capture");
    	CmdLineParser.Option tryHttpTunnel = dsMain.addHelp(parser.addBooleanOption('n', "httptunnel"),"Http tunnel if direct connection fails");
    	CmdLineParser.Option icon = dsMain.addHelp(parser.addStringOption('i', "icon"),"Path to system tray icon file");
    	CmdLineParser.Option help = dsMain.addHelp(parser.addBooleanOption('h', "help"),"Show this help message");
        
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
        
        Dimension dim = Toolkit.getDefaultToolkit().getScreenSize();

        // Extract the values entered for the various options -- if the
        // options were not specified, the corresponding values will be
        // the default.
        String hostValue = (String)parser.getOptionValue(host, "localhost");
        Integer portValue = (Integer)parser.getOptionValue(port, new Integer(9123));
        Integer listenPortValue = (Integer)parser.getOptionValue(listenPort, new Integer(9125));
        String roomValue = (String)parser.getOptionValue(room, "85115");
        Integer cWidthValue = (Integer)parser.getOptionValue(cWidth, new Integer((int)dim.getWidth()));
        Integer cHeightValue = (Integer)parser.getOptionValue(cHeight, new Integer((int)dim.getHeight()));
        Integer sWidthValue = (Integer)parser.getOptionValue(sWidth, new Integer((int)dim.getWidth()));
        Integer sHeightValue = (Integer)parser.getOptionValue(sHeight, new Integer((int)dim.getHeight()));
        Boolean qualityValue = (Boolean)parser.getOptionValue(quality, false);
        Boolean aspectValue = (Boolean)parser.getOptionValue(aspectRatio, false);
        Integer xValue = (Integer)parser.getOptionValue(xCoord, new Integer(0));
        Integer yValue = (Integer)parser.getOptionValue(yCoord, new Integer(0));
        Boolean tunnelValue = (Boolean)parser.getOptionValue(tryHttpTunnel, false);
        String iconValue = (String)parser.getOptionValue(icon, "bbb.gif");
        
        Image image = Toolkit.getDefaultToolkit().getImage(iconValue);
        
        lifeline = new LifeLine(listenPortValue.intValue(), dsMain);
        lifeline.listen();
        
        client = new DeskshareClient.Builder().host(hostValue).port(portValue)
        						.room(roomValue).captureWidth(cWidthValue)
        						.captureHeight(cHeightValue).scaleWidth(sWidthValue).scaleHeight(sHeightValue)
        						.quality(qualityValue).aspectRatio(aspectValue)
        						.x(xValue).y(yValue)
        						.httpTunnel(tunnelValue).trayIcon(image).enableTrayIconActions(true).build();
        
        client.addClientListeners(dsMain);
        client.start();
        
        try {
        	System.out.println("Waiting for trigger to Stop client.");
			ExitCode reason = dsMain.exitReasonQ.take();
			System.out.println("Stopping client.");
			client.stop();
			lifeline.disconnect();
			System.exit(reason.getExitCode());
		} catch (InterruptedException e) {
			// TODO Auto-generated catch block
			e.printStackTrace();
			System.exit(500);
		}
        
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
//			System.out.println("Trigger stop client ." + exitReasonQ.remainingCapacity());
			exitReasonQ.put(reason);
			System.out.println("Triggered stop client.");
		} catch (InterruptedException e) {
			// TODO Auto-generated catch block
			e.printStackTrace();
			client.stop();
			lifeline.disconnect();
			System.exit(reason.getExitCode());
		}
	}
}
