package org.bigbluebutton.freeswitch.voice.freeswitch.actions;

import org.apache.commons.lang3.StringUtils;
import org.bigbluebutton.freeswitch.voice.events.ConferenceEventListener;
import org.bigbluebutton.freeswitch.voice.events.VoiceConfRunningAndRecordingEvent;
import org.bigbluebutton.freeswitch.voice.events.VoiceUserJoinedEvent;
import org.bigbluebutton.freeswitch.voice.events.VoiceUserStatusEvent;
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
import java.util.regex.Pattern;

public class GetUsersStatusCommand extends FreeswitchCommand {
  private static Logger log = LoggerFactory.getLogger(GetUsersStatusCommand.class);
  private static final Pattern CALLERNAME_PATTERN = Pattern.compile("(.*)-bbbID-(.*)$");

  public GetUsersStatusCommand(String room, String requesterId) {
    super(room, requesterId);
  }

  @Override
  public String getCommandArgs() {
    return getRoom() + SPACE + "xml_list";
  }

  public void handleResponse(EslMessage response, ConferenceEventListener eventListener) {

    String firstLine = response.getBodyLines().get(0);
    log.info("GetUsersStatusCommand: Check conference first line response: " + firstLine);

    if(!firstLine.startsWith("<?xml")) {
      log.info("Conference is not running {}.", room);
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
      System.out.println("***** Parsing Response !!!! *****");
      sp.parse(bs, confXML);

      Integer numUsers =  confXML.getConferenceList().size();
      if (numUsers > 0) {
        log.info("Check user status response: " + responseBody);

        for (ConferenceMember member : confXML.getConferenceList()) {
          if ("caller".equals(member.getMemberType())) {
            String callerId = member.getCallerId();
            String callerIdName = member.getCallerIdName();
            String voiceUserId = callerIdName;
            String uuid = member.getUUID();

            Matcher matcher = CALLERNAME_PATTERN.matcher(callerIdName);
            if (matcher.matches()) {
              voiceUserId = matcher.group(1).trim();
              callerIdName = matcher.group(2).trim();
            }

            log.info("Conf user. uuid=" + uuid
                    + ",caller=" + callerIdName
                    + ",callerId=" + callerId
                    + ",conf=" + room
                    + ",muted=" + member.getMuted()
                    + ",talking=" + member.getSpeaking());

            VoiceUserStatusEvent pj = new VoiceUserStatusEvent(voiceUserId, member.getId().toString(), confXML.getConferenceRoom(),
                    callerId, callerIdName, member.getMuted(), member.getSpeaking(), "none");
            eventListener.handleConferenceEvent(pj);
          } else if ("recording_node".equals(member.getMemberType())) {

          }
        }
      }

      //VoiceConfRunningAndRecordingEvent voiceConfRunningAndRecordingEvent =
      //        new VoiceConfRunningAndRecordingEvent(getRoom(), running, recording);
      //eventListener.handleConferenceEvent(voiceConfRunningAndRecordingEvent);

    }catch(SAXException se) {
      log.error("Cannot parse response. ", se);
    }catch(ParserConfigurationException pce) {
      log.error("ParserConfigurationException. ", pce);
    }catch (IOException ie) {
      log.error("Cannot parse response. IO Exception. ", ie);
    }
  }
}
