/*
 * Copyright (C) 2011-2016 Samuel Audet
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

package org.bytedeco.javacpp.tools;

import java.io.File;
import java.io.FileInputStream;
import java.io.FileOutputStream;
import java.io.FilenameFilter;
import java.io.IOException;
import java.io.InputStreamReader;
import java.net.URI;
import java.net.URISyntaxException;
import java.net.URL;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.Collection;
import java.util.LinkedHashMap;
import java.util.LinkedHashSet;
import java.util.List;
import java.util.Map;
import java.util.Properties;
import java.util.jar.JarOutputStream;
import java.util.zip.ZipEntry;

import org.bytedeco.javacpp.ClassProperties;
import org.bytedeco.javacpp.Loader;

/**
 * The Builder is responsible for coordinating efforts between the Parser, the
 * Generator, and the native compiler. It contains the main() method, and basically
 * takes care of the tasks one would expect from a command line build tool, but
 * can also be used programmatically by setting its properties and calling build().
 *
 * @author Samuel Audet
 */
public class Builder {

    /**
     * Calls {@link Parser#parse(File, String[], Class)} after creating an instance of the Class.
     *
     * @param classPath an array of paths to try to load header files from
     * @param cls The class annotated with {@link org.bytedeco.javacpp.annotation.Properties}
     *            and implementing {@link InfoMapper}
     * @return the target File produced
     * @throws IOException on Java target file writing error
     * @throws ParserException on C/C++ header file parsing error
     */
    File parse(String[] classPath, Class cls) throws IOException, ParserException {
        return new Parser(logger, properties).parse(outputDirectory, classPath, cls);
    }

    /**
     * Tries to find automatically include paths for {@code jni.h} and {@code jni_md.h},
     * as well as the link and library paths for the {@code jvm} library.
     *
     * @param properties the Properties containing the paths to update
     * @param header to request support for exporting callbacks via generated header file
     */
    void includeJavaPaths(ClassProperties properties, boolean header) {
        if (properties.getProperty("platform", "").startsWith("android")) {
            // Android includes its own jni.h file and doesn't have a jvm library
            return;
        }
        String platform = Loader.getPlatform();
        final String jvmlink = properties.getProperty("platform.link.prefix", "") +
                       "jvm" + properties.getProperty("platform.link.suffix", "");
        final String jvmlib  = properties.getProperty("platform.library.prefix", "") +
                       "jvm" + properties.getProperty("platform.library.suffix", "");
        final String[] jnipath = new String[2];
        final String[] jvmpath = new String[2];
        FilenameFilter filter = new FilenameFilter() {
            @Override public boolean accept(File dir, String name) {
                if (new File(dir, "jni.h").exists()) {
                    jnipath[0] = dir.getAbsolutePath();
                }
                if (new File(dir, "jni_md.h").exists()) {
                    jnipath[1] = dir.getAbsolutePath();
                }
                if (new File(dir, jvmlink).exists()) {
                    jvmpath[0] = dir.getAbsolutePath();
                }
                if (new File(dir, jvmlib).exists()) {
                    jvmpath[1] = dir.getAbsolutePath();
                }
                return new File(dir, name).isDirectory();
            }
        };
        File javaHome;
        try {
            javaHome = new File(System.getProperty("java.home")).getParentFile().getCanonicalFile();
        } catch (IOException | NullPointerException e) {
            logger.warn("Could not include header files from java.home:" + e);
            return;
        }
        ArrayList<File> dirs = new ArrayList<File>(Arrays.asList(javaHome.listFiles(filter)));
        while (!dirs.isEmpty()) {
            File d = dirs.remove(dirs.size() - 1);
            String dpath = d.getPath();
            File[] files = d.listFiles(filter);
            if (dpath == null || files == null) {
                continue;
            }
            for (File f : files) {
                try {
                    f = f.getCanonicalFile();
                } catch (IOException e) { }
                if (!dpath.startsWith(f.getPath())) {
                    dirs.add(f);
                }
            }
        }
        if (jnipath[0] != null && jnipath[0].equals(jnipath[1])) {
            jnipath[1] = null;
        } else if (jnipath[0] == null) {
            String macpath = "/System/Library/Frameworks/JavaVM.framework/Headers/";
            if (new File(macpath).isDirectory()) {
                jnipath[0] = macpath;
            }
        }
        if (jvmpath[0] != null && jvmpath[0].equals(jvmpath[1])) {
            jvmpath[1] = null;
        }
        properties.addAll("platform.includepath", jnipath);
        if (platform.equals(properties.getProperty("platform", platform))) {
            if (header) {
                // We only need libjvm for callbacks exported with the header file
                properties.get("platform.link").add(0, "jvm");
                properties.addAll("platform.linkpath", jvmpath);
            }
            if (platform.startsWith("macosx")) {
                properties.addAll("platform.framework", "JavaVM");
            }
        }
    }

