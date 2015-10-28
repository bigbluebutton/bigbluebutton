package org.bigbluebutton.core.apps

import collection.mutable.Stack
import org.scalatest._
import org.bigbluebutton.core.UnitSpec

class BreakoutRoomsUtilSpec extends UnitSpec {

  it should "return a pdfURL" in {
    val baseURL = "http://localhost/pre1/page1."
    val swfURL = baseURL + "swf"
    val pdfURL = BreakoutRoomsUtil.fromSWFtoPDF(swfURL)
    assert(pdfURL == baseURL + "pdf")
  }

  it should "return a meetingId" in {
    val mainMeetingId = "abc-123"
    val index = 1
    val breakoutMeetingId = BreakoutRoomsUtil.createMeetingId(mainMeetingId, index)
    assert(breakoutMeetingId == mainMeetingId + "-" + index)
  }

  it should "return a voiceConfId" in {
    val voiceConfId = "85115"
    val index = 1
    val breakoutMeetingId = BreakoutRoomsUtil.createVoiceConfId(voiceConfId, index)
    assert(breakoutMeetingId == voiceConfId + index)
  }

}

/*
    // Create the parameters we want to send to the server.
    Map<String, String[]> paramsMap = new HashMap<String, String[]>();
    paramsMap.put("meetingID", new String[]{urlEncode(meetingID)});
    paramsMap.put("configXML", new String[]{urlEncode(xml_param)});

    String baseString = createBaseString(paramsMap);
*/ 