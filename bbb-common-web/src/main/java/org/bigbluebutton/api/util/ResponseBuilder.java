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
import org.bigbluebutton.api.domain.UserSession;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import freemarker.template.Configuration;
import freemarker.template.Template;
import freemarker.template.TemplateException;
import freemarker.template.TemplateExceptionHandler;

public class ResponseBuilder {
    private static Logger log = LoggerFactory.getLogger(ResponseBuilder.class);

    Configuration cfg = new Configuration(Configuration.VERSION_2_3_23);

    public ResponseBuilder(ClassLoader classLoader, String basePackagePath) {
        cfg.setClassLoaderForTemplateLoading(classLoader, basePackagePath);
        setUpConfiguration();
    }

    public ResponseBuilder(File templatesLoc) {
        try {
            cfg.setDirectoryForTemplateLoading(templatesLoc);
        } catch (IOException e) {
            log.error("Exception occured creating ResponseBuilder", e);
        }
        setUpConfiguration();
    }

    private void setUpConfiguration() {
        cfg.setDefaultEncoding(StandardCharsets.UTF_8.name());
        cfg.setTemplateExceptionHandler(TemplateExceptionHandler.RETHROW_HANDLER);
        cfg.setLogTemplateExceptions(false);
    }

    public String formatPrettyDate(Long timestamp) {
        return new Date(timestamp).toString();
    }

    public String buildMeetingVersion(String version, String returnCode) {
        StringWriter xmlText = new StringWriter();

        Map<String, Object> data = new HashMap<String, Object>();
        data.put("returnCode", returnCode);
        data.put("version", version);

        processData(getTemplate("api-version.ftlx"), data, xmlText);

        return xmlText.toString();
    }

    public String buildMeeting(Meeting meeting, String msgKey, String msg, String returnCode) {
        StringWriter xmlText = new StringWriter();

        String createdOn = formatPrettyDate(meeting.getCreateTime());

        Map<String, Object> data = new HashMap<String, Object>();
        data.put("returnCode", returnCode);
        data.put("meeting", meeting);
        data.put("createdOn", createdOn);
        data.put("msgKey", msgKey);
        data.put("msg", msg);

        processData(getTemplate("create-meeting.ftlx"), data, xmlText);

        return xmlText.toString();
    }

    public String buildError(String key, String msg, String returnCode) {
        StringWriter xmlText = new StringWriter();

        Map<String, Object> data = new HashMap<String, Object>();
        data.put("returnCode", returnCode);
        data.put("key", key);
        data.put("msg", msg);

        processData(getTemplate("api-error.ftlx"), data, xmlText);

        return xmlText.toString();
    }

    public String buildErrors(ArrayList erros, String returnCode) {
        StringWriter xmlText = new StringWriter();

        Map<String, Object> data = new HashMap<String, Object>();
        data.put("returnCode", returnCode);
        data.put("errorsList", erros);

        processData(getTemplate("api-errors.ftlx"), data, xmlText);

        return xmlText.toString();
    }

    public String buildGetMeetingInfoResponse(Meeting meeting, String returnCode) {
        String createdOn = formatPrettyDate(meeting.getCreateTime());

        StringWriter xmlText = new StringWriter();

        Map<String, Object> data = new HashMap<String, Object>();
        data.put("returnCode", returnCode);
        data.put("createdOn", createdOn);
        data.put("meeting", meeting);

        processData(getTemplate("get-meeting-info.ftlx"), data, xmlText);

        return xmlText.toString();
    }

    public String buildJoinMeeting(UserSession userSession, String sessionToken, String guestStatusVal, String destUrl,
            String msgKey, String msg, String returnCode) {
        StringWriter xmlText = new StringWriter();

        Map<String, Object> data = new HashMap<String, Object>();
        data.put("returnCode", returnCode);
        data.put("meetingID", userSession.meetingID);
        data.put("authToken", userSession.authToken);
        data.put("internalUserId", userSession.internalUserId);
        data.put("sessionToken", sessionToken);
        data.put("guestStatusVal", guestStatusVal);
        data.put("destUrl", destUrl);
        data.put("msgKey", msgKey);
        data.put("msg", msg);

        processData(getTemplate("join-meeting.ftlx"), data, xmlText);

        return xmlText.toString();
    }

