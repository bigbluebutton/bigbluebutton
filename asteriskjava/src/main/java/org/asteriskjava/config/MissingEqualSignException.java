package org.asteriskjava.config;

/**
 * The equal sign on a variable assignment line is missing.<p>
 * A variable line must include an equal sign.
 */
public class MissingEqualSignException extends ConfigParseException
{
    private static final long serialVersionUID = 2694490330074765342L;
    public MissingEqualSignException(String filename, int lineno, String format, Object... params)
    {
        super(filename, lineno, format, params);
    }
}