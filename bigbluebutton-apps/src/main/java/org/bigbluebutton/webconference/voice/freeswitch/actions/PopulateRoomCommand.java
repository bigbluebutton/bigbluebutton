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
package org.bigbluebutton.webconference.voice.freeswitch.actions;

import org.freeswitch.esl.client.transport.message.EslMessage;
import org.bigbluebutton.webconference.voice.events.ConferenceEventListener;
import org.bigbluebutton.webconference.voice.events.ParticipantJoinedEvent;
import org.bigbluebutton.webconference.voice.freeswitch.response.XMLResponseConferenceListParser;
import org.bigbluebutton.webconference.voice.freeswitch.response.ConferenceMember;

import java.io.ByteArrayInputStream;
import java.io.IOException;
import javax.xml.parsers.ParserConfigurationException;
import javax.xml.parsers.SAXParser;
import javax.xml.parsers.SAXParserFactory;
import org.red5.logging.Red5LoggerFactory;
import org.slf4j.Logger;
import org.xml.sax.SAXException;

public class PopulateRoomCommand extends FreeswitchCommand {
    private static Logger log = Red5LoggerFactory.getLogger(PopulateRoomCommand.class, "bigbluebutton");

    public PopulateRoomCommand(String room, Integer requesterId) {
            super(room, requesterId);
    }
    
    @Override
    public String getCommandArgs() {
        return getRoom() + SPACE + "xml_list";
    }

    public void handleResponse(EslMessage response, ConferenceEventListener eventListener) {

        //Test for Known Conference

        String firstLine = response.getBodyLines().get(0);

        //E.g. Conference 85115 not found
        
        if(!firstLine.startsWith("<?xml")) {
            log.error("Not XML: [{}]", firstLine);
            return;
        }


        XMLResponseConferenceListParser confXML = new XMLResponseConferenceListParser();

        //get a factory
        SAXParserFactory spf = SAXParserFactory.newInstance();
        try {

            //get a new instance of parser
            SAXParser sp = spf.newSAXParser();

            //Hack turning body lines back into string then to ByteStream.... BLAH!
            
            String responseBody = org.springframework.util.StringUtils.collectionToDelimitedString(response.getBodyLines(), "\n");

            log.debug("xml_list responce\n{}\nEND", responseBody);

            //http://mark.koli.ch/2009/02/resolving-orgxmlsaxsaxparseexception-content-is-not-allowed-in-prolog.html
            //This Sux!
            responseBody = responseBody.trim().replaceFirst("^([\\W]+)<","<");

            ByteArrayInputStream bs = new ByteArrayInputStream(responseBody.getBytes());
            sp.parse(bs, confXML);

            //Maybe move this to XMLResponseConferenceListParser, sendConfrenceEvents ?
            ParticipantJoinedEvent pj;

            for(ConferenceMember member : confXML.getConferenceList()) {
                log.debug("conf list member [{}] for room [{}].", member.getId(), confXML.getConferenceRoom());
                //Foreach found member in conference create a JoinedEvent
                pj = new ParticipantJoinedEvent(member.getId(), confXML.getConferenceRoom(),
                                member.getCallerId(), member.getCallerIdName(), member.getMuted(), member.getSpeaking());
                eventListener.handleConferenceEvent(pj);
            }

        }catch(SAXException se) {
            log.error("Cannot parse repsonce. ", se);
        }catch(ParserConfigurationException pce) {
            log.error("ParserConfigurationException. ", pce);
        }catch (IOException ie) {
            log.error("Cannot parse repsonce. IO Exception. ", ie);
        }
    }

}
