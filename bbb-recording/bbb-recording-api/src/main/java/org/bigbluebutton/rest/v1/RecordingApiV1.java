package org.bigbluebutton.rest.v1;

import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.enums.ParameterIn;
import org.springframework.http.MediaType;
import org.springframework.util.MultiValueMap;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestMethod;
import org.springframework.web.bind.annotation.RequestParam;

import javax.servlet.http.HttpServletRequest;
import java.util.List;

public interface RecordingApiV1 {

    @RequestMapping(value = "/v1/getRecordings", produces = { MediaType.APPLICATION_XML_VALUE }, method = RequestMethod.GET)
    String getRecordings(HttpServletRequest request);

    @RequestMapping(value = "/v1/publishRecordings", produces = { MediaType.APPLICATION_XML_VALUE }, method = RequestMethod.GET)
    String publishRecordings(HttpServletRequest request);

    @RequestMapping(value = "/v1/deleteRecordings", produces = { MediaType.APPLICATION_XML_VALUE }, method = RequestMethod.GET)
    String deleteRecordings(HttpServletRequest request);

    @RequestMapping(value = "/v1/updateRecordings", produces = { MediaType.APPLICATION_XML_VALUE }, method = RequestMethod.GET)
    String updateRecordings(HttpServletRequest request);
}
