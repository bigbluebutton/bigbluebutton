package org.bigbluebutton.deskshare.client;

import jargs.gnu.CmdLineParser;
import jargs.gnu.CmdLineParser.Option;

import java.util.ArrayList;
import java.util.Iterator;
import java.util.List;

public class DeskshareMain {
	private List<String> optionHelpStrings = new ArrayList<String>();

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
        CmdLineParser.Option room = dsMain.addHelp(parser.addStringOption('r', "room"),"Room");        
    	CmdLineParser.Option width = dsMain.addHelp(parser.addIntegerOption('w', "width"),"Width of the screen capture");
    	CmdLineParser.Option height = dsMain.addHelp(parser.addIntegerOption('t', "height"),"Height of the screen capture");
    	CmdLineParser.Option xCoord = dsMain.addHelp(parser.addIntegerOption('x', "x"),"Upper-left x coordinate of the screen capture");
    	CmdLineParser.Option yCoord = dsMain.addHelp(parser.addIntegerOption('y', "y"),"Upper-left y coordinate of the screen capture");
    	CmdLineParser.Option tryHttpTunnel = dsMain.addHelp(parser.addBooleanOption('n', "httptunnel"),"Http tunnel if direct connection fails");
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
        
        // Extract the values entered for the various options -- if the
        // options were not specified, the corresponding values will be
        // the default.
        String hostValue = (String)parser.getOptionValue(host, "localhost");
        Integer portValue = (Integer)parser.getOptionValue(port, new Integer(9123));
        String roomValue = (String)parser.getOptionValue(room, "85115");
        Integer widthValue = (Integer)parser.getOptionValue(width, new Integer(800));
        Integer heightValue = (Integer)parser.getOptionValue(height, new Integer(600));
        Integer xValue = (Integer)parser.getOptionValue(xCoord, new Integer(0));
        Integer yValue = (Integer)parser.getOptionValue(yCoord, new Integer(0));
        Boolean tunnelValue = (Boolean)parser.getOptionValue(tryHttpTunnel, true);
        
        DeskshareClient client = new DeskshareClient.Builder().host(hostValue).port(portValue)
        						.room(roomValue).width(widthValue)
        						.height(heightValue).x(xValue).y(yValue)
        						.httpTunnel(tunnelValue).build();
        client.start();
        
        while (true) {}
    //    System.exit(0);
	}	
}
