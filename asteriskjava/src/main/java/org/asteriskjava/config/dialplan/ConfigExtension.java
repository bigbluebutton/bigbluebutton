package org.asteriskjava.config.dialplan;

import java.util.Arrays;

import org.asteriskjava.config.ConfigElement;

/**
 * Represents the dial plan extension as a specific kind of configuration
 * directive This class makes no interpretation of syntax checking of names,
 * priorities, or application (for now).
 * 
 * @author martins
 */
public class ConfigExtension extends ConfigElement
{
    String name, priority;
    
    /**
     * Holds the application in the first element, and arguments in all subsequent elements. Similar to command line arguments array. 
     */
    String [] application;
    
    public ConfigExtension(String filename, int lineno, String name, String priority, String [] application)
    {
        super(filename,lineno);
        this.name = name;
        this.priority = priority;
        this.application = application;
    }

    @Override
    protected StringBuilder rawFormat(StringBuilder sb)
    {
        return sb.append(toString());
    }
    
    @Override
    public String toString()
    {
        return "exten => " + name + "," + priority + "," + Arrays.asList(application);   
    }

    public String getName()
    {
        return name;
    }

    public String getPriority()
    {
        return priority;
    }

    public String[] getApplication()
    {
        return application;
    }

}
