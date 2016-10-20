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
import java.io.File;
import java.util.ArrayList;
import javax.servlet.*;
import javax.servlet.http.*;

/**
 * The DownloadRequest incapsulates all the data in a request
 * SQE: We need to address query string
 */
public class DownloadRequest {
    // Arguments
    private static final String ARG_ARCH                = "arch";
    private static final String ARG_OS                  = "os";
    private static final String ARG_LOCALE              = "locale";
    private static final String ARG_VERSION_ID          = "version-id";
    private static final String ARG_CURRENT_VERSION_ID  = "current-version-id";
    private static final String ARG_PLATFORM_VERSION_ID = "platform-version-id";
    private static final String ARG_KNOWN_PLATFORMS     = "known-platforms";
    private static final String TEST_JRE = "TestJRE";

    private String _path = null;
    private String _version = null;
    private String _currentVersionId = null;
    private String[] _os = null;
    private String[] _arch = null;
    private String[] _locale = null;
    private String[] _knownPlatforms = null;
    private String _query = null;
    private String _testJRE = null;
    private boolean _isPlatformRequest = false;
    private ServletContext _context = null;
    private String _encoding = null;

    private HttpServletRequest _httpRequest = null;

    // HTTP Compression RFC 2616 : Standard headers
    public static final String ACCEPT_ENCODING          = "accept-encoding";

    // Contruct Request object based on HTTP request
    public DownloadRequest(HttpServletRequest request) {
        this((ServletContext)null, request);
    }

    public DownloadRequest(ServletContext context, HttpServletRequest request) {
        _context = context;
        _httpRequest = request;
        _path = request.getRequestURI();
        _encoding = request.getHeader(ACCEPT_ENCODING);
        String context_path = request.getContextPath();
        if (context_path != null) _path = _path.substring(context_path.length());
        if (_path == null) _path = request.getServletPath(); // This works for *.<ext> invocations
        if (_path == null) _path = "/"; // No path given
        _path = _path.trim();
        if (_context != null && !_path.endsWith("/")) {
            String realPath = _context.getRealPath(_path);
            // fix for 4474021 - getRealPath might returns NULL
            if (realPath != null) {
                File f = new File(realPath);
                if (f != null && f.exists() && f.isDirectory()) {
                    _path += "/";
                }
            }
        }
        // Append default file for a directory
        if (_path.endsWith("/")) _path += "launch.jnlp";
        _version = getParameter(request, ARG_VERSION_ID);
        _currentVersionId = getParameter(request, ARG_CURRENT_VERSION_ID);
        _os = getParameterList(request, ARG_OS);
        _arch = getParameterList(request, ARG_ARCH);
        _locale = getParameterList(request, ARG_LOCALE);
        _knownPlatforms = getParameterList(request, ARG_KNOWN_PLATFORMS);
        String platformVersion = getParameter(request, ARG_PLATFORM_VERSION_ID);
        _isPlatformRequest =  (platformVersion != null);
        if (_isPlatformRequest) _version = platformVersion;
        _query = request.getQueryString();
        _testJRE = getParameter(request, TEST_JRE);
    }

    /** Returns a DownloadRequest for the currentVersionId, that can be used
     *  to lookup the existing cached version
     */
    private DownloadRequest(DownloadRequest dreq) {
        _encoding = dreq._encoding;
        _context = dreq._context;
        _httpRequest = dreq._httpRequest;
        _path = dreq._path;
        _version = dreq._currentVersionId;
        _currentVersionId = null;
        _os = dreq._os;
        _arch = dreq._arch;
        _locale = dreq._locale;
        _knownPlatforms = dreq._knownPlatforms;
        _isPlatformRequest =  dreq._isPlatformRequest;
        _query = dreq._query;
        _testJRE = dreq._testJRE;
    }


    private String getParameter(HttpServletRequest req, String key) {
        String res = req.getParameter(key);
        return (res == null) ? null : res.trim();
    }

     /** Converts a space delimitered string to a list of strings */
    static private String[] getStringList(String str) {
        if (str == null) return null;
        ArrayList list = new ArrayList();
        int i = 0;
        int length = str.length();
        StringBuffer sb = null;
        while(i < length) {
            char ch = str.charAt(i);
            if (ch == ' ') {
                // A space was hit. Add string to list
                if (sb != null) {
                    list.add(sb.toString());
                    sb = null;
                }
            } else if (ch == '\\') {
                // It is a delimiter. Add next character
                if (i + 1 < length) {
                    ch = str.charAt(++i);
                    if (sb == null) sb = new StringBuffer();
                    sb.append(ch);
                }
            } else {
                if (sb == null) sb = new StringBuffer();
                sb.append(ch);
            }
            i++; // Next character
        }
        // Make sure to add the last part to the list too
        if (sb != null) {
            list.add(sb.toString());
        }
        if (list.size() == 0) return null;
        String[] results = new String[list.size()];
        return (String[])list.toArray(results);
    }

    /* Split parameter at spaces. Convert '\ ' insto a space */
    private String[] getParameterList(HttpServletRequest req, String key) {
        String res = req.getParameter(key);
        return (res == null) ? null : getStringList(res.trim());
    }

    // Query
    public String getPath() { return _path; }
    public String getVersion() { return _version; }
    public String getCurrentVersionId() { return _currentVersionId; }
    public String getQuery() { return _query; }
    public String getTestJRE() { return _testJRE; }
    public String getEncoding() { return _encoding; }
    public String[] getOS() { return _os; }
    public String[] getArch() { return _arch; }
    public String[] getLocale() { return _locale; }
    public String[] getKnownPlatforms() { return _knownPlatforms; }
    public boolean isPlatformRequest() { return _isPlatformRequest; }
    public HttpServletRequest getHttpRequest() { return _httpRequest; }

    /** Returns a DownloadRequest for the currentVersionId, that can be used
     *  to lookup the existing cached version
     */
    DownloadRequest getFromDownloadRequest() {
        return new DownloadRequest(this);
    }

    // Debug
    public String toString() {
        return "DownloadRequest[path=" + _path +
            showEntry(" encoding=", _encoding) +
            showEntry(" query=", _query) +
            showEntry(" TestJRE=", _testJRE) +
            showEntry(" version=", _version) +
            showEntry(" currentVersionId=", _currentVersionId) +
            showEntry(" os=", _os) +
            showEntry(" arch=", _arch) +
            showEntry(" locale=", _locale) +
            showEntry(" knownPlatforms=", _knownPlatforms)
            + " isPlatformRequest=" + _isPlatformRequest + "]";
    }

    private String showEntry(String msg, String value) {
        if (value == null) return "";
        return msg + value;
    }

    private String showEntry(String msg, String[] value) {
        if (value == null) return "";
        return msg + java.util.Arrays.asList(value).toString();
    }
}