    /**
     * Launches and waits for the native compiler to produce a native shared library.
     *
     * @param sourceFilename the C++ source filename
     * @param outputFilename the output filename of the shared library
     * @param properties the Properties detailing the compiler options to use
     * @return the result of {@link Process#waitFor()}
     * @throws IOException
     * @throws InterruptedException
     */
    int compile(String sourceFilename, String outputFilename, ClassProperties properties, File workingDirectory)
            throws IOException, InterruptedException {
        ArrayList<String> command = new ArrayList<String>();

        includeJavaPaths(properties, header);

        String platform  = Loader.getPlatform();
        String compilerPath = properties.getProperty("platform.compiler");
        command.add(compilerPath);

        {
            String p = properties.getProperty("platform.sysroot.prefix", "");
            for (String s : properties.get("platform.sysroot")) {
                if (new File(s).isDirectory()) {
                    if (p.endsWith(" ")) {
                        command.add(p.trim()); command.add(s);
                    } else {
                        command.add(p + s);
                    }
                }
            }
        }

        {
            String p = properties.getProperty("platform.includepath.prefix", "");
            for (String s : properties.get("platform.includepath")) {
                if (new File(s).isDirectory()) {
                    if (p.endsWith(" ")) {
                        command.add(p.trim()); command.add(s);
                    } else {
                        command.add(p + s);
                    }
                }
            }
        }

        command.add(sourceFilename);

        Collection<String> allOptions = properties.get("platform.compiler.*");
        if (allOptions.isEmpty()) {
            allOptions.add("default");
        }
        for (String s : allOptions) {
            if (s == null || s.length() == 0) {
                continue;
            }
            String p = "platform.compiler." + s;
            String options = properties.getProperty(p);
            if (options != null && options.length() > 0) {
                command.addAll(Arrays.asList(options.split(" ")));
            } else if (!"default".equals(s)) {
                logger.warn("Could not get the property named \"" + p + "\"");
            }
        }

        command.addAll(compilerOptions);

        String output = properties.getProperty("platform.compiler.output");
        for (int i = 1; i < 2 || output != null; i++,
                output = properties.getProperty("platform.compiler.output" + i)) {
            if (output != null && output.length() > 0) {
                command.addAll(Arrays.asList(output.split(" ")));
            }

            if (output == null || output.length() == 0 || output.endsWith(" ")) {
                command.add(outputFilename);
            } else {
                command.add(command.remove(command.size() - 1) + outputFilename);
            }
        }

        {
            String p  = properties.getProperty("platform.linkpath.prefix", "");
            String p2 = properties.getProperty("platform.linkpath.prefix2");
            for (String s : properties.get("platform.linkpath")) {
                if (new File(s).isDirectory()) {
                    if (p.endsWith(" ")) {
                        command.add(p.trim()); command.add(s);
                    } else {
                        command.add(p + s);
                    }
                    if (p2 != null) {
                        if (p2.endsWith(" ")) {
                            command.add(p2.trim()); command.add(s);
                        } else {
                            command.add(p2 + s);
                        }
                    }
                }
            }
        }

        {
            String p = properties.getProperty("platform.link.prefix", "");
            String x = properties.getProperty("platform.link.suffix", "");
            int i = command.size(); // to inverse order and satisfy typical compilers
            for (String s : properties.get("platform.link")) {
                String[] libnameversion = s.split("@");
                if (libnameversion.length == 3 && libnameversion[1].length() == 0) {
                    // Only use the version number when the user gave us a double @
                    s = libnameversion[0] + libnameversion[2];
                } else {
                    s = libnameversion[0];
                }
                if (p.endsWith(" ") && x.startsWith(" ")) {
                    command.add(i, p.trim()); command.add(i + 1, s); command.add(i + 2, x.trim());
                } else if (p.endsWith(" ")) {
                    command.add(i, p.trim()); command.add(i + 1, s + x);
                } else if (x.startsWith(" ")) {
                    command.add(i, p + s); command.add(i + 1, x.trim());
                } else {
                    command.add(i, p + s + x);
                }
            }
        }

        {
            String p = properties.getProperty("platform.frameworkpath.prefix", "");
            for (String s : properties.get("platform.frameworkpath")) {
                if (new File(s).isDirectory()) {
                    if (p.endsWith(" ")) {
                        command.add(p.trim()); command.add(s);
                    } else {
                        command.add(p + s);
                    }
                }
            }
        }

        {
            String p = properties.getProperty("platform.framework.prefix", "");
            String x = properties.getProperty("platform.framework.suffix", "");
            for (String s : properties.get("platform.framework")) {
                if (p.endsWith(" ") && x.startsWith(" ")) {
                    command.add(p.trim()); command.add(s); command.add(x.trim());
                } else if (p.endsWith(" ")) {
                    command.add(p.trim()); command.add(s + x);
                } else if (x.startsWith(" ")) {
                    command.add(p + s); command.add(x.trim());
                } else {
                    command.add(p + s + x);
                }
            }
        }

        String text = "";
        boolean windows = platform.startsWith("windows");
        for (String s : command) {
            boolean hasSpaces = s.indexOf(" ") > 0;
            if (hasSpaces) {
                text += windows ? "\"" : "'";
            }
            text += s;
            if (hasSpaces) {
                text += windows ? "\"" : "'";
            }
            text += " ";
        }
        logger.info(text);

        ProcessBuilder pb = new ProcessBuilder(command);
        // Use the library output path as the working directory so that all
        // build files, including intermediate ones from MSVC, are dumped there
        pb.directory(workingDirectory);
        if (environmentVariables != null) {
            pb.environment().putAll(environmentVariables);
        }
        return pb.inheritIO().start().waitFor();
    }

