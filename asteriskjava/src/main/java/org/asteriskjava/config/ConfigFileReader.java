package org.asteriskjava.config;

import java.io.BufferedReader;
import java.io.FileReader;
import java.io.IOException;
import java.nio.CharBuffer;
import java.util.*;

/**
 * Reads and parses Asterisk configuration files.
 * <p/>
 * See Asterisk's <code>main/config.c</code>.
 * <p/>
 * Client code is not supposed to use this class.
 *
 * @author srt
 * @version $Id: ConfigFileReader.java 1140 2008-08-18 18:49:36Z srt $
 */
public class ConfigFileReader
{
    private static final int MAX_LINE_LENGTH = 8192;
    private static char COMMENT_META = ';';
    private static char COMMENT_TAG = '-';
    private static final Set<Class> WARNING_CLASSES;

    static
    {
        WARNING_CLASSES = new HashSet<Class>();
        WARNING_CLASSES.add(MissingEqualSignException.class);
        WARNING_CLASSES.add(UnknownDirectiveException.class);
        WARNING_CLASSES.add(MissingDirectiveParameterException.class);
    }

    private StringBuilder commentBlock;
    protected final Map<String, Category> categories;
    private final List<ConfigParseException> warnings;

    protected Category currentCategory;
    private int currentCommentLevel = 0;

    public ConfigFileReader()
    {
        this.commentBlock = new StringBuilder();
        this.categories = new LinkedHashMap<String, Category>();
        this.warnings = new ArrayList<ConfigParseException>();
    }

    public ConfigFile readFile(String configfile) throws IOException, ConfigParseException
    {
        final ConfigFile result;
        final BufferedReader reader;

        reader = new BufferedReader(new FileReader(configfile));
        try
        {
            readFile(configfile, reader);
        }
        finally
        {
            try
            {
                reader.close();
            }
            catch (Exception e) // NOPMD
            {
                // ignore
            }
        }

        result = new ConfigFileImpl(configfile, new TreeMap<String, Category>(categories));


        return result;
    }

    void reset()
    {
        commentBlock = new StringBuilder();
        categories.clear();
        warnings.clear();
        currentCategory = null;
        currentCommentLevel = 0;
    }

    Collection<Category> getCategories()
    {
        return categories.values();
    }

    public Collection<ConfigParseException> getWarnings()
    {
        return new ArrayList<ConfigParseException>(warnings);
    }

    void readFile(String configfile, BufferedReader reader) throws IOException, ConfigParseException
    {
        String line;
        int lineno = 0;
        CharBuffer buffer = CharBuffer.allocate(MAX_LINE_LENGTH);

        reset();
        while ((line = reader.readLine()) != null)
        {
            lineno++;
            buffer.clear();
            buffer.put(line);
            buffer.put("\n");
            buffer.flip();

            processLine(configfile, lineno, buffer);
        }
    }

