package org.bigbluebutton.freeswitch.voice.freeswitch.actions;

import org.apache.commons.lang3.StringUtils;
import org.bigbluebutton.freeswitch.voice.events.*;
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
import java.util.ArrayList;
import java.util.List;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

public class GetUsersStatusCommand extends FreeswitchCommand {
  private static Logger log = LoggerFactory.getLogger(GetUsersStatusCommand.class);
  private static final Pattern CALLERNAME_PATTERN = Pattern.compile("(.*)-bbbID-(.*)$");
  private static final Pattern CALLERNAME_WITH_SESS_INFO_PATTERN = Pattern.compile("^(.*)_(\\d+)-bbbID-(.*)$");
  private static final Pattern GLOBAL_AUDION_PATTERN = Pattern.compile("(GLOBAL_AUDIO)_(.*)$");

  public GetUsersStatusCommand(String room, String requesterId) {
    super(room, requesterId);
  }

  @Override
  public String getCommandArgs() {
    return getRoom() + SPACE + "xml_list";
  }

  public void handleResponse(EslMessage response, ConferenceEventListener eventListener) {

    String firstLine = response.getBodyLines().get(0);
    //log.info("GetUsersStatusCommand: Check conference first line response: " + firstLine);

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
      sp.parse(bs, confXML);

      Integer numUsers =  confXML.getConferenceList().size();
      if (numUsers > 0) {
        //log.info("Check user status response: " + responseBody);

        List<ConfMember> confMembers = new ArrayList<ConfMember>();
        List<ConfRecording> confRecordings = new ArrayList<ConfRecording>();

        for (ConferenceMember member : confXML.getConferenceList()) {
          if ("caller".equals(member.getMemberType())) {
            String callerId = member.getCallerId();
            String callerIdName = member.getCallerIdName();
            String voiceUserId = callerIdName;
            String uuid = member.getUUID();
            String clientSession = "0";

            Matcher gapMatcher = GLOBAL_AUDION_PATTERN.matcher(callerIdName);
            // Ignore GLOBAL_AUDIO user.
            if (!gapMatcher.matches()) {
              Matcher matcher = CALLERNAME_PATTERN.matcher(callerIdName);
              Matcher callWithSess = CALLERNAME_WITH_SESS_INFO_PATTERN.matcher(callerIdName);
              if (callWithSess.matches()) {
                voiceUserId = callWithSess.group(1).trim();
                clientSession = callWithSess.group(2).trim();
                callerIdName = callWithSess.group(3).trim();
              } else
              if (matcher.matches()) {
                voiceUserId = matcher.group(1).trim();
                callerIdName = matcher.group(2).trim();
              }

              log.info("Conf user. uuid=" + uuid
                      + ",caller=" + callerIdName
                      + ",clientSession=" + clientSession
                      + ",callerId=" + callerId
                      + ",conf=" + room
                      + ",muted=" + member.getMuted()
                      + ",talking=" + member.getSpeaking());

              ConfMember confMember = new ConfMember(voiceUserId,
                      member.getId().toString(),
                      callerId, callerIdName,
                      member.getMuted(),
                      member.getSpeaking(),
                      "none");
              confMembers.add(confMember);
            }
          } else if ("recording_node".equals(member.getMemberType())) {
            ConfRecording confRecording = new ConfRecording(member.getRecordPath(), member.getRecordStartTime());
            confRecordings.add(confRecording);
          }
        }

        VoiceUsersStatusEvent voiceUsersStatusEvent =
                new VoiceUsersStatusEvent(getRoom(), confMembers, confRecordings);
        eventListener.handleConferenceEvent(voiceUsersStatusEvent);
      }
    }catch(SAXException se) {
      log.error("Cannot parse response. ", se);
    }catch(ParserConfigurationException pce) {
      log.error("ParserConfigurationException. ", pce);
    }catch (IOException ie) {
      log.error("Cannot parse response. IO Exception. ", ie);
    }
  }
}
