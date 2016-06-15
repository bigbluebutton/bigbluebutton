/*
 * Copyright (C) 2011-2015 Samuel Audet
 *
 * Licensed either under the Apache License, Version 2.0, or (at your option)
 * under the terms of the GNU General Public License as published by
 * the Free Software Foundation (subject to the "Classpath" exception),
 * either version 2, or any later version (collectively, the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *     http://www.gnu.org/licenses/
 *     http://www.gnu.org/software/classpath/license.html
 *
 * or as provided in the LICENSE.txt file that accompanied this code.
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

package org.bytedeco.javacpp;

import java.io.File;
import java.io.FileOutputStream;
import java.io.IOException;
import java.io.InputStream;
import java.io.InputStreamReader;
import java.io.OutputStream;
import java.net.URL;
import java.net.URISyntaxException;
import java.util.*;

import org.bigbluebutton.screenshare.client.DeskshareMain;
import org.bytedeco.javacpp.annotation.Platform;
import org.bytedeco.javacpp.tools.Builder;
import org.bytedeco.javacpp.tools.Logger;

/**
 * The Loader contains functionality to load native libraries, but also has a bit
 * of everything that does not fit anywhere else. In addition to its library loading
 * features, it also has utility methods to get the platform name, to load properties
 * from Java resources and from Class annotations, to extract file resources to the
 * temporary directory, and to get the {@code offsetof()} or {@code sizeof()} a native
 * {@code struct}, {@code class}, or {@code union} with its {@link Pointer} peer class
 * and a {@link HashMap} initialized by the native libraries inside {@code JNI_OnLoad()}.
 *
 * @author Samuel Audet
 */
public class Loader {

    private static final Logger logger = Logger.create(Loader.class);

    /** Value created out of "java.vm.name", "os.name", and "os.arch" system properties.
     *  Returned by {@link #getPlatform()} as default. */
    private static final String PLATFORM;
    /** Default platform properties loaded and returned by {@link #loadProperties()}. */
    private static Properties platformProperties = null;

    static {
        String jvmName = System.getProperty("java.vm.name", "").toLowerCase();
        String osName  = System.getProperty("os.name", "").toLowerCase();
        String osArch  = System.getProperty("os.arch", "").toLowerCase();
        String abiType = System.getProperty("sun.arch.abi", "").toLowerCase();
        if (jvmName.startsWith("dalvik") && osName.startsWith("linux")) {
            osName = "android";
        } else if (jvmName.startsWith("robovm") && osName.startsWith("darwin")) {
            osName = "ios";
            osArch = "arm";
        } else if (osName.startsWith("mac os x") || osName.startsWith("darwin")) {
            osName = "macosx";
        } else {
            int spaceIndex = osName.indexOf(' ');
            if (spaceIndex > 0) {
                osName = osName.substring(0, spaceIndex);
            }
        }
        if (osArch.equals("i386") || osArch.equals("i486") || osArch.equals("i586") || osArch.equals("i686")) {
            osArch = "x86";
        } else if (osArch.equals("amd64") || osArch.equals("x86-64") || osArch.equals("x64")) {
            osArch = "x86_64";
        } else if (osArch.startsWith("aarch64") || osArch.startsWith("armv8") || osArch.startsWith("arm64")) {
            osArch = "arm64";
        } else if ((osArch.startsWith("arm")) && abiType.equals("gnueabihf")) {
            osArch = "armhf";
	} else if (osArch.startsWith("arm")) {
            osArch = "arm";
        }
        PLATFORM = osName + "-" + osArch;
    }

    /**
     * Returns either the value of the "org.bytedeco.javacpp.platform"
     * system property, or {@link #PLATFORM} when the former is not set.
     *
     * @return {@code System.getProperty("org.bytedeco.javacpp.platform", platform)}
     * @see #PLATFORM
     */
    public static String getPlatform() {
        return System.getProperty("org.bytedeco.javacpp.platform", PLATFORM);
    }

