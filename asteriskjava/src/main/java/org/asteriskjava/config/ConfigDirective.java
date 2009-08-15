package org.asteriskjava.config;

public abstract class ConfigDirective extends ConfigElement
{
    protected ConfigDirective()
    {
    }

    protected ConfigDirective(String filename, int lineno)
    {
        super(filename, lineno);
    }
}
