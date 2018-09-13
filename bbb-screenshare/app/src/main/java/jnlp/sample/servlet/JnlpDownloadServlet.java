

package jnlp.sample.servlet;

import java.io.*;
import java.util.*;
import java.net.*;
import javax.servlet.*;
import javax.servlet.http.*;
import org.bigbluebutton.app.screenshare.IScreenShareApplication;
import org.red5.logging.Red5LoggerFactory;
import org.slf4j.Logger;
import org.springframework.context.ApplicationContext;
import org.springframework.web.context.WebApplicationContext;

/**
 * This Servlet class is an implementation of JNLP Specification's
 * Download Protocols.
 *
 * All requests to this servlet is in the form of HTTP GET commands.
 * The parameters that are needed are:
 * <ul>
 * <li><code>arch</code>,
 * <li><code>os</code>,
 * <li><code>locale</code>,
 * <li><code>version-id</code> or <code>platform-version-id</code>,
 * <li><code>current-version-id</code>,
 * <li>code>known-platforms</code>
 * </ul>
 * <p>
 *
 * @version 1.8 01/23/03
 */
public class JnlpDownloadServlet extends HttpServlet {
  final private Logger log = Red5LoggerFactory.getLogger(JnlpDownloadServlet.class, "screenshare");

  // Localization
  private static ResourceBundle  _resourceBundle = null;

  // Servlet configuration
  private static final String PARAM_JNLP_EXTENSION    = "jnlp-extension";
  private static final String PARAM_JAR_EXTENSION     = "jar-extension";

  private JnlpFileHandler _jnlpFileHandler = null;
  private JarDiffHandler  _jarDiffHandler = null;
  private ResourceCatalog _resourceCatalog = null;

  /** Initialize servlet */
  public void init(ServletConfig config) throws ServletException {
    super.init(config);

    // Get extension from Servlet configuration, or use default
    JnlpResource.setDefaultExtensions(
        config.getInitParameter(PARAM_JNLP_EXTENSION),
        config.getInitParameter(PARAM_JAR_EXTENSION));

    _jnlpFileHandler = new JnlpFileHandler(config.getServletContext());
    _jarDiffHandler = new JarDiffHandler(config.getServletContext());
    _resourceCatalog = new ResourceCatalog(config.getServletContext());
  }

  public static synchronized ResourceBundle getResourceBundle() {
    if (_resourceBundle == null) {
      _resourceBundle = ResourceBundle.getBundle("jnlp/sample/servlet/resources/strings");
    }
    return _resourceBundle;
  }


  public void doHead(HttpServletRequest request, HttpServletResponse response)
      throws ServletException, IOException {
    handleRequest(request, response, true);
  }

  /** We handle get requests too - eventhough the spec. only requeres POST requests */
  public void doGet(HttpServletRequest request, HttpServletResponse response) throws ServletException, IOException {
    handleRequest(request, response, false);
  }

  private void handleRequest(HttpServletRequest request,
      HttpServletResponse response, boolean isHead) throws IOException {

    String requestStr = request.getRequestURI();
    if (request.getQueryString() != null) requestStr += "?" + request.getQueryString().trim();

    // Parse HTTP request
    DownloadRequest dreq = new DownloadRequest(getServletContext(), request);
//    if (log.isInfoEnabled()) {
//      log.info("servlet.log.info.request",   requestStr);
//      log.info("servlet.log.info.useragent", request.getHeader("User-Agent"));
//    }
//    if (log.isDebugEnabled()) {
//      log.debug(dreq.toString());
//    }

    long ifModifiedSince = request.getDateHeader("If-Modified-Since");

    // Check if it is a valid request
    try {
      // Check if the request is valid
      validateRequest(dreq);

      // Decide what resource to return
      JnlpResource jnlpres = locateResource(dreq);
      log.debug("JnlpResource: " + jnlpres);


      if (log.isInfoEnabled()) {
        log.info("servlet.log.info.goodrequest", jnlpres.getPath());
      }

      DownloadResponse dres = null;

      if (isHead) {

        int cl =
            jnlpres.getResource().openConnection().getContentLength();

        // head request response
        dres = DownloadResponse.getHeadRequestResponse(
            jnlpres.getMimeType(), jnlpres.getVersionId(),
            jnlpres.getLastModified(), cl);

      } else if (ifModifiedSince != -1 &&
          (ifModifiedSince / 1000) >=
          (jnlpres.getLastModified() / 1000)) {
        // We divide the value returned by getLastModified here by 1000
        // because if protocol is HTTP, last 3 digits will always be
        // zero.  However, if protocol is JNDI, that's not the case.
        // so we divide the value by 1000 to remove the last 3 digits
        // before comparison

        // return 304 not modified if possible
        log.debug("return 304 Not modified");
        dres = DownloadResponse.getNotModifiedResponse();

      } else {

        // Return selected resource
        dres = constructResponse(jnlpres, dreq);
      }

      dres.sendRespond(response);

    } catch(ErrorResponseException ere) {
//      if (log.isInfoEnabled()) {
//        log.info("servlet.log.info.badrequest", requestStr);
//      }
//      if (log.isDebugEnabled()) {
//        log.debug("Response: "+ ere.toString());
//      }
      // Return response from exception
      ere.getDownloadResponse().sendRespond(response);
    } catch(Throwable e) {
      log.error("servlet.log.fatal.internalerror", e);
      response.sendError(HttpServletResponse.SC_INTERNAL_SERVER_ERROR);
    }
  }

