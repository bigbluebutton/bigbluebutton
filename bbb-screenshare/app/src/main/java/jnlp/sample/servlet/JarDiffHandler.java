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
import java.io.*;
import java.util.*;
import jnlp.sample.jardiff.*;
import javax.servlet.*;
import javax.servlet.http.*;
import org.red5.logging.Red5LoggerFactory;
import org.slf4j.Logger;

import jnlp.sample.util.VersionString;
import java.net.URL;
/*
 * A class that generates and caches information about JarDiff files
 *
 */
public class JarDiffHandler {
  final private Logger log = Red5LoggerFactory.getLogger(JarDiffHandler.class, "screenshare");
  
    // Default size of download buffer
    private static final int BUF_SIZE = 32 * 1024;

    // Default JARDiff mime type
    private static final String JARDIFF_MIMETYPE    = "application/x-java-archive-diff";

    /** List of all generated JARDiffs */
    private HashMap _jarDiffEntries = null;

    /** Reference to ServletContext and logger object */
    private ServletContext _servletContext = null;
    private String _jarDiffMimeType = null;

    /* Contains information about a particular JARDiff entry */
    private static class JarDiffKey implements Comparable{
        private String  _name;          // Name of file
        private String  _fromVersionId; // From version
        private String  _toVersionId;   // To version
        private boolean _minimal;       // True if this is a minimal jardiff

        /** Constructor used to generate a query object */
        public JarDiffKey(String name, String fromVersionId, String toVersionId, boolean minimal) {
            _name = name;
            _fromVersionId = fromVersionId;
            _toVersionId = toVersionId;
            _minimal = minimal;
        }

        // Query methods
        public String getName()                 { return _name; }
        public String getFromVersionId()        { return _fromVersionId; }
        public String getToVersionId()          { return _toVersionId; }
        public boolean isMinimal()              { return _minimal; }

        // Collection framework interface methods

        public int compareTo(Object o) {
            // All non JarDiff entries are less
            if (!(o instanceof JarDiffKey)) return -1;
            JarDiffKey other = (JarDiffKey)o;

            int n = _name.compareTo(other.getName());
            if (n != 0) return n;

            n = _fromVersionId.compareTo(other.getFromVersionId());
            if (n != 0) return n;

            if (_minimal != other.isMinimal())  return -1;

            return _toVersionId.compareTo(other.getToVersionId());
        }

        public boolean equals(Object o) {
            return compareTo(o) == 0;
        }

        public int hashCode() {
            return _name.hashCode() +
                _fromVersionId.hashCode() +
                _toVersionId.hashCode();
        }
    }

    static private class JarDiffEntry {
        private File    _jardiffFile;   // Location of JARDiff file

        public JarDiffEntry(File jarDiffFile) {
            _jardiffFile = jarDiffFile;
        }

        public File   getJarDiffFile()          { return _jardiffFile; }
    }

    /** Initialize JarDiff handler */
    public JarDiffHandler(ServletContext servletContext) {
        _jarDiffEntries = new HashMap();
        _servletContext = servletContext;

        _jarDiffMimeType  = _servletContext.getMimeType("xyz.jardiff");
        if (_jarDiffMimeType == null) _jarDiffMimeType = JARDIFF_MIMETYPE;
    }

    /** Returns a JarDiff for the given request */
    public synchronized DownloadResponse getJarDiffEntry(ResourceCatalog catalog, DownloadRequest dreq, JnlpResource res) {
        if (dreq.getCurrentVersionId() == null) return null;

        // check whether the request is from javaws 1.0/1.0.1
        // do not generate minimal jardiff if it is from 1.0/1.0.1
        boolean doJarDiffWorkAround = isJavawsVersion(dreq, "1.0*");

        // First do a lookup to find a match
        JarDiffKey key = new JarDiffKey(res.getName(),
                                        dreq.getCurrentVersionId(),
                                        res.getReturnVersionId(),
                                        !doJarDiffWorkAround);


        JarDiffEntry entry = (JarDiffEntry)_jarDiffEntries.get(key);
        // If entry is not found, then the querty has not been made.
        if (entry == null) {
            if (log.isInfoEnabled()) {
                log.info("servlet.log.info.jardiff.gen",
                                      res.getName(),
                                      dreq.getCurrentVersionId(),
                                      res.getReturnVersionId());
            }
            File f = generateJarDiff(catalog, dreq, res, doJarDiffWorkAround);
            if (f == null) {
                log.warn("servlet.log.warning.jardiff.failed",
                                res.getName(),
                                dreq.getCurrentVersionId(),
                                res.getReturnVersionId());
            }
            // Store entry in table
            entry = new JarDiffEntry(f);
            _jarDiffEntries.put(key, entry);
        }



        // Check for no JarDiff to return
        if (entry.getJarDiffFile() == null) {
            return null;
        } else {
            return DownloadResponse.getFileDownloadResponse(entry.getJarDiffFile(),
                                                            _jarDiffMimeType,
                                                            entry.getJarDiffFile().lastModified(),
                                                            res.getReturnVersionId());
        }
    }