    /**
     * Loads the {@link Properties} associated with the default {@link #getPlatform()}.
     *
     * @return {@code loadProperties(getPlatform(), null)}
     * @see #loadProperties(String, String)
     */
    public static Properties loadProperties() {
        String name = getPlatform();
        if (platformProperties != null && name.equals(platformProperties.getProperty("platform"))) {
            return platformProperties;
        }
        return platformProperties = loadProperties(name, null);
    }
    /**
     * Loads from resources the default {@link Properties} of the specified platform name.
     * The resource must be at {@code "org/bytedeco/javacpp/properties/" + name + ".properties"}.
     *
     * @param name the platform name
     * @param defaults the fallback platform name (null == "generic")
     * @return the Properties from resources
     */
    public static Properties loadProperties(String name, String defaults) {
        Properties p = new Properties();
        p.put("platform", name);
        p.put("platform.path.separator", File.pathSeparator);
        String s = System.mapLibraryName("/");
        int i = s.indexOf('/');
        p.put("platform.library.prefix", s.substring(0, i));
        p.put("platform.library.suffix", s.substring(i + 1));
        name = "properties/" + name + ".properties";
        InputStream is = Loader.class.getResourceAsStream(name);
        try {
            try {
                p.load(new InputStreamReader(is));
            } catch (NoSuchMethodError e) {
                p.load(is);
            }
        } catch (Exception e) {
            name = "properties/" + defaults + ".properties";
            InputStream is2 = Loader.class.getResourceAsStream(name);
            try {
                try {
                    p.load(new InputStreamReader(is2));
                } catch (NoSuchMethodError e2) {
                    p.load(is2);
                }
            } catch (Exception e2) {
                // give up and return defaults
            } finally {
                try {
                    if (is2 != null) {
                        is2.close();
                    }
                } catch (IOException ex) {
                    logger.error("Unable to close resource : " + ex.getMessage());
                }
            }
        } finally {
            try {
                if (is != null) {
                    is.close();
                }
            } catch (IOException ex) {
                logger.error("Unable to close resource : " + ex.getMessage());
            }
        }
        return p;
    }

    /**
     * If annotated with properties, returns the argument as "enclosing Class".
     * If no properties are found on the Class, makes a search for the first Class
     * with properties that we can use, and returns it as the enclosing Class found.
     *
     * @param cls the Class to start the search from
     * @return the enclosing Class
     * @see org.bytedeco.javacpp.annotation.Platform
     * @see org.bytedeco.javacpp.annotation.Properties
     */
    public static Class getEnclosingClass(Class cls) {
        Class<?> c = cls;
        // Find first enclosing declaring class with some properties to use
        while (c.getDeclaringClass() != null) {
            if (c.isAnnotationPresent(org.bytedeco.javacpp.annotation.Properties.class)) {
                break;
            }
            if (c.isAnnotationPresent(Platform.class)) {
                Platform p = c.getAnnotation(Platform.class);
                if (p.pragma().length > 0 || p.define().length > 0 || p.include().length > 0 || p.cinclude().length > 0 ||
                        p.includepath().length > 0 || p.compiler().length > 0 || p.linkpath().length > 0 ||
                        p.link().length > 0 || p.frameworkpath().length > 0 || p.framework().length > 0 ||
                        p.preloadpath().length > 0 || p.preload().length > 0 || p.library().length() > 0) {
                    break;
                }
            }
            c = c.getDeclaringClass();
        }
        return c;
    }


    /**
     * For all the classes, loads all properties from each Class annotations for the given platform.
     * @see #loadProperties(Class, java.util.Properties, boolean)
     */
    public static ClassProperties loadProperties(Class[] cls, Properties properties, boolean inherit) {
        ClassProperties cp = new ClassProperties(properties);
        for (Class c : cls) {
            cp.load(c, inherit);
        }
        return cp;
    }
    /**
     * Loads all properties from Class annotations for the given platform. The platform
     * of interest needs to be specified as the value of the "platform" key in the
     * properties argument. It is also possible to indicate whether to load all the classes
     * specified in the {@link org.bytedeco.javacpp.annotation.Properties#inherit()}
     * annotation recursively via the inherit argument.
     *
     * @param cls the Class of which to return Properties
     * @param properties the platform Properties to inherit
     * @param inherit indicates whether or not to inherit properties from other classes
     * @return all the properties associated with the Class for the given platform
     */
    public static ClassProperties loadProperties(Class cls, Properties properties, boolean inherit) {
        ClassProperties cp = new ClassProperties(properties);
        cp.load(cls, inherit);
        return cp;
    }