    /**
     * Generates a C++ source file for classes, and compiles everything in
     * one shared library when {@code compile == true}.
     *
     * @param classes the Class objects as input to Generator
     * @param outputName the output name of the shared library
     * @return the actual File generated, either the compiled library or its source
     * @throws IOException
     * @throws InterruptedException
     */
    File generateAndCompile(Class[] classes, String outputName) throws IOException, InterruptedException {
        File outputFile = null, outputPath = outputDirectory;
        ClassProperties p = Loader.loadProperties(classes, properties, true);
        String platform     = p.getProperty("platform");
        String sourcePrefix = new File(outputPath, outputName).getPath();
        String sourceSuffix = p.getProperty("platform.source.suffix", ".cpp");
        String libraryPath  = p.getProperty("platform.library.path", "");
        String libraryName  = p.getProperty("platform.library.prefix", "") + outputName + p.getProperty("platform.library.suffix", "");
        if (outputPath == null) {
            URI uri = null;
            try {
                String resourceName = '/' + classes[classes.length - 1].getName().replace('.', '/')  + ".class";
                String resourceURL = classes[classes.length - 1].getResource(resourceName).toString();
                File packageDir = new File(uri = new URI(resourceURL.substring(0, resourceURL.lastIndexOf('/') + 1)));
                File targetDir = libraryPath.length() > 0
                        ? new File(uri = new URI(resourceURL.substring(0, resourceURL.length() - resourceName.length() + 1)))
                        : new File(packageDir, platform);
                outputPath = new File(targetDir, libraryPath);
                sourcePrefix = new File(packageDir, outputName).getPath();
            } catch (URISyntaxException e) {
                throw new RuntimeException(e);
            } catch (IllegalArgumentException e) {
                throw new RuntimeException(e + ": " + uri);
            }
        }
        if (!outputPath.exists()) {
            outputPath.mkdirs();
        }
        Generator generator = new Generator(logger, p);
        String sourceFilename = sourcePrefix + sourceSuffix;
        String headerFilename = header ? sourcePrefix + ".h" : null;
        String classPath = System.getProperty("java.class.path");
        for (String s : classScanner.getClassLoader().getPaths()) {
            classPath += File.pathSeparator + s;
        }
        logger.info("Generating " + sourceFilename);
        if (generator.generate(sourceFilename, headerFilename, classPath, classes)) {
            generator.close();
            if (compile) {
                logger.info("Compiling " + outputPath.getPath() + File.separator + libraryName);
                int exitValue = compile(sourceFilename, libraryName, p, outputPath);
                if (exitValue == 0) {
                    if (deleteJniFiles) {
                        logger.info("Deleting " + sourceFilename);
                        new File(sourceFilename).delete();
                    } else {
                        logger.info("Keeping " + sourceFilename);
                    }
                    outputFile = new File(outputPath, libraryName);
                } else {
                    System.exit(exitValue);
                }
            } else {
                outputFile = new File(sourceFilename);
            }
        } else {
            logger.info("Nothing generated for " + sourceFilename);
        }
        return outputFile;
    }

