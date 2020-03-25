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

import org.freeswitch.esl.client.transport.message.EslMessage;
import org.apache.commons.lang3.StringUtils;
import org.bigbluebutton.freeswitch.voice.events.ConferenceEventListener;
import org.bigbluebutton.freeswitch.voice.events.VoiceUserJoinedEvent;
import org.bigbluebutton.freeswitch.voice.freeswitch.response.ConferenceMember;
import org.bigbluebutton.freeswitch.voice.freeswitch.response.XMLResponseConferenceListParser;

import java.io.ByteArrayInputStream;
import java.io.IOException;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

import javax.xml.parsers.ParserConfigurationException;
import javax.xml.parsers.SAXParser;
import javax.xml.parsers.SAXParserFactory;

import org.xml.sax.SAXException;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

public class GetAllUsersCommand extends FreeswitchCommand {
    private static Logger log = LoggerFactory.getLogger(GetAllUsersCommand.class);
    public GetAllUsersCommand(String room, String requesterId) {
            super(room, requesterId);
    }
    
    @Override
    public String getCommandArgs() {
        return getRoom() + SPACE + "xml_list";
    }

    private static final Pattern CALLERNAME_PATTERN = Pattern.compile("(.*)-bbbID-(.*)$");
    
    public void handleResponse(EslMessage response, ConferenceEventListener eventListener) {

        //Test for Known Conference

        String firstLine = response.getBodyLines().get(0);

        //E.g. Conference 85115 not found
        
        if(!firstLine.startsWith("<?xml")) {
//            System.out.println("Not XML: [{}]", firstLine);
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

            Integer numUsers =  confXML.getConferenceList().size();
            log.info("Num users in conf when starting. conf={},numUsers={}.", room, numUsers);

            if (numUsers > 0) {
                log.info("Check conference response: " + responseBody);

                for(ConferenceMember member : confXML.getConferenceList()) {
                    if ("caller".equals(member.getMemberType())) {
                        //Foreach found member in conference create a JoinedEvent
                        String callerId = member.getCallerId();
                        String callerIdName = member.getCallerIdName();
                        String voiceUserId = callerIdName;
                        String uuid = member.getUUID();
                        log.info("Conf user. uuid=" + uuid
                                + ",caller=" + callerIdName + ",callerId=" + callerId + ",conf=" + room);
                        Matcher matcher = CALLERNAME_PATTERN.matcher(callerIdName);
                        if (matcher.matches()) {
                            voiceUserId = matcher.group(1).trim();
                            callerIdName = matcher.group(2).trim();
                        }

                        VoiceUserJoinedEvent pj = new VoiceUserJoinedEvent(voiceUserId, member.getId().toString(), confXML.getConferenceRoom(),
                                callerId, callerIdName, member.getMuted(), member.getSpeaking(), "none");
                        eventListener.handleConferenceEvent(pj);
                    } else if ("recording_node".equals(member.getMemberType())) {

                    }


                }
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