    /**
     * Returns the {@link Class} object that contains a caller's method.
     *
     * @param i the offset on the call stack of the method of interest
     * @return the Class found from the calling context, or {@code null} if not found
     */
    public static Class getCallerClass(int i) {
        Class[] classContext = null;
        try {
            new SecurityManager() {
                @Override public Class[] getClassContext() {
                    return super.getClassContext();
                }
            }.getClassContext();
        } catch (NoSuchMethodError e) {
            logger.error("No definition of this method : " + e.getMessage());
        }
        if (classContext != null) {
            for (int j = 0; j < classContext.length; j++) {
                if (classContext[j] == Loader.class) {
                    return classContext[i+j];
                }
            }
        } else {
            // SecurityManager.getClassContext() returns null on Android 4.0
            try {
                StackTraceElement[] classNames = Thread.currentThread().getStackTrace();
                for (int j = 0; j < classNames.length; j++) {
                    if (Class.forName(classNames[j].getClassName()) == Loader.class) {
                        return Class.forName(classNames[i+j].getClassName());
                    }
                }
            } catch (ClassNotFoundException e) {
                logger.error("No definition for the class found : " + e.getMessage());
            }
        }
        return null;
    }

    /**
     * Extracts by name a resource using the {@link ClassLoader} of the caller.
     *
     * @param name the name of the resource passed to {@link Class#getResource(String)}
     * @see #extractResource(URL, File, String, String)
     */
    public static File extractResource(String name, File directory,
            String prefix, String suffix) throws IOException {
        Class cls = getCallerClass(2);
        return extractResource(cls, name, directory, prefix, suffix);
    }
    /**
     * Extracts by name a resource using the {@link ClassLoader} of the specified {@link Class}.
     *
     * @param cls the Class from which to load resources
     * @param name the name of the resource passed to {@link Class#getResource(String)}
     * @see #extractResource(URL, File, String, String)
     */
    public static File extractResource(Class cls, String name, File directory,
            String prefix, String suffix) throws IOException {
        return extractResource(cls.getResource(name), directory, prefix, suffix);
    }
    /**
     * Extracts a resource into the specified directory and with the specified
     * prefix and suffix for the filename. If both prefix and suffix are {@code null},
     * the original filename is used, so the directory must not be {@code null}.
     *
     * @param resourceURL the URL of the resource to extract
     * @param directory the output directory ({@code null == System.getProperty("java.io.tmpdir")})
     * @param prefix the prefix of the temporary filename to use
     * @param suffix the suffix of the temporary filename to use
     * @return the File object representing the extracted file
     * @throws IOException if fails to extract resource properly
     */
    public static File extractResource(URL resourceURL, File directory,
            String prefix, String suffix) throws IOException {
        InputStream is = resourceURL != null ? resourceURL.openStream() : null;
        OutputStream os = null;
        if (is == null) {
            return null;
        }
        File file = null;
        boolean fileExisted = false;
        try {
            if (prefix == null && suffix == null) {
                if (directory == null) {
                    directory = new File(System.getProperty("java.io.tmpdir"));
                }
                file = new File(directory, new File(resourceURL.getPath()).getName());
                fileExisted = file.exists();
            } else {
                file = File.createTempFile(prefix, suffix, directory);
            }

            if (logger.isDebugEnabled()) {
                logger.debug("Extracting file " + file.getAbsolutePath());
            }


            os = new FileOutputStream(file);
            byte[] buffer = new byte[1024];
            int length;
            while ((length = is.read(buffer)) != -1) {
                os.write(buffer, 0, length);
            }
            is.close();
            os.close();
        } catch (IOException e) {
            if (file != null && !fileExisted) {
                file.delete();
            }
            throw e;
        } finally {
            is.close();
            if (os != null) {
                os.close();
            }
        }
        return file;
    }

    /** User-specified cache directory set and returned by {@link #getCacheDir()}. */
    static File cacheDir = null;
    /** Temporary directory set and returned by {@link #getTempDir()}. */
    static File tempDir = null;
    /** Contains all the native libraries that we have loaded to avoid reloading them. */
    static Map<String,String> loadedLibraries = Collections.synchronizedMap(new HashMap<String,String>());

    /**
     * Creates and returns {@code System.getProperty("org.bytedeco.javacpp.cachedir")}, or null when not set.
     *
     * @return {@link #cacheDir}
     */
    public static File getCacheDir() {
        if (cacheDir == null) {
            String dirName = System.getProperty("org.bytedeco.javacpp.cachedir", null);
            if (dirName != null) {
                File f = new File(dirName);
                if (f.exists() || f.mkdirs()) {
                    cacheDir = f;
                }
            }
        }
        return cacheDir;
    }