    ConfigElement processLine(String configfile, int lineno, CharBuffer buffer) throws ConfigParseException
    {
        char c;
        final StringBuilder processLineBuilder;
        final StringBuilder lineCommentBuilder;

        processLineBuilder = new StringBuilder(MAX_LINE_LENGTH);
        lineCommentBuilder = new StringBuilder(MAX_LINE_LENGTH);
        buffer.mark();

        while (buffer.hasRemaining())
        {
            final int position;

            position = buffer.position();
            c = buffer.get();
            //System.out.println(position + ": " + c);

            if (c == COMMENT_META)
            {
                if (position >= 1 && buffer.get(position - 1) == '\\')
                {
                    /* Escaped semicolons aren't comments. */
                } // NOPMD
                else if (buffer.remaining() >= 3
                        && buffer.get(position + 1) == COMMENT_TAG
                        && buffer.get(position + 2) == COMMENT_TAG
                        && buffer.get(position + 3) != COMMENT_TAG)
                {
                    /* Meta-Comment start detected ";--" */

                    currentCommentLevel++;
                    //System.out.println("Comment start, new level: " + currentCommentLevel);

                    if (!inComment())
                    {
                        commentBlock.append(";--");
                        buffer.position(position + 3);
                        buffer.mark();
                        continue;
                    }
                }
                else if (inComment()
                        && position >= 2
                        && buffer.get(position - 1) == COMMENT_TAG
                        && buffer.get(position - 2) == COMMENT_TAG)
                {
                    /* Meta-Comment end detected */

                    currentCommentLevel--;

                    if (!inComment())
                    {
                        buffer.reset();

                        //int commentLength = (position + 1) - buffer.position();

                        //buffer.reset();
                        //for (int i = 0; i < commentLength; i++)
                        //{
                        //    commentBlock.append(buffer.get());
                        //}

                        commentBlock.append(c);
                        //System.out.println("Comment end at " + position + ": '" + commentBlock.toString() + "'");

                        buffer.position(position + 1);
                        buffer.compact();
                        buffer.flip();

                        //System.out.println("Buffer compacted");
                        continue;
                    }
                }
                else
                {
                    if (!inComment())
                    {
                        /* If ; is found, and we are not nested in a comment, we immediately stop all comment processing */
                        //System.out.println("Found ; while not in comment");
                        while (buffer.hasRemaining())
                        {
                            lineCommentBuilder.append(buffer.get());
                        }
                        break;
                    }
                    else
                    {
                        /* Found ';' while in comment */
                    } // NOPMD
                }
            }


            if (inComment())
            {
                commentBlock.append(c);
            }
            else
            {
                //System.out.println("Added '" + c + "' to processLine");
                processLineBuilder.append(c);
            }
        }

        String processLineString;
        String lineCommentString;
        ConfigElement configElement;

        processLineString = processLineBuilder.toString().trim();
        lineCommentString = lineCommentBuilder.toString().trim();

        //System.out.println("process line: '" + processLineString + "'");
        if (processLineString.length() == 0)
        {
            if (lineCommentString.length() != 0)
            {
                commentBlock.append(";");
                commentBlock.append(lineCommentString);
            }
            if (!inComment())
            {
                commentBlock.append("\n");
            }
            return null;
        }

        try
        {
            configElement = processTextLine(configfile, lineno, processLineString);
        }
        catch (ConfigParseException e)
        {
            // some parsing exceptions are treated as warnings by Asterisk, we mirror this behavior.
            if (WARNING_CLASSES.contains(e.getClass()))
            {
                warnings.add(e);
                return null;
            }
            else
            {
                throw e;
            }
        }

        if (lineCommentString.length() != 0)
        {
            configElement.setComment(lineCommentString);
        }

        if (commentBlock.length() != 0)
        {
            configElement.setPreComment(commentBlock.toString());
            commentBlock.delete(0, commentBlock.length());
        }

        return configElement;
    }

    boolean inComment()
    {
        return currentCommentLevel != 0;
    }

    protected ConfigElement processTextLine(String configfile, int lineno, String line) throws ConfigParseException
    {
        ConfigElement configElement;

        if (line.charAt(0) == '[') // A category header
        {
            configElement = parseCategoryHeader(configfile, lineno, line);
        }
        else if (line.charAt(0) == '#') // a directive - #include or #exec
        {
            configElement = parseDirective(configfile, lineno, line);
        }
        else // just a line
        {
            if (currentCategory == null)
            {
                throw new ConfigParseException(configfile, lineno,
                        "parse error: No category context for line %d of %s", lineno, configfile);
            }

            configElement = parseVariable(configfile, lineno, line);
            currentCategory.addElement(configElement);
        }

        return configElement;
    }

