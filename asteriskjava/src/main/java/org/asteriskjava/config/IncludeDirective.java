package org.asteriskjava.config;

public class IncludeDirective extends ConfigDirective
{
    /**
     * file name included.
     */
    private final String includeFile;

    public IncludeDirective(String includeFile)
    {
        super();
        this.includeFile = includeFile;
    }

    public IncludeDirective(String filename, int lineno, String includeFile)
    {
        super(filename, lineno);
        this.includeFile = includeFile;
    }

    public String getIncludeFile()
    {
        return includeFile;
    }

    @Override
    protected StringBuilder rawFormat(StringBuilder sb)
    {
        sb.append("#include \"").append(includeFile).append("\"");
        return sb;
    }
}