    /**
     * Creates a unique name for {@link #tempDir} out of
     * {@code System.getProperty("java.io.tmpdir")} and {@code System.nanoTime()}.
     *
     * @return {@link #tempDir}
     */
    public static File getTempDir() {
        if (tempDir == null) {
            File tmpdir = new File(System.getProperty("java.io.tmpdir"));
            File f;
            for (int i = 0; i < 1000; i++) {
                f = new File(tmpdir, "javacpp" + System.nanoTime());
                if (f.mkdir()) {
                    tempDir = f;
                    tempDir.deleteOnExit();
                    break;
                }
            }
        }
        if (logger.isDebugEnabled()) {
            logger.debug("JavaCV temp dir " + tempDir);
        }
        return tempDir;
    }

    /** Returns {@code System.getProperty("org.bytedeco.javacpp.loadlibraries")}.
     *  Flag set by the {@link Builder} to tell us not to try to load anything. */
    public static boolean isLoadLibraries() {
        String s = System.getProperty("org.bytedeco.javacpp.loadlibraries", "true").toLowerCase();
        return s.equals("true") || s.equals("t") || s.equals("");
    }

    /** Returns {@code load(getCallerClass(2), loadProperties(), false)}. */
    public static String load() {
        return load(getCallerClass(2), loadProperties(), false);
    }
    /**
     * Loads native libraries associated with the {@link Class} of the caller.
     *
     * @param pathsFirst search the paths first before bundled resources
     * @return {@code load(getCallerClass(2), loadProperties(), pathsFirst) }
     * @see #getCallerClass(int)
     * @see #load(Class, Properties, boolean)
     */
    public static String load(boolean pathsFirst) {
        Class cls = getCallerClass(2);
        return load(cls, loadProperties(), pathsFirst);
    }
    /** Returns {@code load(cls, loadProperties(), false)}. */
    public static String load(Class cls) {
        return load(cls, loadProperties(), false);
    }
    /**
     * Loads native libraries associated with the given {@link Class}.
     *
     * @param cls the Class to get native library information from
     * @param properties the platform Properties to inherit
     * @param pathsFirst search the paths first before bundled resources
     * @return the full path to the main file loaded, or the library name if unknown
     *         (but {@code if (!isLoadLibraries() || cls == null) { return null; }})
     * @throws NoClassDefFoundError on Class initialization failure
     * @throws UnsatisfiedLinkError on native library loading failure
     * @see #findLibrary(Class, ClassProperties, String, boolean)
     * @see #loadLibrary(URL[], String)
     */
    public static String load(Class cls, Properties properties, boolean pathsFirst) {
        if (!isLoadLibraries() || cls == null) {
            return null;
        }

        // Find the top enclosing class, to match the library filename
        cls = getEnclosingClass(cls);
        ClassProperties p = loadProperties(cls, properties, true);

        // Force initialization of all the target classes in case they need it
        List<String> targets = p.get("target");
        if (targets.isEmpty()) {
            if (p.getInheritedClasses() != null) {
                for (Class c : p.getInheritedClasses()) {
                    targets.add(c.getName());
                }
            }
            targets.add(cls.getName());
        }

        Set<String> targetClasses = new HashSet<String>();
        for (String s : targets) {
            targetClasses.add(s);
        }

        for (String s : targetClasses) {
            try {
                Class.forName(s, true, cls.getClassLoader());
            } catch (ClassNotFoundException ex) {
                if (logger.isDebugEnabled()) {
                    logger.debug("load: Failed to load class " + s + ": " + ex);
                }
                Error e = new NoClassDefFoundError(ex.toString());
                e.initCause(ex);
                throw e;
            }
        }

        // Preload native libraries desired by our class
        List<String> preloads = new ArrayList<String>();
        preloads.addAll(p.get("platform.preload"));

        // Do not include the platform.link into our list of native libs.
        // This will just add to the number of libs to search increasing
        // delay on startup. (ralam - june 15, 2016).
        //preloads.addAll(p.get("platform.link"));

        UnsatisfiedLinkError preloadError = null;

        for (String preload : preloads) {
            try {
                // Do not try searching for the library. Let the system find the
                // native library. Searching for it manually prolongs startup time.
                // (ralam - june 15, 2016)
                URL[] urls = new URL[0]; //findLibrary(cls, p, preload, pathsFirst);
                loadLibrary(urls, preload);
            } catch (UnsatisfiedLinkError e) {
                preloadError = e;
            }
        }

        try {
            String library = p.getProperty("platform.library");
            // Do not try searching for the library. Let the system find the
            // native library. Searching for it manually prolongs startup time.
            // (ralam - june 15, 2016)
            URL[] urls = new URL[0]; //findLibrary(cls, p, library, pathsFirst);
            String loadedLibPath = loadLibrary(urls, library);
            return loadedLibPath;
        } catch (UnsatisfiedLinkError e) {
            if (preloadError != null && e.getCause() == null) {
                e.initCause(preloadError);
            }
            throw e;
        }

    }

