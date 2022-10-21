package org.bigbluebutton.rest.v1;

import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestMethod;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.multipart.MultipartFile;

import javax.servlet.http.HttpServletRequest;

public interface PresentationApiV1 {

    @RequestMapping(value = "/checkPresentation", produces = MediaType.APPLICATION_XML_VALUE, method = RequestMethod.GET)
    ResponseEntity<String> checkPresentation(HttpServletRequest request);

    @RequestMapping(value = "/upload", produces = MediaType.APPLICATION_XML_VALUE, method = RequestMethod.GET)
    ResponseEntity<String> upload(@RequestParam("fileUpload") MultipartFile file, HttpServletRequest request);

    @RequestMapping(value = "/testConversion", produces = MediaType.APPLICATION_XML_VALUE, method = RequestMethod.GET)
    ResponseEntity<Object> testConversion(HttpServletRequest request);

    @RequestMapping(value = "/delegate", produces = MediaType.APPLICATION_XML_VALUE, method = RequestMethod.GET)
    ResponseEntity<String> delegate(HttpServletRequest request);

    @RequestMapping(value = "/showSlide", produces = MediaType.APPLICATION_XML_VALUE, method = RequestMethod.GET)
    ResponseEntity<byte[]> showSlide(HttpServletRequest request);

    @RequestMapping(value = "/showSvg", produces = MediaType.APPLICATION_XML_VALUE, method = RequestMethod.GET)
    ResponseEntity<byte[]> showSvg(HttpServletRequest request);

    @RequestMapping(value = "/showThumbnail", produces = MediaType.APPLICATION_XML_VALUE, method = RequestMethod.GET)
    ResponseEntity<byte[]> showThumbnail(HttpServletRequest request);

    @RequestMapping(value = "/showPng", produces = MediaType.APPLICATION_XML_VALUE, method = RequestMethod.GET)
    ResponseEntity<byte[]> showPng(HttpServletRequest request);

    @RequestMapping(value = "/ShowTextFie", produces = MediaType.APPLICATION_XML_VALUE, method = RequestMethod.GET)
    ResponseEntity<byte[]> showTextFile(HttpServletRequest request);

    @RequestMapping(value = "/downloadFile", produces = MediaType.APPLICATION_XML_VALUE, method = RequestMethod.GET)
    ResponseEntity<byte[]> downloadFile(HttpServletRequest request);

    @RequestMapping(value = "/numSlides", produces = MediaType.APPLICATION_XML_VALUE, method = RequestMethod.GET)
    ResponseEntity<String> numSlides(HttpServletRequest request);

    @RequestMapping(value = "/numThumbnails", produces = MediaType.APPLICATION_XML_VALUE, method = RequestMethod.GET)
    ResponseEntity<String> numThumbnails(HttpServletRequest request);

    @RequestMapping(value = "/numSvgs", produces = MediaType.APPLICATION_XML_VALUE, method = RequestMethod.GET)
    ResponseEntity<String> numSvgs(HttpServletRequest request);

    @RequestMapping(value = "/numTextFiles", produces = MediaType.APPLICATION_XML_VALUE, method = RequestMethod.GET)
    ResponseEntity<String> numTextFiles(HttpServletRequest request);
}
