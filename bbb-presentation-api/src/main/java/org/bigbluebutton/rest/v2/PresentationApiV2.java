package org.bigbluebutton.rest.v2;

import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.enums.ParameterIn;
import org.bigbluebutton.request.PresentationUploadInfo;
import org.bigbluebutton.response.Response;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import javax.validation.Valid;

public interface PresentationApiV2 {

    @RequestMapping(value = "", produces = { MediaType.APPLICATION_JSON_VALUE,
            MediaType.APPLICATION_XML_VALUE }, method = RequestMethod.POST)
    ResponseEntity<Response> uploadPresentation(
            @RequestPart(value = "info") @Valid PresentationUploadInfo info,
            @RequestPart(value = "file") MultipartFile file
    );

    @RequestMapping(value = "/{token}/check", produces = { MediaType.APPLICATION_JSON_VALUE,
            MediaType.APPLICATION_XML_VALUE }, method = RequestMethod.GET)
    ResponseEntity<Response> checkPresentation(
            @Parameter(in = ParameterIn.PATH, description = "Presentation auth token", required = true) @PathVariable("token") String token,
            @Parameter(in = ParameterIn.QUERY, description = "Original content length", required = true) @RequestParam("length") String length
    );

//    @RequestMapping(value = "/testConversion", produces = MediaType.APPLICATION_XML_VALUE, method = RequestMethod.GET)
//    ResponseEntity<Object> testConversion(HttpServletRequest request);
//
//    @RequestMapping(value = "/delegate", produces = MediaType.APPLICATION_XML_VALUE, method = RequestMethod.GET)
//    ResponseEntity<String> delegate(HttpServletRequest request);

    @RequestMapping(value = "/{conference}/{room}/{name}/slides", produces = { MediaType.APPLICATION_JSON_VALUE,
            MediaType.APPLICATION_XML_VALUE }, method = RequestMethod.GET)
    ResponseEntity<Response> numSlides(
            @Parameter(in = ParameterIn.PATH, description = "Conference the presentation belongs to", required = true) @PathVariable("conference") String conference,
            @Parameter(in = ParameterIn.PATH, description = "Room in the conference", required = true) @PathVariable("room") String room,
            @Parameter(in = ParameterIn.PATH, description = "Name of the presentation", required = true) @PathVariable("name") String name
    );

    @RequestMapping(value = "/{conference}/{room}/{name}/slides/{slide}", produces = { MediaType.APPLICATION_JSON_VALUE,
            MediaType.APPLICATION_XML_VALUE }, method = RequestMethod.GET)
    ResponseEntity<Response> showSlide(
            @Parameter(in = ParameterIn.PATH, description = "Conference the presentation belongs to", required = true) @PathVariable("conference") String conference,
            @Parameter(in = ParameterIn.PATH, description = "Room in the conference", required = true) @PathVariable("room") String room,
            @Parameter(in = ParameterIn.PATH, description = "Name of the presentation", required = true) @PathVariable("name") String name,
            @Parameter(in = ParameterIn.PATH, description = "Slide to be shown", required = true) @PathVariable("slide") String slide
    );

    @RequestMapping(value = "/{conference}/{room}/{name}/svgs", produces = { MediaType.APPLICATION_JSON_VALUE,
            MediaType.APPLICATION_XML_VALUE }, method = RequestMethod.GET)
    ResponseEntity<Response> numSvgs(
            @Parameter(in = ParameterIn.PATH, description = "Conference the presentation belongs to", required = true) @PathVariable("conference") String conference,
            @Parameter(in = ParameterIn.PATH, description = "Room in the conference", required = true) @PathVariable("room") String room,
            @Parameter(in = ParameterIn.PATH, description = "Name of the presentation", required = true) @PathVariable("name") String name
    );

    @RequestMapping(value = "/{conference}/{room}/{name}/svgs/{svg}", produces = { MediaType.APPLICATION_JSON_VALUE,
            MediaType.APPLICATION_XML_VALUE }, method = RequestMethod.GET)
    ResponseEntity<Response> showSvg(
            @Parameter(in = ParameterIn.PATH, description = "Conference the presentation belongs to", required = true) @PathVariable("conference") String conference,
            @Parameter(in = ParameterIn.PATH, description = "Room in the conference", required = true) @PathVariable("room") String room,
            @Parameter(in = ParameterIn.PATH, description = "Name of the presentation", required = true) @PathVariable("name") String name,
            @Parameter(in = ParameterIn.PATH, description = "SVG to be shown", required = true) @PathVariable("svg") String svg
    );

