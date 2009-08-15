package org.asteriskjava.config;

/**
 *
 */
public class ConfigVariable extends ConfigElement
{
    private String name;
    private String value;

    public ConfigVariable(String name, String value)
    {
        setName(name);
        setValue(value);
    }

    public ConfigVariable(String filename, int lineno, String name, String value)
    {
        super(filename, lineno);
        setName(name);
        setValue(value);
    }

    public String getName()
    {
        return name;
    }

    public void setName(String name)
    {
        if (name == null)
        {
            throw new IllegalArgumentException("Variable name must not be null");
        }
        this.name = name;
    }

    public String getValue()
    {
        return value;
    }

    public void setValue(String value)
    {
        this.value = value;
    }

    @Override
    protected StringBuilder rawFormat(StringBuilder sb)
    {
        sb.append(name).append(" = ");
        if (value != null)
        {
            sb.append(value);
        }
        return sb;
    }
    
    @Override
    public String toString()
    {
        return name+"="+value;
    }
}
