package org.asteriskjava.config;

public class ExecDirective extends ConfigDirective
{
    /**
     * file name of the executable.
     */
    private final String execFile;

    public ExecDirective(String execFile)
    {
        super();
        this.execFile = execFile;
    }

    public ExecDirective(String filename, int lineno, String execFile)
    {
        super(filename, lineno);
        this.execFile = execFile;
    }

    public String getExecFile()
    {
        return execFile;
    }

    @Override
    protected StringBuilder rawFormat(StringBuilder sb)
    {
        sb.append("#exec \"").append(execFile).append("\"");
        return sb;
    }
}