    public static boolean isJavawsVersion(DownloadRequest dreq, String version) {
        String javawsAgent = "javaws";
        String jwsVer = dreq.getHttpRequest().getHeader("User-Agent");


        // check the request is coming from javaws
        if (!jwsVer.startsWith("javaws-")) {
            // this is the new style User-Agent string
            // User-Agent: JNLP/1.0.1 javaws/1.4.2 (b28) J2SE/1.4.2
            StringTokenizer st = new StringTokenizer(jwsVer);
            while (st.hasMoreTokens()) {
                String verString = st.nextToken();
                int index = verString.indexOf(javawsAgent);
                if (index != -1) {
                    verString = verString.substring(index + javawsAgent.length() + 1);
                    return VersionString.contains(version, verString);
                }
            }
            return false;
        }

        // extract the version id from the download request
        int startIndex = jwsVer.indexOf("-");

        if (startIndex == -1) {
            return false;
        }

        int endIndex = jwsVer.indexOf("/");

        if (endIndex == -1 || endIndex < startIndex) {
            return false;
        }

        String verId = jwsVer.substring(startIndex + 1, endIndex);


        // check whether the versionString contains the versionId
        return VersionString.contains(version, verId);

    }

    /** Download resource to the given file */
    private boolean download(URL target, File file) {

        log.debug("JarDiffHandler:  Doing download");

        boolean ret = true;
        boolean delete = false;
        // use bufferedstream for better performance
        BufferedInputStream in = null;
        BufferedOutputStream out = null;
        try {
            in = new BufferedInputStream(target.openStream());
            out  = new BufferedOutputStream(new FileOutputStream(file));
            int read = 0;
            int totalRead = 0;
            byte[] buf = new byte[BUF_SIZE];
            while ((read = in.read(buf)) != -1) {
                out.write(buf, 0, read);
                totalRead += read;
            }

            log.debug("total read: " + totalRead);
            log.debug("Wrote URL " + target.toString() + " to file " + file);

        } catch(IOException ioe) {

            log.debug("Got exception while downloading resource: " + ioe);

            ret = false;

            if (file != null) delete = true;

        } finally {

            try {
                in.close();
                in = null;
            } catch (IOException ioe) {
                log.debug("Got exception while downloading resource: " + ioe);
            }

            try {
                out.close();
                out = null;
            } catch (IOException ioe) {
                log.debug("Got exception while downloading resource: " + ioe);
            }

            if (delete) {
                file.delete();
            }

        }
        return ret;
    }

    // fix for 4720897
    // if the jar file resides in a war file, download it to a temp dir
    // so it can be used to generate jardiff
    private String getRealPath(String path) throws IOException{

        URL fileURL =  _servletContext.getResource(path);

        File tempDir  = (File)_servletContext.getAttribute("javax.servlet.context.tempdir");

        // download file into temp dir
        if (fileURL != null) {
            File newFile = File.createTempFile("temp", ".jar", tempDir);
            if (download(fileURL, newFile)) {
                String filePath = newFile.getPath();
                return filePath;
            }
        }
        return null;
    }


    private File generateJarDiff(ResourceCatalog catalog, DownloadRequest dreq, JnlpResource res, boolean doJarDiffWorkAround) {
        boolean del_old = false;
        boolean del_new = false;

        // Lookup up file for request version
        DownloadRequest fromDreq = dreq.getFromDownloadRequest();
        try {
            JnlpResource fromRes = catalog.lookupResource(fromDreq);

            /* Get file locations */
            String newFilePath = _servletContext.getRealPath(res.getPath());
            String oldFilePath = _servletContext.getRealPath(fromRes.getPath());

            // fix for 4720897
            if (newFilePath == null) {
                newFilePath = getRealPath(res.getPath());
                if (newFilePath != null) del_new = true;
            }

            if (oldFilePath == null) {
                oldFilePath = getRealPath(fromRes.getPath());
                if (oldFilePath != null) del_old = true;
            }

            if (newFilePath == null || oldFilePath == null) {
                return null;
            }

            // Create temp. file to store JarDiff file in
            File tempDir  = (File)_servletContext.getAttribute("javax.servlet.context.tempdir");

            // fix for 4653036: JarDiffHandler() should use javax.servlet.context.tempdir to store the jardiff
            File outputFile = File.createTempFile("jnlp", ".jardiff", tempDir);

            log.debug("Generating Jardiff between " + oldFilePath + " and " +
                              newFilePath + " Store in " + outputFile);

            // Generate JarDiff
            OutputStream os = new FileOutputStream(outputFile);

            JarDiff.createPatch(oldFilePath, newFilePath, os, !doJarDiffWorkAround);
            os.close();

            try {

                // Check that Jardiff is smaller, or return null
                if (outputFile.length() >= (new File(newFilePath).length())) {
                  log.debug("JarDiff discarded - since it is bigger");
                    return null;
                }

                // Check that Jardiff is smaller than the packed version of
                // the new file, if the file exists at all
                File newFilePacked = new File(newFilePath + ".pack.gz");
                if (newFilePacked.exists()) {
                    log.debug("generated jardiff size: " + outputFile.length());
                    log.debug("packed requesting file size: " + newFilePacked.length());
                    if (outputFile.length() >= newFilePacked.length()) {
                      log.debug("JarDiff discarded - packed version of requesting file is smaller");
                        return null;
                    }
                }

                log.debug("JarDiff generation succeeded");
                return outputFile;

            } finally {
                // delete the temporarily downloaded file
                if (del_new) {
                    new File(newFilePath).delete();
                }

                if (del_old) {
                    new File(oldFilePath).delete();
                }
            }
        } catch(IOException ioe) {
          log.debug("Failed to genereate jardiff", ioe);
            return null;
        } catch(ErrorResponseException ere) {
          log.debug("Failed to genereate jardiff", ere);
            return null;
        }
    }
}