    /**
     * Stores all the files in the given JAR file. Also attempts to root the paths
     * of the filenames to each element of a list of classpaths.
     *
     * @param jarFile the JAR file to create
     * @param classPath an array of paths to try to use as root for classes
     * @param files a list of files to store in the JAR file
     * @throws IOException
     */
    void createJar(File jarFile, String[] classPath, File ... files) throws IOException {
        logger.info("Creating " + jarFile);
        JarOutputStream jos = new JarOutputStream(new FileOutputStream(jarFile));
        for (File f : files) {
            String name = f.getPath();
            if (classPath != null) {
                // Store only the path relative to the classpath so that
                // our Loader may use the package name of the associated
                // class to get the file as a resource from the ClassLoader.
                String[] names = new String[classPath.length];
                for (int i = 0; i < classPath.length; i++) {
                    String path = new File(classPath[i]).getCanonicalPath();
                    if (name.startsWith(path)) {
                        names[i] = name.substring(path.length() + 1);
                    }
                }
                // Retain only the shortest relative name.
                for (int i = 0; i < names.length; i++) {
                    if (names[i] != null && names[i].length() < name.length()) {
                        name = names[i];
                    }
                }
            }
            ZipEntry e = new ZipEntry(name.replace(File.separatorChar, '/'));
            e.setTime(f.lastModified());
            jos.putNextEntry(e);
            FileInputStream fis = new FileInputStream(f);
            byte[] buffer = new byte[1024];
            int length;
            while ((length = fis.read(buffer)) != -1) {
                jos.write(buffer, 0, length);
            }
            fis.close();
            jos.closeEntry();
        }
        jos.close();
    }

    /**
     * Default constructor that simply initializes everything.
     */
    public Builder() {
        this(Logger.create(Builder.class));
    }
    /**
     * Constructor that simply initializes everything.
     * @param logger where to send messages
     */
    public Builder(Logger logger) {
        this.logger = logger;
        System.setProperty("org.bytedeco.javacpp.loadlibraries", "false");
        properties = Loader.loadProperties();
        classScanner = new ClassScanner(logger, new ArrayList<Class>(),
                new UserClassLoader(Thread.currentThread().getContextClassLoader()));
        compilerOptions = new ArrayList<String>();
    }

