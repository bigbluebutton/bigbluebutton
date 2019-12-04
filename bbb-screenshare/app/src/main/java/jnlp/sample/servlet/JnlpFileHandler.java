/*
 * Copyright (c) 2006, 2010, Oracle and/or its affiliates. All rights reserved.
 *
 * Redistribution and use in source and binary forms, with or without
 * modification, are permitted provided that the following conditions are met:
 *
 * -Redistribution of source code must retain the above copyright notice, this
 *  list of conditions and the following disclaimer.
 *
 * -Redistribution in binary form must reproduce the above copyright notice,
 *  this list of conditions and the following disclaimer in the documentation
 *  and/or other materials provided with the distribution.
 *
 * Neither the name of Oracle nor the names of contributors may
 * be used to endorse or promote products derived from this software without
 * specific prior written permission.
 *
 * This software is provided "AS IS," without a warranty of any kind. ALL
 * EXPRESS OR IMPLIED CONDITIONS, REPRESENTATIONS AND WARRANTIES, INCLUDING
 * ANY IMPLIED WARRANTY OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE
 * OR NON-INFRINGEMENT, ARE HEREBY EXCLUDED. SUN MICROSYSTEMS, INC. ("SUN")
 * AND ITS LICENSORS SHALL NOT BE LIABLE FOR ANY DAMAGES SUFFERED BY LICENSEE
 * AS A RESULT OF USING, MODIFYING OR DISTRIBUTING THIS SOFTWARE OR ITS
 * DERIVATIVES. IN NO EVENT WILL SUN OR ITS LICENSORS BE LIABLE FOR ANY LOST
 * REVENUE, PROFIT OR DATA, OR FOR DIRECT, INDIRECT, SPECIAL, CONSEQUENTIAL,
 * INCIDENTAL OR PUNITIVE DAMAGES, HOWEVER CAUSED AND REGARDLESS OF THE THEORY
 * OF LIABILITY, ARISING OUT OF THE USE OF OR INABILITY TO USE THIS SOFTWARE,
 * EVEN IF SUN HAS BEEN ADVISED OF THE POSSIBILITY OF SUCH DAMAGES.
 *
 * You acknowledge that this software is not designed, licensed or intended
 * for use in the design, construction, operation or maintenance of any
 * nuclear facility.
 */

package jnlp.sample.servlet;

import java.util.*;
import java.util.regex.*;
import java.net.*;
import java.io.*;
import javax.servlet.*;
import javax.servlet.http.*;
import javax.xml.parsers.*;

import com.sun.org.apache.xpath.internal.operations.Bool;
import org.xml.sax.*;
import javax.xml.transform.*;
import javax.xml.transform.dom.DOMSource;
import javax.xml.transform.stream.StreamResult;

import org.bigbluebutton.app.screenshare.ScreenShareInfo;
import org.bigbluebutton.app.screenshare.ScreenShareInfoResponse;
import org.bigbluebutton.app.screenshare.server.servlet.JnlpConfigurator;
import org.red5.logging.Red5LoggerFactory;
import org.slf4j.Logger;
import org.springframework.context.ApplicationContext;
import org.springframework.web.context.WebApplicationContext;
import org.w3c.dom.*;

/* The JNLP file handler implements a class that keeps
 * track of JNLP files and their specializations
 */
public class JnlpFileHandler {
  final private Logger log = Red5LoggerFactory.getLogger(JnlpFileHandler.class, "screenshare");

  private static final String JNLP_MIME_TYPE = "application/x-java-jnlp-file";
  private static final String HEADER_LASTMOD = "Last-Modified";

  private ServletContext _servletContext;
  private HashMap<String, JnlpFileEntry> _jnlpFiles = null;

  private boolean hasConfigurator = false;
  private JnlpConfigurator configurator = null;
  
  /** Initialize JnlpFileHandler for the specific ServletContext */
  public JnlpFileHandler(ServletContext servletContext) {
    _servletContext = servletContext;
    _jnlpFiles = new HashMap<String, JnlpFileEntry>();
  }

  private static class JnlpFileEntry {
    // Response
    DownloadResponse _response;
    // Keeps track of cache is out of date
    private long   _lastModified;