    protected Category parseCategoryHeader(String configfile, int lineno, String line) throws ConfigParseException
    {
        final Category category;
        final String name;
        final int nameEndPos;

        /* format is one of the following:
        * [foo]        define a new category named 'foo'
        * [foo](!)     define a new template category named 'foo'
        * [foo](+)     append to category 'foo', error if foo does not exist.
        * [foo](a)     define a new category and inherit from template a.
        *              You can put a comma-separated list of templates and '!' and '+'
        *              between parentheses, with obvious meaning.
        */

        nameEndPos = line.indexOf(']');
        if (nameEndPos == -1)
        {
            throw new ConfigParseException(configfile, lineno,
                    "parse error: no closing ']', line %d of %s", lineno, configfile);
        }
        name = line.substring(1, nameEndPos);
        category = new Category(configfile, lineno, name);

        /* Handle options or categories to inherit from if available */
        if (line.length() > nameEndPos + 1 && line.charAt(nameEndPos + 1) == '(')
        {
            final String[] options;
            final String optionsString;
            final int optionsEndPos;

            optionsString = line.substring(nameEndPos + 1);
            optionsEndPos = optionsString.indexOf(')');
            if (optionsEndPos == -1)
            {
                throw new ConfigParseException(configfile, lineno,
                        "parse error: no closing ')', line %d of %s", lineno, configfile);
            }

            options = optionsString.substring(1, optionsEndPos).split(",");
            for (String cur : options)
            {
                if ("!".equals(cur)) // category template
                {
                    category.markAsTemplate();
                }
                else if ("+".equals(cur)) // category addition
                {
                    final Category categoryToAddTo;

                    categoryToAddTo = categories.get(name);
                    if (categoryToAddTo == null)
                    {
                        throw new ConfigParseException(configfile, lineno,
                                "Category addition requested, but category '%s' does not exist, line %d of %s",
                                name, lineno, configfile);
                    }

                    //todo implement category addition
                    //category = categoryToAddTo;
                }
                else
                {
                    final Category baseCategory;

                    baseCategory = categories.get(cur);
                    if (baseCategory == null)
                    {
                        throw new ConfigParseException(configfile, lineno,
                                "Inheritance requested, but category '%s' does not exist, line %d of %s",
                                cur, lineno, configfile);
                    }
                    inheritCategory(category, baseCategory);
                }
            }
        }

        appendCategory(category);
        return category;
    }

    ConfigDirective parseDirective(String configfile, int lineno, String line) throws ConfigParseException
    {
        ConfigDirective directive;
        final StringBuilder nameBuilder;
        final StringBuilder paramBuilder;
        String name = null;
        String param;

        nameBuilder = new StringBuilder();
        paramBuilder = new StringBuilder();
        for (int i = 1; i < line.length(); i++)
        {
            final char c;

            c = line.charAt(i);
            if (name == null)
            {
                nameBuilder.append(c);
                if (Character.isWhitespace(c) || i + 1 == line.length())
                {
                    name = nameBuilder.toString().trim();
                }
            }
            else
            {
                paramBuilder.append(c);
            }
        }

        param = paramBuilder.toString().trim();

        if (param.length() != 0 &&
                (param.charAt(0) == '"' || param.charAt(0) == '<' || param.charAt(0) == '>'))
        {
            param = param.substring(1);
        }

        int endPos = param.length() - 1;
        if (param.length() != 0 &&
                (param.charAt(endPos) == '"' || param.charAt(endPos) == '<' || param.charAt(endPos) == '>'))
        {
            param = param.substring(0, endPos);
        }

        if ("exec".equalsIgnoreCase(name))
        {
            directive = new ExecDirective(configfile, lineno, param);
        }
        else if ("include".equalsIgnoreCase(name))
        {
            directive = new IncludeDirective(configfile, lineno, param);
        }
        else
        {
            throw new UnknownDirectiveException(configfile, lineno,
                    "Unknown directive '%s' at line %d of %s", name, lineno, configfile);
        }

        if (param.length() == 0)
        {
            throw new MissingDirectiveParameterException(configfile, lineno,
                    "Directive '#%s' needs an argument (%s) at line %d of %s",
                    name.toLowerCase(Locale.US),
                    "include".equalsIgnoreCase(name) ? "filename" : "/path/to/executable",
                    lineno,
                    configfile);
        }

        return directive;
    }

    protected ConfigVariable parseVariable(String configfile, int lineno, String line) throws ConfigParseException
    {
        int pos;
        String name;
        String value;

        pos = line.indexOf('=');
        if (pos == -1)
        {
            throw new MissingEqualSignException(configfile, lineno,
                    "No '=' (equal sign) in line %d of %s", lineno, configfile);
        }

        name = line.substring(0, pos).trim();

        // Ignore > in =>
        if (line.length() > pos + 1 && line.charAt(pos + 1) == '>')
        {
            pos++;
        }

        value = (line.length() > pos + 1) ? line.substring(pos + 1).trim() : "";
        return new ConfigVariable(configfile, lineno, name, value);
    }

    void inheritCategory(Category category, Category baseCategory)
    {
        category.addBaseCategory(baseCategory);
    }

    void appendCategory(Category category)
    {
        categories.put(category.getName(), category);
        currentCategory = category;
    }
}