    /** Logger where to send debug, info, warning, and error messages. */
    final Logger logger;
    /** The directory where the generated files and compiled shared libraries get written to.
     *  By default they are placed in the same directory as the {@code .class} file. */
    File outputDirectory = null;
    /** The name of the output generated source file or shared library. This enables single-
     *  file output mode. By default, the top-level enclosing classes get one file each. */
    String outputName = null;
    /** The name of the JAR file to create, if not {@code null}. */
    String jarPrefix = null;
    /** If true, compiles the generated source file to a shared library and deletes source. */
    boolean compile = true;
    /** If true, preserves the generated C++ JNI files after compilation */
    boolean deleteJniFiles = true;
    /** If true, also generates C++ header files containing declarations of callback functions. */
    boolean header = false;
    /** If true, also copies to the output directory dependent shared libraries (link and preload). */
    boolean copyLibs = false;
    /** Accumulates the various properties loaded from resources, files, command line options, etc. */
    Properties properties = null;
    /** The instance of the {@link ClassScanner} that fills up a {@link Collection} of {@link Class} objects to process. */
    ClassScanner classScanner = null;
    /** User specified environment variables to pass to the native compiler. */
    Map<String,String> environmentVariables = null;
    /** Contains additional command line options from the user for the native compiler. */
    Collection<String> compilerOptions = null;

    /** Splits argument with {@link File#pathSeparator} and appends result to paths of the {@link #classScanner}. */
    public Builder classPaths(String classPaths) {
        classPaths(classPaths == null ? null : classPaths.split(File.pathSeparator));
        return this;
    }
    /** Appends argument to the paths of the {@link #classScanner}. */
    public Builder classPaths(String ... classPaths) {
        classScanner.getClassLoader().addPaths(classPaths);
        return this;
    }
    /** Sets the {@link #outputDirectory} field to the argument. */
    public Builder outputDirectory(String outputDirectory) {
        outputDirectory(outputDirectory == null ? null : new File(outputDirectory));
        return this;
    }
    /** Sets the {@link #outputDirectory} field to the argument. */
    public Builder outputDirectory(File outputDirectory) {
        this.outputDirectory = outputDirectory;
        return this;
    }
    /** Sets the {@link #compile} field to the argument. */
    public Builder compile(boolean compile) {
        this.compile = compile;
        return this;
    }
    /** Sets the {@link #deleteJniFiles} field to the argument. */
    public Builder deleteJniFiles(boolean deleteJniFiles) {
        this.deleteJniFiles = deleteJniFiles;
        return this;
    }
    /** Sets the {@link #header} field to the argument. */
    public Builder header(boolean header) {
        this.header = header;
        return this;
    }
    /** Sets the {@link #copyLibs} field to the argument. */
    public Builder copyLibs(boolean copyLibs) {
        this.copyLibs = copyLibs;
        return this;
    }
    /** Sets the {@link #outputName} field to the argument. */
    public Builder outputName(String outputName) {
        this.outputName = outputName;
        return this;
    }
    /** Sets the {@link #jarPrefix} field to the argument. */
    public Builder jarPrefix(String jarPrefix) {
        this.jarPrefix = jarPrefix;
        return this;
    }
    /** Sets the {@link #properties} field to the ones loaded from resources for the specified platform. */
    public Builder properties(String platform) {
        if (platform != null) {
            properties = Loader.loadProperties(platform, null);
        }
        return this;
    }
    /** Adds all the properties of the argument to the {@link #properties} field. */
    public Builder properties(Properties properties) {
        if (properties != null) {
            for (Map.Entry e : properties.entrySet()) {
                property((String)e.getKey(), (String)e.getValue());
            }
        }
        return this;
    }
    /** Sets the {@link #properties} field to the ones loaded from the specified file. */
    public Builder propertyFile(String filename) throws IOException {
        propertyFile(filename == null ? null : new File(filename));
        return this;
    }
    /** Sets the {@link #properties} field to the ones loaded from the specified file. */
    public Builder propertyFile(File propertyFile) throws IOException {
        if (propertyFile == null) {
            return this;
        }
        FileInputStream fis = new FileInputStream(propertyFile);
        properties = new Properties();
        try {
            properties.load(new InputStreamReader(fis));
        } catch (NoSuchMethodError e) {
            properties.load(fis);
        }
        fis.close();
        return this;
    }
    /** Sets a property of the {@link #properties} field, in either "key=value" or "key:value" format. */
    public Builder property(String keyValue) {
        int equalIndex = keyValue.indexOf('=');
        if (equalIndex < 0) {
            equalIndex = keyValue.indexOf(':');
        }
        property(keyValue.substring(2, equalIndex),
                 keyValue.substring(equalIndex+1));
        return this;
    }
    /** Sets a key/value pair property of the {@link #properties} field. */
    public Builder property(String key, String value) {
        if (key.length() > 0 && value.length() > 0) {
            properties.put(key, value);
        }
        return this;
    }
    /** Requests the {@link #classScanner} to add a class or all classes from a package.
     *  A {@code null} argument indicates the unnamed package. */
    public Builder classesOrPackages(String ... classesOrPackages) throws IOException, ClassNotFoundException, NoClassDefFoundError {
        if (classesOrPackages == null) {
            classScanner.addPackage(null, true);
        } else for (String s : classesOrPackages) {
            classScanner.addClassOrPackage(s);
        }
        return this;
    }
    /** Sets the {@link #environmentVariables} field to the argument. */
    public Builder environmentVariables(Map<String,String> environmentVariables) {
        this.environmentVariables = environmentVariables;
        return this;
    }
    /** Appends arguments to the {@link #compilerOptions} field. */
    public Builder compilerOptions(String ... options) {
        if (options != null) {
            compilerOptions.addAll(Arrays.asList(options));
        }
        return this;
    }

