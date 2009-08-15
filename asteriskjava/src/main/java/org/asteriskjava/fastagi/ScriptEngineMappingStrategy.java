/*
 *  Copyright 2004-2006 Stefan Reuter
 *
 *  Licensed under the Apache License, Version 2.0 (the "License");
 *  you may not use this file except in compliance with the License.
 *  You may obtain a copy of the License at
 *
 *      http://www.apache.org/licenses/LICENSE-2.0
 *
 *  Unless required by applicable law or agreed to in writing, software
 *  distributed under the License is distributed on an "AS IS" BASIS,
 *  WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 *  See the License for the specific language governing permissions and
 *  limitations under the License.
 *
 */
package org.asteriskjava.fastagi;

import org.asteriskjava.util.LogFactory;
import org.asteriskjava.util.Log;

import javax.script.ScriptEngine;
import javax.script.ScriptEngineManager;
import javax.script.Bindings;
import javax.script.ScriptException;
import java.io.*;
import java.util.regex.Matcher;
import java.util.List;
import java.util.ArrayList;
import java.net.URLClassLoader;
import java.net.URL;
import java.net.MalformedURLException;

/**
 * A MappingStrategy that uses {@see javax.script.ScriptEngine} to run AgiScripts. This MappingStrategy
 * can be used to run JavaScript, Groovy, JRuby, etc. scripts.
 *
 * @since 1.0.0
 */
public class ScriptEngineMappingStrategy implements MappingStrategy
{
    protected final Log logger = LogFactory.getLog(getClass());

    /**
     * The binding under which the AGI request is made available to scripts.
     */
    public static final String REQUEST = "request";

    /**
     * The binding under which the AGI channel is made available to scripts.
     */
    public static final String CHANNEL = "channel";

    private static final String[] DEFAULT_SCRIPT_PATH = new String[]{"agi"};
    private static final String[] DEFAULT_LIB_PATH = new String[]{"lib"};

    protected String[] scriptPath;
    protected String[] libPath;
    protected ScriptEngineManager scriptEngineManager = null;

    /**
     * Creates a new ScriptEngineMappingStrategy that searches for scripts in the current directory.
     */
    public ScriptEngineMappingStrategy()
    {
        this(DEFAULT_SCRIPT_PATH, DEFAULT_LIB_PATH);
    }

    /**
     * Creates a new ScriptEngineMappingStrategy that searches for scripts on the given path.
     *
     * @param scriptPath array of directory names to search for script files.
     * @param libPath    array of directory names to search for additional libraries (jar files).
     */
    public ScriptEngineMappingStrategy(String[] scriptPath, String[] libPath)
    {
        this.scriptPath = scriptPath;
        this.libPath = libPath;
    }

    /**
     * Sets the path to search for script files.<p>
     * Default is "agi".
     *
     * @param scriptPath array of directory names to search for script files.
     */
    public void setScriptPath(String[] scriptPath)
    {
        this.scriptPath = scriptPath;
    }

    /**
     * Sets the path to search for additional libraries (jar files).<p>
     * Default is "lib".
     *
     * @param libPath array of directory names to search for additional libraries (jar files).
     */
    public void setLibPath(String[] libPath)
    {
        this.libPath = libPath;
    }

    public AgiScript determineScript(AgiRequest request)
    {
        // check is a file corresponding to the AGI request is found on the scriptPath
        final File file = searchFile(request.getScript(), scriptPath);
        if (file == null)
        {
            return null;
        }

        // check if there is a ScriptEngine that can handle the file
        final ScriptEngine scriptEngine = getScriptEngine(file);
        if (scriptEngine == null)
        {
            logger.debug("No ScriptEngine found that can handle '" + file.getPath() + "'");
            return null;
        }

        return new ScriptEngineAgiScript(file, scriptEngine);
    }

    /**
     * Searches for a ScriptEngine that can handle the given file.
     *
     * @param file the file to search a ScriptEngine for.
     * @return the ScriptEngine or <code>null</code> if none is found.
     */
    protected ScriptEngine getScriptEngine(File file)
    {
        final String extension = getExtension(file.getName());
        if (extension == null)
        {
            return null;
        }

        return getScriptEngineManager().getEngineByExtension(extension);
    }

    /**
     * Returns the ScriptEngineManager to use for loading the ScriptEngine. The ScriptEngineManager is only
     * created once and reused for subsequent requests. Override this method to provide your own implementation.
     *
     * @return the ScriptEngineManager to use for loading the ScriptEngine.
     * @see javax.script.ScriptEngineManager#ScriptEngineManager()
     */
    protected synchronized ScriptEngineManager getScriptEngineManager()
    {
        if (scriptEngineManager == null)
        {
            this.scriptEngineManager = new ScriptEngineManager(getClassLoader());
        }
        return scriptEngineManager;
    }

