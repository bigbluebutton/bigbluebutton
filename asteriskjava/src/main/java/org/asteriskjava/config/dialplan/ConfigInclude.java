package org.asteriskjava.config.dialplan;

import org.asteriskjava.config.ConfigElement;

public class ConfigInclude extends ConfigElement
{
    String category;
    
    public ConfigInclude(String filename, int lineno, String category)
    {
        super(filename, lineno);
        this.category = category;
    }
    
    @Override
    protected StringBuilder rawFormat(StringBuilder sb)
    {
        return sb.append(toString());
    }
    
    @Override
    public String toString()
    {
        return "include => " + category;
    }

    public String getName()
    {
        return category;
    }

}
