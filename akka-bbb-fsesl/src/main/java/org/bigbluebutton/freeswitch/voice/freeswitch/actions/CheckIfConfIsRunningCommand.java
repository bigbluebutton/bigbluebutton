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
import org.bigbluebutton.freeswitch.voice.freeswitch.DelayedCommandSenderService;
import org.bigbluebutton.freeswitch.voice.freeswitch.response.ConferenceMember;
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
import java.util.regex.Matcher;

public class CheckIfConfIsRunningCommand extends FreeswitchCommand {
    private static Logger log = LoggerFactory.getLogger(CheckIfConfIsRunningCommand.class);
    private DelayedCommandSenderService delayedCommandSenderService;
    private Integer forceEjectCount = 0;

    public CheckIfConfIsRunningCommand(String room, String requesterId,
                                       DelayedCommandSenderService delayedCommandSenderService,
                                       Integer forceEjectCount) {
            super(room, requesterId);
            this.delayedCommandSenderService = delayedCommandSenderService;
            this.forceEjectCount = forceEjectCount + 1;
    }
    
    @Override
    public String getCommandArgs() {
        log.debug("Check if ejecting users was a success for {}.", room);
        return getRoom() + SPACE + "xml_list";
    }
    
    public void handleResponse(EslMessage response, ConferenceEventListener eventListener) {

        //Test for Known Conference

        String firstLine = response.getBodyLines().get(0);

        //log.info("Check conference first line response: " + firstLine);
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

            Integer numUsers =  confXML.getConferenceList().size();
            if (numUsers > 0) {
                log.info("Check conference response: " + responseBody);
                log.warn("WARNING! Failed to eject all users from conf={},numUsers={},attempts={}.",
                        room, numUsers, forceEjectCount);
                if (forceEjectCount <= 5) {
                    for (ConferenceMember member : confXML.getConferenceList()) {
                        if ("caller".equals(member.getMemberType())) {
                            //Foreach found member in conference create a JoinedEvent
                            String callerId = member.getCallerId();
                            String callerIdName = member.getCallerIdName();
                            String voiceUserId = callerIdName;
                            String uuid = member.getUUID();
                            log.info("WARNING! User possibly stuck in conference. uuid=" + uuid
                                    + ",caller=" + callerIdName + ",callerId=" + callerId + ",conf=" + room);

                            // We have stubborn users that cannot be ejected from the voice conference.
                            // This results in the voice conference hanging around for potentially a long time.
                            // Force ejection by killing their uuid. (ralam Oct 1, 2019)
                            ForceEjectUserCommand forceEjectUserCommand = new ForceEjectUserCommand(getRoom(),
                                    member.getId().toString(),
                                    member.getUUID());
                            delayedCommandSenderService.handleMessage(forceEjectUserCommand, 5000L);

                        } else if ("recording_node".equals(member.getMemberType())) {

                        }
                    }
                    // Check again if the conference is still running after ejecting the users. (ralam Oct. 1, 2019)
                    CheckIfConfIsRunningCommand command = new CheckIfConfIsRunningCommand(getRoom(),
                            getRequesterId(),
                            delayedCommandSenderService,
                            forceEjectCount + 1);
                    delayedCommandSenderService.handleMessage(command, 10000);
                } else {
                    log.warn("Failed to eject users for voice conf " + getRoom() + " after " + forceEjectCount + " tries.");
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