  /** Make sure that it is a valid request. This is also the place to implement the
   *  reverse IP lookup
   */
  private void validateRequest(DownloadRequest dreq) throws ErrorResponseException {
    String path = dreq.getPath();
    if (path.endsWith(ResourceCatalog.VERSION_XML_FILENAME) ||
        path.indexOf("__") != -1 ) {
      throw new ErrorResponseException(DownloadResponse.getNoContentResponse());
    }
  }

  /** Interprets the download request and convert it into a resource that is
   *  part of the Web Archive.
   */
  private JnlpResource locateResource(DownloadRequest dreq) throws IOException, ErrorResponseException {
    if (dreq.getVersion() == null) {
      return handleBasicDownload(dreq);
    } else {
      return handleVersionRequest(dreq);
    }
  }

  private JnlpResource handleBasicDownload(DownloadRequest dreq) throws ErrorResponseException, IOException {
    log.debug("Basic Protocol lookup");
    // Do not return directory names for basic protocol
    if (dreq.getPath() == null || dreq.getPath().endsWith("/")) {
      throw new ErrorResponseException(DownloadResponse.getNoContentResponse());
    }
    // Lookup resource
    JnlpResource jnlpres = new JnlpResource(getServletContext(), dreq.getPath());
    if (!jnlpres.exists()) {
      throw new ErrorResponseException(DownloadResponse.getNoContentResponse());
    }
    return jnlpres;
  }

  private JnlpResource handleVersionRequest(DownloadRequest dreq) throws IOException, ErrorResponseException {
    log.debug("Version-based/Extension based lookup");
    return _resourceCatalog.lookupResource(dreq);
  }

  /** Given a DownloadPath and a DownloadRequest, it constructs the data stream to return
   *  to the requester
   */
  private DownloadResponse constructResponse(JnlpResource jnlpres, DownloadRequest dreq) throws IOException {
    String path = jnlpres.getPath();
    if (jnlpres.isJnlpFile()) {
      // It is a JNLP file. It need to be macro-expanded, so it is handled differently
      boolean supportQuery = JarDiffHandler.isJavawsVersion(dreq, "1.5+");
      log.debug("SupportQuery in Href: " + supportQuery);

      // only support query string in href for 1.5 and above
      if (supportQuery) {
        return _jnlpFileHandler.getJnlpFileEx(jnlpres, dreq);
      } else {
        return _jnlpFileHandler.getJnlpFile(jnlpres, dreq);
      }
    }

    // Check if a JARDiff can be returned
    if (dreq.getCurrentVersionId() != null && jnlpres.isJarFile()) {
      DownloadResponse response = _jarDiffHandler.getJarDiffEntry(_resourceCatalog, dreq, jnlpres);
      if (response != null) {
        log.info("servlet.log.info.jardiff.response");
        return response;
      }
    }

    // check and see if we can use pack resource
    JnlpResource jr =  new JnlpResource(getServletContext(),
        jnlpres.getName(),
        jnlpres.getVersionId(),
        jnlpres.getOSList(),
        jnlpres.getArchList(),
        jnlpres.getLocaleList(),
        jnlpres.getPath(),
        jnlpres.getReturnVersionId(),
        dreq.getEncoding());

    log.debug("Real resource returned: " + jr);

    // Return WAR file resource
    return DownloadResponse.getFileDownloadResponse(jr.getResource(),
        jr.getMimeType(),
        jr.getLastModified(),
        jr.getReturnVersionId());
  }


}