    public String buildGetMeetingsResponse(Collection<Meeting> meetings, String msgKey, String msg, String returnCode) {

        ArrayList<MeetingResponseDetail> meetingResponseDetails = new ArrayList<MeetingResponseDetail>();

        for (Meeting meeting : meetings) {
            String createdOn = formatPrettyDate(meeting.getCreateTime());
            MeetingResponseDetail details = new MeetingResponseDetail(createdOn, meeting);
            meetingResponseDetails.add(details);
        }

        StringWriter xmlText = new StringWriter();

        Map<String, Serializable> data = new HashMap<String, Serializable>();
        data.put("returnCode", returnCode);
        data.put("meetingDetailsList", meetingResponseDetails);
        data.put("msgKey", msgKey);
        data.put("msg", msg);

        processData(getTemplate("get-meetings.ftlx"), data, xmlText);

        return xmlText.toString();
    }

    public String buildIsMeetingRunning(Boolean isRunning, String returnCode) {
        StringWriter xmlText = new StringWriter();

        Map<String, Object> data = new HashMap<String, Object>();
        data.put("returnCode", returnCode);
        data.put("isRunning", isRunning);

        processData(getTemplate("is-meeting-running.ftlx"), data, xmlText);

        return xmlText.toString();
    }

    public String buildEndRunning(String msgKey, String msg, String returnCode) {
        StringWriter xmlText = new StringWriter();

        Map<String, Object> data = new HashMap<String, Object>();
        data.put("returnCode", returnCode);
        data.put("msgKey", msgKey);
        data.put("msg", msg);

        processData(getTemplate("end-meeting.ftlx"), data, xmlText);

        return xmlText.toString();
    }

    public String buildGetSessionsResponse(Collection<UserSession> sessions, String msgKey, String msg,
            String returnCode) {
        StringWriter xmlText = new StringWriter();

        Map<String, Serializable> data = new HashMap<String, Serializable>();
        data.put("returnCode", returnCode);
        data.put("sessionsList", new ArrayList<UserSession>(sessions));
        data.put("msgKey", msgKey);
        data.put("msg", msg);

        processData(getTemplate("get-sessions.ftlx"), data, xmlText);

        return xmlText.toString();
    }

    public String buildGetRecordingsResponse(List<RecordingMetadata> recordings, String returnCode) {

        StringWriter xmlText = new StringWriter();

        Map<String, Object> data = new HashMap<String, Object>();
        data.put("returnCode", returnCode);
        data.put("recordings", recordings);

        processData(getTemplate("get-recordings.ftlx"), data, xmlText);
        return xmlText.toString();
    }

    public String buildConfgXmlReject(String message, String logoutUrl, String returnCode) {

        StringWriter xmlText = new StringWriter();

        Map<String, Object> data = new HashMap<String, Object>();
        data.put("returnCode", returnCode);
        data.put("message", message);
        data.put("logoutUrl", logoutUrl);

        processData(getTemplate("config-xml-rejected.ftlx"), data, xmlText);
        return xmlText.toString();
    }

    private Template getTemplate(String templateName) {
        Template ftl = null;
        try {
            ftl = cfg.getTemplate(templateName);
        } catch (IOException e) {
            log.error("IO exception for {} : ", templateName, e);
        }
        return ftl;
    }

    private void processData(Template template, Map data, StringWriter out) {
        try {
            template.process(data, out);
        } catch (TemplateException e) {
            log.error("Template exception : ", e);
        } catch (IOException e) {
            log.error("IO exception for get-recordings.ftlx : ", e);
        }
    }
}
