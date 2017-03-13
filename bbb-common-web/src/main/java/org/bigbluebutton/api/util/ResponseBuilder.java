package org.bigbluebutton.api.util;

import org.bigbluebutton.api.domain.Meeting;
import org.apache.commons.lang.StringUtils;

import java.io.File;
import java.io.IOException;
import java.io.StringWriter;
import java.util.*;

import freemarker.template.*;
import org.bigbluebutton.api.domain.RecordingMetadata;

public class ResponseBuilder {
  Configuration cfg = new Configuration(Configuration.VERSION_2_3_23);

  public ResponseBuilder(File templatesLoc) {

    try {
      cfg.setDirectoryForTemplateLoading(templatesLoc);
    } catch (IOException e) {
      e.printStackTrace();
    }
    cfg.setDefaultEncoding("UTF-8");
    cfg.setTemplateExceptionHandler(TemplateExceptionHandler.RETHROW_HANDLER);
    cfg.setLogTemplateExceptions(false);
  }

  public String formatPrettyDate(Long timestamp) {
    return new Date(timestamp).toString();
  }

  public String buildGetMeetingInfoResponse(Meeting meeting, String returnCode) {
    String createdOn = formatPrettyDate(meeting.getCreateTime());

    Template ftl = null;
    try {
      ftl = cfg.getTemplate("get-meeting-info.ftl");
    } catch (IOException e) {
      e.printStackTrace();
    }

    StringWriter xmlText = new StringWriter();

    Map root = new HashMap();
    root.put("returnCode", returnCode);
    root.put("createdOn", createdOn);
    root.put("meeting", meeting);

    try {
      ftl.process(root, xmlText);
    } catch (TemplateException e) {
      e.printStackTrace();
    } catch (IOException e) {
      e.printStackTrace();
    }

    return xmlText.toString();
  }

  public String buildGetMeetingsResponse(Collection<Meeting> meetings, String returnCode) {

    ArrayList<MeetingResponseDetail> meetingResponseDetails = new ArrayList<MeetingResponseDetail>();

    for (Meeting meeting : meetings) {
      String createdOn = formatPrettyDate(meeting.getCreateTime());
      MeetingResponseDetail details = new MeetingResponseDetail(createdOn, meeting);
      meetingResponseDetails.add(details);
    }

    Template ftl = null;
    try {
      ftl = cfg.getTemplate("get-meetings.ftl");
    } catch (IOException e) {
      e.printStackTrace();
    }

    StringWriter xmlText = new StringWriter();

    Map root = new HashMap();
    root.put("returnCode", returnCode);
    root.put("meetingDetailsList", meetingResponseDetails);

    for (MeetingResponseDetail details : (ArrayList<MeetingResponseDetail>)root.get("meetingDetailsList"))  {
      System.out.println(details.getMeeting().getName());
    }

    try {
      ftl.process(root, xmlText);
    } catch (TemplateException e) {
      e.printStackTrace();
    } catch (IOException e) {
      e.printStackTrace();
    }

    return xmlText.toString();
  }

  public String buildGetRecordingsResponse(List<RecordingMetadata> recordings, String returnCode) {

    Template ftl = null;
    try {
      ftl = cfg.getTemplate("get-recordings.ftl");
    } catch (IOException e) {
      e.printStackTrace();
    }

    StringWriter xmlText = new StringWriter();

    Map root = new HashMap();
    root.put("returnCode", returnCode);
    root.put("recordings", recordings);

    try {
      ftl.process(root, xmlText);
    } catch (TemplateException e) {
      e.printStackTrace();
    } catch (IOException e) {
      e.printStackTrace();
    }

    return xmlText.toString();
  }
}