    /**
     * Returns the ClassLoader to use for the ScriptEngineManager. Adds all jar files in the "lib" subdirectory of
     * the current directory to the class path. Override this method to provide your own ClassLoader.
     *
     * @return the ClassLoader to use for the ScriptEngineManager.
     * @see #getScriptEngineManager()
     */
    protected ClassLoader getClassLoader()
    {
        final ClassLoader parentClassLoader = Thread.currentThread().getContextClassLoader();
        final List<URL> jarFileUrls = new ArrayList<URL>();

        if (libPath == null || libPath.length == 0)
        {
            return parentClassLoader;
        }

        for (String libPathEntry : libPath)
        {
            final File libDir = new File(libPathEntry);
            if (!libDir.isDirectory())
            {
                continue;
            }

            final File[] jarFiles = libDir.listFiles(new FilenameFilter()
            {
                public boolean accept(File dir, String name)
                {
                    return name.endsWith(".jar");
                }
            });

            for (File jarFile : jarFiles)
            {
                try
                {
                    jarFileUrls.add(jarFile.toURI().toURL());
                }
                catch (MalformedURLException e)
                {
                    // should not happen
                }
            }
        }

        if (jarFileUrls.size() == 0)
        {
            return parentClassLoader;
        }

        return new URLClassLoader(jarFileUrls.toArray(new URL[jarFileUrls.size()]), parentClassLoader);
    }

    /**
     * Searches for the file with the given name on the path.
     *
     * @param scriptName the name of the file to search for.
     * @param path       an array of directories to search for the file in order of preference.
     * @return the canonical file if found on the path or <code>null</code> if not found.
     */
    protected File searchFile(String scriptName, String[] path)
    {
        if (scriptName == null || path == null)
        {
            return null;
        }

        for (String pathElement : path)
        {
            final File pathElementDir = new File(pathElement);
            // skip if pathElement is not a directory
            if (!pathElementDir.isDirectory())
            {
                continue;
            }

            final File file = new File(pathElementDir, scriptName.replaceAll("/", Matcher.quoteReplacement(File.separator)));
            if (!file.exists())
            {
                continue;
            }

            try
            {
                // prevent attacks with scripts using ".." in their name.
                if (!isInside(file, pathElementDir))
                {
                    return null;
                }
            }
            catch (IOException e)
            {
                logger.warn("Unable to check whether '" + file.getPath() + "' is below '" + pathElementDir.getPath() + "'");
                continue;
            }

            try
            {
                return file.getCanonicalFile();
            }
            catch (IOException e)
            {
                logger.error("Unable to get canonical file for '" + file.getPath() + "'", e);
            }
        }
        return null;
    }

    /**
     * Checks whether a file is contained within a given directory (or a sub directory) or not.
     *
     * @param file the file to check.
     * @param dir  the directory to check.
     * @return <code>true</code> if file is below directory, <code>false</code> otherwise.
     * @throws IOException if the canonical path of file or dir cannot be determined.
     */
    protected final boolean isInside(File file, File dir) throws IOException
    {
        return file.getCanonicalPath().startsWith(dir.getCanonicalPath());
    }

    /**
     * Returns the extension (the part after the last ".") of the given script.
     *
     * @param scriptName the name of the script to return the extension of.
     * @return the extension of the script or <code>null</code> if there is no extension.
     */
    protected static String getExtension(String scriptName)
    {
        if (scriptName == null)
        {
            return null;
        }

        int filePosition = scriptName.lastIndexOf("/");
        String fileName;

        if (scriptName.lastIndexOf("\\") > filePosition)
        {
            filePosition = scriptName.lastIndexOf("\\");
        }

        if (filePosition >= 0)
        {
            fileName = scriptName.substring(filePosition + 1);
        }
        else
        {
            fileName = scriptName;
        }

        final int extensionPosition = fileName.lastIndexOf(".");
        if (extensionPosition >= 0)
        {
            return fileName.substring(extensionPosition + 1);
        }

        return null;
    }

    protected static Reader getReader(File file) throws FileNotFoundException
    {
        final InputStream is = new FileInputStream(file);
        return new InputStreamReader(is);
    }

    protected class ScriptEngineAgiScript implements NamedAgiScript
    {
        final File file;
        final ScriptEngine scriptEngine;

        /**
         * Creates a new ScriptEngineAgiScript.
         *
         * @param file         the file that contains the script to execute.
         * @param scriptEngine the ScriptEngine to use for executing the script.
         */
        public ScriptEngineAgiScript(File file, ScriptEngine scriptEngine)
        {
            this.file = file;
            this.scriptEngine = scriptEngine;
        }

        public String getName()
        {
            return file == null ? null : file.getName();
        }

        public void service(AgiRequest request, AgiChannel channel) throws AgiException
        {
            final Bindings bindings = scriptEngine.createBindings();

            bindings.put(ScriptEngine.FILENAME, file.getPath());
            bindings.put(REQUEST, request);
            bindings.put(CHANNEL, channel);

            // support for custom bindings
            populateBindings(file, request, channel, bindings);

            try
            {
                scriptEngine.eval(getReader(file), bindings);
            }
            catch (ScriptException e)
            {
                throw new AgiException("Execution of script '" + file.getPath() + "' with ScriptEngine failed", e);
            }
            catch (FileNotFoundException e)
            {
                throw new AgiException("Script '" + file.getPath() + "' not found", e);
            }
        }
    }

    /**
     * Override this method if you want to add additional bindings before the script is run. By default the
     * AGI request, AGI channel and the filename are available to scripts under the bindings "request", "channel"
     * and "javax.script.filename".
     *
     * @param file     the script file.
     * @param request  the AGI request.
     * @param channel  the AGI channel.
     * @param bindings the bindings to populate.
     */
    protected void populateBindings(File file, AgiRequest request, AgiChannel channel, Bindings bindings)
    {

    }
}
