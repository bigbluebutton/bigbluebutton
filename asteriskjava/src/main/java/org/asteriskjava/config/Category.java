package org.asteriskjava.config;

import java.util.List;
import java.util.Iterator;
import java.util.ArrayList;

/**
 *
 */
public class Category extends ConfigElement
{
    private String name;
    private boolean template;
    private final List<Category> baseCategories = new ArrayList<Category>();
    private final List<ConfigElement> elements = new ArrayList<ConfigElement>();

    /**
     * The last object in the list will get assigned any trailing comments when EOF is hit.
     */
    //private String trailingComment;

    public Category(String name)
    {
        if (name == null)
        {
            throw new IllegalArgumentException("Name must not be null");
        }
        this.name = name;
    }

    public Category(String filename, int lineno, String name)
    {
        super(filename, lineno);
        this.name = name;
    }

    /**
     * Returns the name of this category.
     *
     * @return the name of this category.
     */
    public String getName()
    {
        return name;
    }

    /**
     * Checks if this category is a template.
     *
     * @return <code>true</code> if this category is a template, <code>false</code> otherwise.
     */
    public boolean isTemplate()
    {
        return template;
    }

    void markAsTemplate()
    {
        template = true;
    }

    /**
     * Returns a list of categories this category inherits from.
     *
     * @return a list of categories this category inherits from, never <code>null</code>.
     */
    public List<Category> getBaseCategories()
    {
        return baseCategories;
    }

    void addBaseCategory(Category baseCategory)
    {
        baseCategories.add(baseCategory);
    }

    public List<ConfigElement> getElements()
    {
        return elements;
    }

    public void addElement(ConfigElement element)
    {
        if (element instanceof Category)
        {
            throw new IllegalArgumentException("Nested categories are not allowed");
        }

        elements.add(element);
    }

    public String format()
    {
        StringBuilder sb = new StringBuilder();

        format(sb);
        for (ConfigElement e : elements)
        {
            sb.append("\n");
            e.format(sb);
        }
        return sb.toString();
    }

    @Override
    protected StringBuilder rawFormat(StringBuilder sb)
    {
        sb.append("[").append(name).append("]");
        if (isTemplate() || !getBaseCategories().isEmpty())
        {
            sb.append("(");
            if (isTemplate())
            {
                sb.append("!");
                if (!getBaseCategories().isEmpty())
                {
                    sb.append(",");
                }
            }
            Iterator<Category> inheritsFromIterator = getBaseCategories().iterator();
            while (inheritsFromIterator.hasNext())
            {
                sb.append(inheritsFromIterator.next().getName());
                if (inheritsFromIterator.hasNext())
                {
                    sb.append(",");
                }
            }
            sb.append(")");
        }

        return sb;
    }
    
    @Override
    public String toString()
    {
        return name;
    }
}
