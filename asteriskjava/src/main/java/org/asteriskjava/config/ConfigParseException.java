package org.asteriskjava.config;

/**
 *
 */
public class ConfigParseException extends Exception
{
    private static final long serialVersionUID = 4346366210261425734L;
    private String filename;
    private int lineno;

    public ConfigParseException(String filename, int lineno, String message)
    {
        super(message);
        this.filename = filename;
        this.lineno = lineno;
    }

    public ConfigParseException(String filename, int lineno, String format, Object... params)
    {
        super(String.format(format, params));
        this.filename = filename;
        this.lineno = lineno;
    }

    public String getFileName()
    {
        return filename;
    }

    public int getLineNumber()
    {
        return lineno;
    }
}
