package org.bigbluebutton.security;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.dataformat.xml.XmlMapper;
import org.bigbluebutton.response.ResponseEnvelope;
import org.bigbluebutton.response.error.Error;
import org.bigbluebutton.response.error.Errors;
import org.springframework.security.core.AuthenticationException;
import org.springframework.security.web.AuthenticationEntryPoint;

import javax.servlet.ServletException;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import java.io.IOException;

public class V2AuthenticationEntryPoint implements AuthenticationEntryPoint {

    @Override
    public void commence(HttpServletRequest request, HttpServletResponse response,
            AuthenticationException authException) throws IOException, ServletException {
        response.setStatus(401);
        ResponseEnvelope envelope = new ResponseEnvelope();
        Errors errors = new Errors();
        errors.addError(Error.AUTHENTICATION_FAILED);
        envelope.setErrors(errors);

        String content;
        String accept = request.getHeader("Accept");
        if (accept.equalsIgnoreCase("application/xml")) {
            XmlMapper mapper = new XmlMapper();
            content = mapper.writeValueAsString(envelope);
        } else {
            ObjectMapper mapper = new ObjectMapper();
            content = mapper.writeValueAsString(envelope);
        }

        response.getOutputStream().print(content);
    }
}
