package org.bigbluebutton.api.util;

import java.io.File;
import java.io.IOException;
import java.io.Serializable;
import java.io.StringWriter;
import java.nio.charset.StandardCharsets;
import java.util.ArrayList;
import java.util.Collection;
import java.util.Date;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

import org.bigbluebutton.api.domain.Meeting;
import org.bigbluebutton.api.domain.RecordingMetadata;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import freemarker.template.Configuration;
import freemarker.template.Template;
import freemarker.template.TemplateException;
import freemarker.template.TemplateExceptionHandler;

public class ResponseBuilder {
  private static Logger log = LoggerFactory.getLogger(ResponseBuilder.class);

  Configuration cfg = new Configuration(Configuration.VERSION_2_3_23);

  public ResponseBuilder(File templatesLoc) {

    try {
      cfg.setDirectoryForTemplateLoading(templatesLoc);
    } catch (IOException e) {
      e.printStackTrace();
    }
    cfg.setDefaultEncoding(StandardCharsets.UTF_8.name());
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
      ftl = cfg.getTemplate("get-meeting-info.ftlx");
    } catch (IOException e) {
      log.error("Cannot find get-meeting-info.ftl template for meeting : " + meeting.getInternalId(), e);
    }

    StringWriter xmlText = new StringWriter();

    Map<String, Object> root = new HashMap<String, Object>();
    root.put("returnCode", returnCode);
    root.put("createdOn", createdOn);
    root.put("meeting", meeting);

    try {
      ftl.process(root, xmlText);
    } catch (TemplateException e) {
      log.error("Template exception for meeting : " + meeting.getInternalId(), e);
    } catch (IOException e) {
      log.error("IO exception for meeting : " + meeting.getInternalId(), e);
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
      ftl = cfg.getTemplate("get-meetings.ftlx");
    } catch (IOException e) {
      log.error("IO exception for get-meetings.ftlx : ", e);
    }

    StringWriter xmlText = new StringWriter();

    Map<String, Serializable> root = new HashMap<String, Serializable>();
    root.put("returnCode", returnCode);
    root.put("meetingDetailsList", meetingResponseDetails);

    try {
      ftl.process(root, xmlText);
    } catch (TemplateException e) {
      log.error("Template exception : ", e);
    } catch (IOException e) {
      log.error("IO exception for get-meetings.ftlx : ", e);
    }

    return xmlText.toString();
  }

  public String buildGetRecordingsResponse(List<RecordingMetadata> recordings, String returnCode) {

    Template ftl = null;
    try {
      ftl = cfg.getTemplate("get-recordings.ftlx");
    } catch (IOException e) {
      log.error("IO exception for get-recordings.ftl : ", e);
    }

    StringWriter xmlText = new StringWriter();

    Map<String, Object> root = new HashMap<String, Object>();
    root.put("returnCode", returnCode);
    root.put("recordings", recordings);

    try {
      ftl.process(root, xmlText);
    } catch (TemplateException e) {
      log.error("Template exception : ", e);
    } catch (IOException e) {
      log.error("IO exception for get-recordings.ftlx : ", e);
    }

    return xmlText.toString();
  }
}