    /**
     * Starts the build process and returns an array of {@link File} produced.
     *
     * @return the array of File produced
     * @throws IOException
     * @throws InterruptedException
     * @throws ParserException
     */
    public File[] build() throws IOException, InterruptedException, ParserException {
        if (classScanner.getClasses().isEmpty()) {
            return null;
        }

        List<File> outputFiles = new ArrayList<File>();
        Map<String, LinkedHashSet<Class>> map = new LinkedHashMap<String, LinkedHashSet<Class>>();
        for (Class c : classScanner.getClasses()) {
            if (Loader.getEnclosingClass(c) != c) {
                continue;
            }
            ClassProperties p = Loader.loadProperties(c, properties, false);
            if (!p.isLoaded()) {
                logger.warn("Could not load platform properties for " + c);
                continue;
            }
            String target = p.getProperty("target");
            if (target != null && !c.getName().equals(target)) {
                File f = parse(classScanner.getClassLoader().getPaths(), c);
                if (f != null) {
                    outputFiles.add(f);
                }
                continue;
            }
            String libraryName = outputName != null ? outputName : p.getProperty("platform.library", "");
            if (libraryName.length() == 0) {
                continue;
            }
            LinkedHashSet<Class> classList = map.get(libraryName);
            if (classList == null) {
                map.put(libraryName, classList = new LinkedHashSet<Class>());
            }
            classList.addAll(p.getEffectiveClasses());
        }
        for (String libraryName : map.keySet()) {
            LinkedHashSet<Class> classSet = map.get(libraryName);
            Class[] classArray = classSet.toArray(new Class[classSet.size()]);
            File f = generateAndCompile(classArray, libraryName);
            if (f != null) {
                outputFiles.add(f);
                if (copyLibs) {
                    // Do not copy library files from inherit properties ...
                    ClassProperties p = Loader.loadProperties(classArray, properties, false);
                    List<String> preloads = new ArrayList<String>();
                    preloads.addAll(p.get("platform.preload"));
                    preloads.addAll(p.get("platform.link"));
                    // ... but we should use all the inherited paths!
                    p = Loader.loadProperties(classArray, properties, true);

                    File directory = f.getParentFile();
                    for (String s : preloads) {
                        URL[] urls = Loader.findLibrary(null, p, s, true);
                        File fi;
                        try {
                            fi = new File(urls[0].toURI());
                        } catch (Exception e) {
                            continue;
                        }
                        File fo = new File(directory, fi.getName());
                        if (fi.exists() && !outputFiles.contains(fo)) {
                            logger.info("Copying " + fi);
                            FileInputStream fis = new FileInputStream(fi);
                            FileOutputStream fos = new FileOutputStream(fo);
                            byte[] buffer = new byte[1024];
                            int length;
                            while ((length = fis.read(buffer)) != -1) {
                                fos.write(buffer, 0, length);
                            }
                            fos.close();
                            fis.close();
                            outputFiles.add(fo);
                        }
                    }
                }
            }
        }

        File[] files = outputFiles.toArray(new File[outputFiles.size()]);
        if (jarPrefix != null && files.length > 0) {
            File jarFile = new File(jarPrefix + "-" + properties.get("platform") + ".jar");
            File d = jarFile.getParentFile();
            if (d != null && !d.exists()) {
                d.mkdir();
            }
            createJar(jarFile, outputDirectory == null ? classScanner.getClassLoader().getPaths() : null, files);
        }

        // reset the load flag to let users load compiled libraries
        System.setProperty("org.bytedeco.javacpp.loadlibraries", "true");
        return files;
    }