    // Constructor
    JnlpFileEntry(DownloadResponse response, long lastmodfied) {
      _response = response;
      _lastModified = lastmodfied;
    }

    public DownloadResponse getResponse() { return _response; }
    long getLastModified() { return _lastModified; }
  }

  /* Main method to lookup an entry */
  public synchronized DownloadResponse getJnlpFile(JnlpResource jnlpres, DownloadRequest dreq)
      throws IOException {
    log.debug("In getJnlpFile");
    
    String path = jnlpres.getPath();
    URL resource = jnlpres.getResource();
    long lastModified = jnlpres.getLastModified();

    log.debug("lastModified: " + lastModified + " " + new Date(lastModified));
    if (lastModified == 0) {
      log.warn("servlet.log.warning.nolastmodified", path);
    }

    // fix for 4474854:  use the request URL as key to look up jnlp file
    // in hash map
    String reqUrl = HttpUtils.getRequestURL(dreq.getHttpRequest()).toString();

    // Read information from WAR file
    long timeStamp = new java.util.Date().getTime();;
    String mimeType = _servletContext.getMimeType(path);
    if (mimeType == null) mimeType = JNLP_MIME_TYPE;

    StringBuffer jnlpFileTemplate = new StringBuffer();
    URLConnection conn = resource.openConnection();
    BufferedReader br = new BufferedReader(new InputStreamReader(conn.getInputStream(), "UTF-8"));
    String line = br.readLine();
    if (line != null && line.startsWith("TS:")) {
      timeStamp = parseTimeStamp(line.substring(3));
      log.debug("Timestamp: " + timeStamp + " " + new Date(timeStamp));
      if (timeStamp == 0) {
        log.warn("servlet.log.warning.notimestamp", path);
        timeStamp = lastModified;
      }
      line = br.readLine();
    }
    while(line != null) {
      jnlpFileTemplate.append(line);
      line = br.readLine();
    }

    if (! hasConfigurator) {
      configurator = getConfigurator();
      if (configurator != null) hasConfigurator = true;
    }
    
    String jnlpFileContent = specializeJnlpTemplate(dreq.getHttpRequest(), path, jnlpFileTemplate.toString());

    // Convert to bytes as a UTF-8 encoding
    byte[] byteContent = jnlpFileContent.getBytes("UTF-8");

    timeStamp = new java.util.Date().getTime();
    
    // Create entry
    DownloadResponse resp = DownloadResponse.getFileDownloadResponse(byteContent,
        mimeType,
        timeStamp,
        jnlpres.getReturnVersionId());

    log.debug("JNLP: mime=[" + mimeType + "] timestamp=[" + timeStamp + "] version=[" + jnlpres.getReturnVersionId() + "]");
    return resp;
  }

