package org.bigbluebutton.rest.v1;

import org.bigbluebutton.response.Response;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestMethod;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.multipart.MultipartFile;

import javax.servlet.http.HttpServletRequest;

public interface RecordingApiV1 {

    @RequestMapping(value = "/getRecordings", produces = {
            MediaType.APPLICATION_XML_VALUE }, method = RequestMethod.GET)
    String getRecordings(HttpServletRequest request);

    @RequestMapping(value = "/publishRecordings", produces = {
            MediaType.APPLICATION_XML_VALUE }, method = RequestMethod.GET)
    String publishRecordings(HttpServletRequest request);

    @RequestMapping(value = "/deleteRecordings", produces = {
            MediaType.APPLICATION_XML_VALUE }, method = RequestMethod.GET)
    String deleteRecordings(HttpServletRequest request);

    @RequestMapping(value = "/updateRecordings", produces = {
            MediaType.APPLICATION_XML_VALUE }, method = RequestMethod.GET)
    String updateRecordings(HttpServletRequest request);

    @RequestMapping(value = "/getRecordingTextTracks", produces = {
            MediaType.APPLICATION_JSON_VALUE }, method = RequestMethod.GET)
    ResponseEntity<Response> getRecordingTextTracks(HttpServletRequest request);

    @RequestMapping(value = "/putRecordingTextTrack", produces = {
            MediaType.APPLICATION_JSON_VALUE }, method = RequestMethod.POST)
    ResponseEntity<Response> putRecordingTextTrack(@RequestParam("file") MultipartFile file,
            HttpServletRequest request);

    @RequestMapping(value = "/getMeetingSummary", produces = {
            MediaType.APPLICATION_XML_VALUE }, method = RequestMethod.GET)
    String getMeetingSummary(HttpServletRequest request);
}