    /**
     * Finds from where the library may be extracted and loaded among the {@link Class}
     * resources. But in case that fails, and depending on the value of {@code pathsFirst},
     * either as a fallback or in priority over bundled resources, also searches the paths
     * found in the "platform.preloadpath" and "platform.linkpath" class properties as well as
     * the "java.library.path" system property, in that order.
     *
     * @param cls the Class whose package name and {@link ClassLoader} are used to extract from resources
     * @param properties contains the directories to scan for if we fail to extract the library from resources
     * @param libnameversion the name of the library + "@" + optional version tag
     * @param pathsFirst search the paths first before bundled resources
     * @return URLs that point to potential locations of the library
     */
    public static URL[] findLibrary(Class cls, ClassProperties properties, String libnameversion, boolean pathsFirst) {
        String[] s = libnameversion.split("@");
        String libname = s[0];
        String version = s.length > 1 ? s[s.length-1] : "";

        // If we do not already have the native library file ...
        String filename = loadedLibraries.get(libnameversion);
        if (filename != null) {
            try {
                return new URL[] { new File(filename).toURI().toURL() };
            } catch (IOException ex) {
                if (logger.isDebugEnabled()) {
                    logger.debug("findLibrary: Could not create URL for library " + libnameversion);
                }
                return new URL[] { };
            }
        }

        String subdir = properties.getProperty("platform") + '/';
        String prefix = properties.getProperty("platform.library.prefix", "") + libname;
        String suffix = properties.getProperty("platform.library.suffix", "");
        String[] styles = {
            prefix + suffix + version, // Linux style
            prefix + version + suffix, // Mac OS X style
            prefix + suffix            // without version
        };

        String[] suffixes = properties.get("platform.library.suffix").toArray(new String[0]);
        if (suffixes.length > 1) {
            styles = new String[3 * suffixes.length];
            for (int i = 0; i < suffixes.length; i++) {
                styles[3 * i    ] = prefix + suffixes[i] + version; // Linux style
                styles[3 * i + 1] = prefix + version + suffixes[i]; // Mac OS X style
                styles[3 * i + 2] = prefix + suffixes[i];           // without version
            }
        }

        Set<String> stylesStr = new HashSet<String>();
        for (int js=0; js < styles.length; js++) {
            if (logger.isDebugEnabled()) {
                logger.debug("findLibrary: Style " + styles[js]);
            }
            stylesStr.add(styles[js]);
        }

        /*
        List<String> paths = new ArrayList<String>();
        paths.addAll(properties.get("platform.preloadpath"));
        paths.addAll(properties.get("platform.linkpath"));
        String libpath = System.getProperty("java.library.path", "");
        if (logger.isDebugEnabled()) {
            logger.debug("findLibrary: java.library.path " + libpath);
        }
        if (libpath.length() > 0) {
            paths.addAll(Arrays.asList(libpath.split(File.pathSeparator)));
        }

        ArrayList<URL> urls = new ArrayList<URL>(styles.length * (1 + paths.size()));
*/
        if (logger.isDebugEnabled()) {
            logger.debug("findLibrary: Before get resource");
        }

        String platform = Loader.getPlatform();
        Set<URL> urls = new HashSet<URL>();
        //for (int i = 0; cls != null && i < styles.length; i++) {
        for (String st: stylesStr) {
            // ... then find it from in our resources ...
            if (logger.isDebugEnabled()) {
                logger.debug("findLibrary: resource path " + subdir + st);
            }
            if (platform.startsWith("ghghghmacosx-x86_64")) {
                URL u = cls.getResource(subdir + st);
                if (u != null) {
                    if (logger.isDebugEnabled()) {
                        logger.debug("findLibrary: cls.getResource " + u.toString());
                    }
                    urls.add(u);
                }
            }


        }
        if (logger.isDebugEnabled()) {
            logger.debug("findLibrary: After get resource");
        }

/*
        // ... and in case of bad resources search the paths last, or first on user request.
        int k = pathsFirst ? 0 : urls.size();
        for (int i = 0; paths.size() > 0 && i < styles.length; i++) {
            for (String path : paths) {
                File file = new File(path, styles[i]);
                if (logger.isDebugEnabled()) {
                    logger.debug("findLibrary: url path " + path + " style " + styles[i]);
                }
                if (file.exists()) {
                    try {
                        if (logger.isDebugEnabled()) {
                            logger.debug("findLibrary: url path " + file.toURI().toURL());
                        }
                        urls.add(file.toURI().toURL());
                        //urls.add(k++, file.toURI().toURL());
                    } catch (IOException ex) {
                        throw new RuntimeException(ex);
                    }
                }
            }
        }
*/
        URL[] libUrls = urls.toArray(new URL[urls.size()]);
        for (URL url : libUrls) {
            if (logger.isDebugEnabled()) {
                logger.debug("findLibrary: Lib URL for " + libnameversion + " " + url);
            }
        }

        return libUrls;
    }