  /* Main method to lookup an entry (NEW for JavaWebStart 1.5+) */
  public synchronized DownloadResponse getJnlpFileEx(JnlpResource jnlpres, DownloadRequest dreq)
      throws IOException {
    
    log.debug("In getJnlpFileEx");
    
    String path = jnlpres.getPath();
    URL resource = jnlpres.getResource();
    long lastModified = jnlpres.getLastModified();


    log.debug("lastModified: " + lastModified + " " + new Date(lastModified));
    if (lastModified == 0) {
      log.warn("servlet.log.warning.nolastmodified", path);
    }
    
    if (! hasConfigurator) {
      configurator = getConfigurator();
      if (configurator != null) hasConfigurator = true;
    }

    // fix for 4474854:  use the request URL as key to look up jnlp file
    // in hash map
    String reqUrl = HttpUtils.getRequestURL(dreq.getHttpRequest()).toString();
    // SQE: To support query string, we changed the hash key from Request URL to (Request URL + query string)
    if (dreq.getQuery() != null)
      reqUrl += dreq.getQuery();

    // Read information from WAR file
    long timeStamp = lastModified;
    String mimeType = _servletContext.getMimeType(path);
    if (mimeType == null) mimeType = JNLP_MIME_TYPE;

    StringBuffer jnlpFileTemplate = new StringBuffer();
    URLConnection conn = resource.openConnection();
    BufferedReader br = new BufferedReader(new InputStreamReader(conn.getInputStream(), "UTF-8"));
    String line = br.readLine();
    if (line != null && line.startsWith("TS:")) {
      timeStamp = parseTimeStamp(line.substring(3));
      log.debug("Timestamp: " + timeStamp + " " + new Date(timeStamp));
      if (timeStamp == 0) {
        log.warn("servlet.log.warning.notimestamp", path);
        timeStamp = lastModified;
      }
      line = br.readLine();
    }
    while(line != null) {
      jnlpFileTemplate.append(line);
      line = br.readLine();
    }

    String jnlpFileContent = specializeJnlpTemplate(dreq.getHttpRequest(), path, jnlpFileTemplate.toString());

    /* SQE: We need to add query string back to href in jnlp file. We also need to handle JRE requirement for
     * the test. We reconstruct the xml DOM object, modify the value, then regenerate the jnlpFileContent.
     */
    String query = dreq.getQuery();
    String testJRE = dreq.getTestJRE();
    log.debug("Double check query string: " + query);
    // For backward compatibility: Always check if the href value exists.
    // Bug 4939273: We will retain the jnlp template structure and will NOT add href value. Above old
    // approach to always check href value caused some test case not run.
    if (query != null) {
      byte [] cb = jnlpFileContent.getBytes("UTF-8");
      ByteArrayInputStream bis = new ByteArrayInputStream(cb);
      try {
        DocumentBuilderFactory factory = DocumentBuilderFactory.newInstance();
        DocumentBuilder builder = factory.newDocumentBuilder();
        Document document = builder.parse(bis);
        if (document != null && document.getNodeType() == Node.DOCUMENT_NODE) {
          boolean modified = false;
          Element root = document.getDocumentElement();

          if (root.hasAttribute("href") && query != null) {
            String href = root.getAttribute("href");
            root.setAttribute("href", href + "?" + query);
            modified = true;
          }
          // Update version value for j2se tag
          if (testJRE != null) {
            NodeList j2seNL = root.getElementsByTagName("j2se");
            if (j2seNL != null) {
              Element j2se = (Element) j2seNL.item(0);
              String ver = j2se.getAttribute("version");
              if (ver.length() > 0) {
                j2se.setAttribute("version", testJRE);
                modified = true;
              }
            }
          }
          TransformerFactory tFactory = TransformerFactory.newInstance();
          Transformer transformer = tFactory.newTransformer();
          DOMSource source = new DOMSource(document);
          StringWriter sw = new StringWriter();
          StreamResult result = new StreamResult(sw);
          transformer.transform(source, result);
          jnlpFileContent = sw.toString();
          log.debug("Converted jnlpFileContent: " + jnlpFileContent);
          // Since we modified the file on the fly, we always update the timestamp value with current time
          if (modified) {
            timeStamp = new java.util.Date().getTime();
            log.debug("Last modified on the fly:  " + timeStamp);
          }
        }
      } catch (Exception e) {
        log.debug(e.toString(), e);
      }
    }

    // Convert to bytes as a UTF-8 encoding
    byte[] byteContent = jnlpFileContent.getBytes("UTF-8");

    // Create entry
    DownloadResponse resp = DownloadResponse.getFileDownloadResponse(byteContent,
        mimeType,
        timeStamp,
        jnlpres.getReturnVersionId());

    return resp;
  }