    @RequestMapping(value = "/{conference}/{room}/{name}/thumbnails", produces = { MediaType.APPLICATION_JSON_VALUE,
            MediaType.APPLICATION_XML_VALUE }, method = RequestMethod.GET)
    ResponseEntity<Response> numThumbnails(
            @Parameter(in = ParameterIn.PATH, description = "Conference the presentation belongs to", required = true) @PathVariable("conference") String conference,
            @Parameter(in = ParameterIn.PATH, description = "Room in the conference", required = true) @PathVariable("room") String room,
            @Parameter(in = ParameterIn.PATH, description = "Name of the presentation", required = true) @PathVariable("name") String name
    );

    @RequestMapping(value = "/{conference}/{room}/{name}/thumbnails/{thumbnail}", produces = { MediaType.APPLICATION_JSON_VALUE,
            MediaType.APPLICATION_XML_VALUE }, method = RequestMethod.GET)
    ResponseEntity<Response> showThumbnail(
            @Parameter(in = ParameterIn.PATH, description = "Conference the presentation belongs to", required = true) @PathVariable("conference") String conference,
            @Parameter(in = ParameterIn.PATH, description = "Room in the conference", required = true) @PathVariable("room") String room,
            @Parameter(in = ParameterIn.PATH, description = "Name of the presentation", required = true) @PathVariable("name") String name,
            @Parameter(in = ParameterIn.PATH, description = "Thumbnail to be shown", required = true) @PathVariable("thumbnail") String thumbnail
    );

    @RequestMapping(value = "/{conference}/{room}/{name}/pngs/{png}", produces = { MediaType.APPLICATION_JSON_VALUE,
            MediaType.APPLICATION_XML_VALUE }, method = RequestMethod.GET)
    ResponseEntity<Response> showPng(
            @Parameter(in = ParameterIn.PATH, description = "Conference the presentation belongs to", required = true) @PathVariable("conference") String conference,
            @Parameter(in = ParameterIn.PATH, description = "Room in the conference", required = true) @PathVariable("room") String room,
            @Parameter(in = ParameterIn.PATH, description = "Name of the presentation", required = true) @PathVariable("name") String name,
            @Parameter(in = ParameterIn.PATH, description = "PNG to be shown", required = true) @PathVariable("png") String png
    );

    @RequestMapping(value = "/{conference}/{room}/{name}/files", produces = { MediaType.APPLICATION_JSON_VALUE,
            MediaType.APPLICATION_XML_VALUE }, method = RequestMethod.GET)
    ResponseEntity<Response> numTextFiles(
            @Parameter(in = ParameterIn.PATH, description = "Conference the presentation belongs to", required = true) @PathVariable("conference") String conference,
            @Parameter(in = ParameterIn.PATH, description = "Room in the conference", required = true) @PathVariable("room") String room,
            @Parameter(in = ParameterIn.PATH, description = "Name of the presentation", required = true) @PathVariable("name") String name
    );

    @RequestMapping(value = "/{conference}/{room}/{name}/files/{file}", produces = { MediaType.APPLICATION_JSON_VALUE,
            MediaType.APPLICATION_XML_VALUE }, method = RequestMethod.GET)
    ResponseEntity<Response> showTextFile(
            @Parameter(in = ParameterIn.PATH, description = "Conference the presentation belongs to", required = true) @PathVariable("conference") String conference,
            @Parameter(in = ParameterIn.PATH, description = "Room in the conference", required = true) @PathVariable("room") String room,
            @Parameter(in = ParameterIn.PATH, description = "Name of the presentation", required = true) @PathVariable("name") String name,
            @Parameter(in = ParameterIn.PATH, description = "Text file to be shown", required = true) @PathVariable("file") String file
    );

    @RequestMapping(value = "/{meeting}/{id}/{name}", produces = { MediaType.APPLICATION_JSON_VALUE,
            MediaType.APPLICATION_XML_VALUE }, method = RequestMethod.GET)
    ResponseEntity<Response> downloadFile(
            @Parameter(in = ParameterIn.PATH, description = "Meeting the  presentation belongs to", required = true) @PathVariable("conference") String meeting,
            @Parameter(in = ParameterIn.PATH, description = "Presentation ID", required = true) @PathVariable("id") String id,
            @Parameter(in = ParameterIn.PATH, description = "Name of the presentation", required = true) @PathVariable("name") String name
    );
}