    /**
     * Simply prints out to the display the command line usage.
     */
    public static void printHelp() {
        String version = Builder.class.getPackage().getImplementationVersion();
        if (version == null) {
            version = "unknown";
        }
        System.out.println(
            "JavaCPP version " + version + "\n" +
            "Copyright (C) 2011-2016 Samuel Audet <samuel.audet@gmail.com>\n" +
            "Project site: https://github.com/bytedeco/javacpp");
        System.out.println();
        System.out.println("Usage: java -jar javacpp.jar [options] [class or package (suffixed with .* or .**)]");
        System.out.println();
        System.out.println("where options include:");
        System.out.println();
        System.out.println("    -classpath <path>      Load user classes from path");
        System.out.println("    -d <directory>         Output all generated files to directory");
        System.out.println("    -o <name>              Output everything in a file named after given name");
        System.out.println("    -nocompile             Do not compile or delete the generated source files");
        System.out.println("    -nodelete              Do not delete generated C++ JNI files after compilation");
        System.out.println("    -header                Generate header file with declarations of callbacks functions");
        System.out.println("    -copylibs              Copy to output directory dependent libraries (link and preload)");
        System.out.println("    -jarprefix <prefix>    Also create a JAR file named \"<prefix>-<platform>.jar\"");
        System.out.println("    -properties <resource> Load all properties from resource");
        System.out.println("    -propertyfile <file>   Load all properties from file");
        System.out.println("    -D<property>=<value>   Set property to value");
        System.out.println("    -Xcompiler <option>    Pass option directly to compiler");
        System.out.println();
    }

    /**
     * The terminal shell interface to the Builder.
     *
     * @param args an array of arguments as described by {@link #printHelp()}
     * @throws Exception
     */
    public static void main(String[] args) throws Exception {
        boolean addedClasses = false;
        Builder builder = new Builder();
        for (int i = 0; i < args.length; i++) {
            if ("-help".equals(args[i]) || "--help".equals(args[i])) {
                printHelp();
                System.exit(0);
            } else if ("-classpath".equals(args[i]) || "-cp".equals(args[i]) || "-lib".equals(args[i])) {
                builder.classPaths(args[++i]);
            } else if ("-d".equals(args[i])) {
                builder.outputDirectory(args[++i]);
            } else if ("-o".equals(args[i])) {
                builder.outputName(args[++i]);
            } else if ("-cpp".equals(args[i]) || "-nocompile".equals(args[i])) {
                builder.compile(false);
            } else if ("-nodelete".equals(args[i])) {
                builder.deleteJniFiles(false);
            } else if ("-header".equals(args[i])) {
                builder.header(true);
            } else if ("-copylibs".equals(args[i])) {
                builder.copyLibs(true);
            } else if ("-jarprefix".equals(args[i])) {
                builder.jarPrefix(args[++i]);
            } else if ("-properties".equals(args[i])) {
                builder.properties(args[++i]);
            } else if ("-propertyfile".equals(args[i])) {
                builder.propertyFile(args[++i]);
            } else if (args[i].startsWith("-D")) {
                builder.property(args[i]);
            } else if ("-Xcompiler".equals(args[i])) {
                builder.compilerOptions(args[++i]);
            } else if (args[i].startsWith("-")) {
                builder.logger.error("Invalid option \"" + args[i] + "\"");
                printHelp();
                System.exit(1);
            } else {
                builder.classesOrPackages(args[i]);
                addedClasses = true;
            }
        }
        if (!addedClasses) {
            builder.classesOrPackages((String[])null);
        }
        builder.build();
    }
}