  /* This method performs the following substituations
   *  $$name
   *  $$codebase
   *  $$context
   */
  private String specializeJnlpTemplate(HttpServletRequest request, String respath, String jnlpTemplate) {
    log.debug("Query string = [" + request.getQueryString().trim() + "]");

    String errorMessage = "NO_ERRORS";
    String authParam = request.getParameter("authToken");
    String authToken = "unknown";
    if (authParam != null && authParam != "") {
      authToken = authParam.trim();    
    } else {
      errorMessage = "MISSING_AUTHTOKEN";
    }

    String fullScreen = request.getParameter("fullScreen");
    if (fullScreen != null && fullScreen != "") {
      fullScreen = fullScreen.trim();    
    } else {
      errorMessage = "MISSING_FULLSCREEN";
    }    
    
    String meetingId = request.getParameter("meetingId");
    if (meetingId != null && meetingId != "") {
      meetingId = meetingId.trim();    
    } else {
      errorMessage = "MISSING_MEETINGID";
    }    
    
    ScreenShareInfo sInfo =  configurator.getScreenShareInfo(meetingId, authToken);
    String publishUrl = "unknown";
    String streamId = "unknown";
    String session = "none";
    if (sInfo == null) {
      errorMessage = "ERROR_GETTING_INFO_USING_TOKEN";
    } else {

      System.out.println("********* URL=" + sInfo.publishUrl);
      if (sInfo.tunnel) {
        publishUrl = sInfo.publishUrl.replaceFirst("rtmp","rtmpt");
      } else {
        publishUrl = sInfo.publishUrl;
      }

      streamId = sInfo.streamId;
      session = sInfo.session;
    }


    System.out.println("********* URL=" + publishUrl);

    String jnlpUrl = configurator.getJnlpUrl();
    Boolean useH264 = configurator.isUseH264();
    
    String codecOptions = configurator.getCodecOptions();
    log.debug("Codec Options = [" + codecOptions + "]");
    
    String urlprefix = getUrlPrefix(request);
    int idx = respath.lastIndexOf('/'); //
    String name = respath.substring(idx + 1);    // Exclude /
    String codebase = respath.substring(0, idx + 1); // Include /
    jnlpTemplate = substitute(jnlpTemplate, "$$name",  name);
    jnlpTemplate = substitute(jnlpTemplate, "$$jnlpUrl",  jnlpUrl);
    jnlpTemplate = substitute(jnlpTemplate, "$$serverUrl",  jnlpUrl);   
    jnlpTemplate = substitute(jnlpTemplate, "$$publishUrl",  publishUrl);
    jnlpTemplate = substitute(jnlpTemplate, "$$fullScreen",  fullScreen);
    jnlpTemplate = substitute(jnlpTemplate, "$$meetingId",  meetingId);
    jnlpTemplate = substitute(jnlpTemplate, "$$session",  session);
    jnlpTemplate = substitute(jnlpTemplate, "$$streamId",  streamId);
    jnlpTemplate = substitute(jnlpTemplate, "$$codecOptions",  codecOptions);
    jnlpTemplate = substitute(jnlpTemplate, "$$useH264",  useH264.toString());
    jnlpTemplate = substitute(jnlpTemplate, "$$errorMessage",  errorMessage);
    // fix for 5039951: Add $$hostname macro
    jnlpTemplate = substitute(jnlpTemplate, "$$hostname",  request.getServerName());
    jnlpTemplate = substitute(jnlpTemplate, "$$codebase",  urlprefix + request.getContextPath() + codebase);
    jnlpTemplate = substitute(jnlpTemplate, "$$context", urlprefix + request.getContextPath());
    // fix for 6256326: add $$site macro to sample jnlp servlet
    jnlpTemplate = substitute(jnlpTemplate, "$$site", urlprefix);


    System.out.println("JNLP Response: " + jnlpTemplate);

    return jnlpTemplate;
  }

  // This code is heavily inspired by the stuff in HttpUtils.getRequestURL
  private String getUrlPrefix(HttpServletRequest req) {
    StringBuffer url = new StringBuffer();
    String scheme = req.getScheme();
    int port = req.getServerPort();
    url.append(scheme);             // http, https
    url.append("://");
    url.append(req.getServerName());
    if ((scheme.equals("http") && port != 80)
        || (scheme.equals("https") && port != 443)) {
      url.append(':');
      url.append(req.getServerPort());
    }
    return url.toString();
  }

  private String substitute(String target, String key, String value) {
    int start = 0;
    do {
      int idx = target.indexOf(key, start);
      if (idx == -1) return target;
      target =  target.substring(0, idx) + value + target.substring(idx + key.length());
      start = idx + value.length();
    } while(true);
  }

