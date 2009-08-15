package org.asteriskjava.config;

public abstract class ConfigElement
{
    /**
     * Name of the file the category was read from.
     */
    private String filename;

    /**
     * Line number.
     */
    private int lineno;
    private String preComment;
    private String samelineComment;

    protected ConfigElement()
    {
    }

    protected ConfigElement(String filename, int lineno)
    {
        this.filename = filename;
        this.lineno = lineno;
    }

    public String getFileName()
    {
        return filename;
    }

    public void setFileName(String filename)
    {
        this.filename = filename;
    }

    public int getLineNumber()
    {
        return lineno;
    }

    void setLineNumber(int lineno)
    {
        this.lineno = lineno;
    }

    public String getPreComment()
    {
        return preComment;
    }

    public void setPreComment(String preComment)
    {
        this.preComment = preComment;
    }

    public String getComment()
    {
        return samelineComment;
    }

    public void setComment(String samelineComment)
    {
        this.samelineComment = samelineComment;
    }

    protected StringBuilder format(StringBuilder sb)
    {
        if (preComment != null && preComment.length() != 0)
        {
            sb.append(preComment);
        }

        rawFormat(sb);

        if (samelineComment != null && samelineComment.length() != 0)
        {
            sb.append(" ; ").append(samelineComment);
        }

        return sb;
    }

    protected abstract StringBuilder rawFormat(StringBuilder sb);
}
