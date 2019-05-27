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
package org.bigbluebutton.freeswitch.voice.freeswitch.actions;

import org.apache.commons.lang3.StringUtils;
import org.bigbluebutton.freeswitch.voice.events.ConferenceEventListener;
import org.bigbluebutton.freeswitch.voice.freeswitch.response.XMLResponseConferenceListParser;
import org.freeswitch.esl.client.transport.message.EslMessage;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.xml.sax.SAXException;

import javax.xml.parsers.ParserConfigurationException;
import javax.xml.parsers.SAXParser;
import javax.xml.parsers.SAXParserFactory;
import java.io.ByteArrayInputStream;
import java.io.IOException;

public class CheckIfConfIsRunningCommand extends FreeswitchCommand {
    private static Logger log = LoggerFactory.getLogger(CheckIfConfIsRunningCommand.class);

    public CheckIfConfIsRunningCommand(String room, String requesterId) {
            super(room, requesterId);
    }
    
    @Override
    public String getCommandArgs() {
        return getRoom() + SPACE + "xml_list";
    }
    
    public void handleResponse(EslMessage response, ConferenceEventListener eventListener) {

        //Test for Known Conference

        String firstLine = response.getBodyLines().get(0);

        log.info("Check conference response: " + firstLine);
        //E.g. Conference 85115 not found
        
        if(!firstLine.startsWith("<?xml")) {
            log.info("INFO! Successfully ejected all users from conference {}.", room);
            return;
        }


        XMLResponseConferenceListParser confXML = new XMLResponseConferenceListParser();

        //get a factory
        SAXParserFactory spf = SAXParserFactory.newInstance();
        try {

            //get a new instance of parser
            SAXParser sp = spf.newSAXParser();

            //Hack turning body lines back into string then to ByteStream.... BLAH!
            
            String responseBody = StringUtils.join(response.getBodyLines(), "\n");

            //http://mark.koli.ch/2009/02/resolving-orgxmlsaxsaxparseexception-content-is-not-allowed-in-prolog.html
            //This Sux!
            responseBody = responseBody.trim().replaceFirst("^([\\W]+)<","<");

            ByteArrayInputStream bs = new ByteArrayInputStream(responseBody.getBytes());
            sp.parse(bs, confXML);

            if (confXML.getConferenceList().size() > 0) {
                log.warn("WARNING! Failed to eject all users from conference {}.", room);
            } else {
                log.info("INFO! Successfully ejected all users from conference {}.", room);
            }
        }catch(SAXException se) {
//            System.out.println("Cannot parse repsonce. ", se);
        }catch(ParserConfigurationException pce) {
//            System.out.println("ParserConfigurationException. ", pce);
        }catch (IOException ie) {
//        	System.out.println("Cannot parse repsonce. IO Exception. ", ie);
        }
    }

}