  /** Parses a ISO 8601 Timestamp. The format of the timestamp is:
   *
   *   YYYY-MM-DD hh:mm:ss  or   YYYYMMDDhhmmss
   *
   * Hours (hh) is in 24h format. ss are optional. Time are by default relative
   * to the current timezone. Timezone information can be specified
   * by:
   *
   *    - Appending a 'Z', e.g., 2001-12-19 12:00Z
   *    - Appending +hh:mm, +hhmm, +hh, -hh:mm -hhmm, -hh to
   *      indicate that the locale timezone used is either the specified
   *      amound before or after GMT. For example,
   *
   *           12:00Z = 13:00+1:00 = 0700-0500
   *
   *  The method returns 0 if it cannot pass the string. Otherwise, it is
   *  the number of milliseconds size sometime in 1969.
   */
  private long parseTimeStamp(String timestamp) {
    int YYYY = 0;
    int MM = 0;
    int DD = 0;
    int hh = 0;
    int mm = 0;
    int ss = 0;

    timestamp = timestamp.trim();
    try {
      // Check what format is used
      if (matchPattern("####-##-## ##:##", timestamp)) {
        YYYY = getIntValue(timestamp, 0, 4);
        MM = getIntValue(timestamp, 5, 7);
        DD = getIntValue(timestamp, 8, 10);
        hh = getIntValue(timestamp, 11, 13);
        mm = getIntValue(timestamp, 14, 16);
        timestamp = timestamp.substring(16);
        if (matchPattern(":##", timestamp)) {
          ss = getIntValue(timestamp, 1, 3);
          timestamp = timestamp.substring(3);
        }
      } else if (matchPattern("############", timestamp)) {
        YYYY = getIntValue(timestamp, 0, 4);
        MM = getIntValue(timestamp, 4, 6);
        DD = getIntValue(timestamp, 6, 8);
        hh = getIntValue(timestamp, 8, 10);
        mm = getIntValue(timestamp, 10, 12);
        timestamp = timestamp.substring(12);
        if (matchPattern("##", timestamp)) {
          ss = getIntValue(timestamp, 0, 2);
          timestamp = timestamp.substring(2);
        }
      } else {
        // Unknown format
        return 0;
      }
    } catch(NumberFormatException e) {
      // Bad number
      return 0;
    }

    String timezone = null;
    // Remove timezone information
    timestamp = timestamp.trim();
    if (timestamp.equalsIgnoreCase("Z")) {
      timezone ="GMT";
    } else if (timestamp.startsWith("+") || timestamp.startsWith("-")) {
      timezone = "GMT" + timestamp;
    }

    if (timezone == null) {
      // Date is relative to current locale
      Calendar cal = Calendar.getInstance();
      cal.set(YYYY, MM - 1, DD, hh, mm, ss);
      return cal.getTime().getTime();
    } else {
      // Date is relative to a timezone
      Calendar cal = Calendar.getInstance(TimeZone.getTimeZone(timezone));
      cal.set(YYYY, MM - 1, DD, hh, mm, ss);
      return cal.getTime().getTime();
    }
  }

  private int getIntValue(String key, int start, int end) {
    return Integer.parseInt(key.substring(start, end));
  }

  private boolean matchPattern(String pattern, String key) {
    // Key must be longer than pattern
    if (key.length() < pattern.length()) return false;
    for(int i = 0; i < pattern.length(); i++) {
      char format = pattern.charAt(i);
      char ch = key.charAt(i);
      if (!((format == '#' && Character.isDigit(ch)) || (format == ch))) {
        return false;
      }
    }
    return true;
  }
  
  private JnlpConfigurator getConfigurator() {
    JnlpConfigurator jnlpConfigurator = null;
    if (_servletContext != null) {
      //Grab a reference to the application context
      ApplicationContext appCtx = (ApplicationContext) _servletContext.getAttribute(WebApplicationContext.ROOT_WEB_APPLICATION_CONTEXT_ATTRIBUTE);

      //Get the bean holding the parameter
      jnlpConfigurator = (JnlpConfigurator) appCtx.getBean("jnlpConfigurator");
      if (jnlpConfigurator != null) {
        log.debug("JnlpConfigurator initialized.");
      }  else {
        log.error("Failed to initialize JnlpConfigurator.");
      }
    } else {
      log.error("Failed to initialize JnlpConfigurator. Context is undefined.");
    }

    return jnlpConfigurator;
  }
  
}
