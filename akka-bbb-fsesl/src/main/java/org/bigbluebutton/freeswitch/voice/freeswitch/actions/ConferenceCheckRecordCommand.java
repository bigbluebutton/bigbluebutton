package org.bigbluebutton.freeswitch.voice.freeswitch.actions;

import org.apache.commons.lang3.StringUtils;
import org.bigbluebutton.freeswitch.voice.events.ConfRecording;
import org.bigbluebutton.freeswitch.voice.events.ConferenceEventListener;
import org.bigbluebutton.freeswitch.voice.events.VoiceConfRunningAndRecordingEvent;
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
import java.util.Iterator;
import java.util.List;

public class ConferenceCheckRecordCommand extends FreeswitchCommand {
  private static Logger log = LoggerFactory.getLogger(ConferenceCheckRecordCommand.class);

  public ConferenceCheckRecordCommand(String room, String requesterId) {
    super(room, requesterId);
  }

  @Override
  public String getCommandArgs() {
    //return room + " chkrecord";
    return getRoom() + SPACE + "xml_list";
  }

  public void handleResponse(EslMessage response, ConferenceEventListener eventListener) {
    List<ConfRecording> confRecordings = new ArrayList<ConfRecording>();

    String firstLine = response.getBodyLines().get(0);
    //log.info("Check conference first line response: " + firstLine);

    if(!firstLine.startsWith("<?xml")) {
      //log.info("Conference is not running and recording {}.", room);
      VoiceConfRunningAndRecordingEvent voiceConfRunningAndRecordingEvent =
              new VoiceConfRunningAndRecordingEvent(getRoom(), false, false, confRecordings);
      eventListener.handleConferenceEvent(voiceConfRunningAndRecordingEvent);
      return;
    }

    XMLResponseConferenceListParser confXML = new XMLResponseConferenceListParser();
    //get a factory
    SAXParserFactory spf = SAXParserFactory.newInstance();
    try {

      boolean running = false;
      boolean recording = false;

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
        //log.info("Check conference response: " + responseBody);
        running = true;

        for (ConferenceMember member : confXML.getConferenceList()) {
          if ("caller".equals(member.getMemberType())) {
            // We don't need this. If there is at least one user in the conference,
            // then it is running. (ralam Oct 16, 2019)

          } else if ("recording_node".equals(member.getMemberType())) {
            recording = true;
            ConfRecording confRecording = new ConfRecording(member.getRecordPath(), member.getRecordStartTime());
            confRecordings.add(confRecording);
          }
        }
      }

      VoiceConfRunningAndRecordingEvent voiceConfRunningAndRecordingEvent =
              new VoiceConfRunningAndRecordingEvent(getRoom(), running, recording, confRecordings);
      eventListener.handleConferenceEvent(voiceConfRunningAndRecordingEvent);

    }catch(SAXException se) {
      log.error("Cannot parse response. ", se);
    }catch(ParserConfigurationException pce) {
      log.error("ParserConfigurationException. ", pce);
    }catch (IOException ie) {
      log.error("Cannot parse response. IO Exception. ", ie);
    }
  }
}