    /**
     * Tries to load the library from the URLs in order, extracting resources as necessary.
     * Finally, if all fails, falls back on {@link System#loadLibrary(String)}.
     *
     * @param urls the URLs to try loading the library from
     * @param libnameversion the name of the library + "@" + optional version tag
     * @return the full path of the file loaded, or the library name if unknown
     *         (but {@code if (!isLoadLibraries) { return null; }})
     * @throws UnsatisfiedLinkError on failure
     */
    public static String loadLibrary(URL[] urls, String libnameversion) {
        if (!isLoadLibraries()) {
            if (logger.isDebugEnabled()) {
                logger.debug("Not loading " + libnameversion );
            }

            return null;
        }

        // If we do not already have the native library file ...
        String filename = loadedLibraries.get(libnameversion);
        if (filename != null) {
            return filename;
        }

        File tempFile = null;
        UnsatisfiedLinkError loadError = null;
        try {
            for (URL url : urls) {
                File file;

                // ... then check if it has not already been extracted, and if not ...
                if (!(file = new File(getCacheDir() != null ? getCacheDir() : getTempDir(), new File(url.getPath()).getName())).exists()) {
                    if (tempFile != null && tempFile.exists()) {
                        tempFile.deleteOnExit();
                    }

                    // ... then extract it from our resources ...
                    if (getCacheDir() != null) {
                        file = extractResource(url, getCacheDir(), null, null);
                    } else {
                        file = tempFile = extractResource(url, getTempDir(), null, null);
                    }
                } else while (System.currentTimeMillis() - file.lastModified() < 1000) {
                    // ... else wait until the file is at least 1 second old ...
                    try {
                        Thread.sleep(1000);
                    } catch (InterruptedException ex) {
                        // ... reset interrupt to be nice ...
                        Thread.currentThread().interrupt();
                    }
                }
                if (file != null && file.exists()) {
                    filename = file.getAbsolutePath();
                    try {
                        // ... and load it!
                        loadedLibraries.put(libnameversion, filename);
                        System.load(filename);
                        return filename;
                    } catch (UnsatisfiedLinkError e) {
                        loadError = e;
                        loadedLibraries.remove(libnameversion);
                        if (logger.isDebugEnabled()) {
                            logger.debug("Failed to load " + filename + ": " + e);
                        }
                    }
                }
            }
            // ... or as last resort, try to load it via the system.
            String libname = libnameversion.split("@")[0];
            loadedLibraries.put(libnameversion, libname);
            System.loadLibrary(libname);
            return libname;
        } catch (UnsatisfiedLinkError e) {
            loadedLibraries.remove(libnameversion);
            if (loadError != null && e.getCause() == null) {
                e.initCause(loadError);
            }
            throw e;
        } catch (IOException ex) {
            loadedLibraries.remove(libnameversion);
            if (loadError != null && ex.getCause() == null) {
                ex.initCause(loadError);
            }
            Error e = new UnsatisfiedLinkError(ex.toString());
            e.initCause(ex);
            throw e;
        } finally {
            if (tempFile != null && tempFile.exists()) {
                tempFile.deleteOnExit();
            }
            // But under Windows, it won't get deleted!
        }
    }

    // So, let's use a shutdown hook...
    static {
        if (getPlatform().startsWith("windows")) {
            Runtime.getRuntime().addShutdownHook(new Thread() {
                @Override public void run() {
                    if (tempDir == null) {
                        return;
                    }
                    try {
                        // ... to launch a separate process ...
                        List<String> command = new ArrayList<String>();
                        command.add(System.getProperty("java.home") + "/bin/java");
                        command.add("-classpath");
                        command.add((new File(Loader.class.getProtectionDomain().getCodeSource().getLocation().toURI())).toString());
                        command.add(Loader.class.getName());
                        command.add(tempDir.getAbsolutePath());
                        new ProcessBuilder(command).start();
                    } catch (IOException e) {
                        throw new RuntimeException(e);
                    } catch (URISyntaxException e) {
                        throw new RuntimeException(e);
                    }
                }
            });
        }
    }

    // ... that makes sure to delete all our files.
    public static void main(String[] args) throws InterruptedException {
        File tmpdir = new File(System.getProperty("java.io.tmpdir"));
        File tempDir = new File(args[0]);
        if (!tmpdir.equals(tempDir.getParentFile()) ||
                !tempDir.getName().startsWith("javacpp")) {
            // Someone is trying to break us ... ?
            return;
        }
        for (File file : tempDir.listFiles()) {
            while (file.exists() && !file.delete()) {
                Thread.sleep(100);
            }
        }
        tempDir.delete();
    }


    /**
     * Contains {@code offsetof()} and {@code sizeof()} values of native types
     * of {@code struct}, {@code class}, and {@code union}. A {@link WeakHashMap}
     * is used to prevent the Loader from hanging onto Class objects the user may
     * be trying to unload.
     */
    static WeakHashMap<Class<? extends Pointer>,HashMap<String,Integer>> memberOffsets =
            new WeakHashMap<Class<? extends Pointer>,HashMap<String,Integer>>();

    /**
     * Called by native libraries to put {@code offsetof()} and {@code sizeof()} values in {@link #memberOffsets}.
     * Tries to load the Class object for typeName using the {@link ClassLoader} of the Loader.
     *
     * @param typeName the name of the peer Class acting as interface to the native type
     * @param member the name of the native member variable (can be null to retrieve the Class object only)
     * @param offset the value of {@code offsetof()} (or {@code sizeof()} when {@code member.equals("sizeof")})
     * @return {@code Class.forName(typeName, false)}
     * @throws ClassNotFoundException on Class initialization failure
     */
    static Class putMemberOffset(String typeName, String member, int offset) throws ClassNotFoundException {
        Class<?> c = Class.forName(typeName.replace('/', '.'), false, Loader.class.getClassLoader());
        if (member != null) {
            putMemberOffset(c.asSubclass(Pointer.class), member, offset);
        }
        return c;
    }
    /**
     * Called by native libraries to put {@code offsetof()} and {@code sizeof()} values in {@link #memberOffsets}.
     *
     * @param type the peer Class acting as interface to the native type
     * @param member the name of the native member variable
     * @param offset the value of {@code offsetof()} (or {@code sizeof()} when {@code member.equals("sizeof")})
     */
    static synchronized void putMemberOffset(Class<? extends Pointer> type, String member, int offset) {
        HashMap<String,Integer> offsets = memberOffsets.get(type);
        if (offsets == null) {
            memberOffsets.put(type, offsets = new HashMap<String,Integer>());
        }
        offsets.put(member, offset);
    }

    /**
     * Gets {@code offsetof()} values from {@link #memberOffsets} filled by native libraries.
     *
     * @param type the peer Class acting as interface to the native type
     * @param member the name of the native member variable
     * @return {@code memberOffsets.get(type).get(member)}
     */
    public static int offsetof(Class<? extends Pointer> type, String member) {
        // Should we synchronize that?
        return memberOffsets.get(type).get(member);
    }

    /**
     * Gets {@code sizeof()} values from {@link #memberOffsets} filled by native libraries.
     *
     * @param type the peer Class acting as interface to the native type
     * @return {@code memberOffsets.get(type).get("sizeof")}
     */
    public static int sizeof(Class<? extends Pointer> type) {
        // Should we synchronize that?
        return memberOffsets.get(type).get("sizeof");
    }
}
