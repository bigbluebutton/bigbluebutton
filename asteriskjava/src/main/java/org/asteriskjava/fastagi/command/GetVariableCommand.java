/*
 *  Copyright 2004-2006 Stefan Reuter
 *
 *  Licensed under the Apache License, Version 2.0 (the "License");
 *  you may not use this file except in compliance with the License.
 *  You may obtain a copy of the License at
 *
 *      http://www.apache.org/licenses/LICENSE-2.0
 *
 *  Unless required by applicable law or agreed to in writing, software
 *  distributed under the License is distributed on an "AS IS" BASIS,
 *  WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 *  See the License for the specific language governing permissions and
 *  limitations under the License.
 *
 */
package org.asteriskjava.fastagi.command;

/**
 * Returns the value of the given channel varible.<p>
 * Since Asterisk 1.2 you can also use this command to use custom Asterisk
 * functions. Syntax is "func(args)".<p>
 * Returns 0 if the variable is not set. Returns 1 if the variable is set and
 * returns the variable in parenthesis.<p>
 * Example return code: 200 result=1 (testvariable)
 * 
 * @author srt
 * @version $Id: GetVariableCommand.java 938 2007-12-31 03:23:38Z srt $
 */
public class GetVariableCommand extends AbstractAgiCommand
{
    /**
     * Serial version identifier.
     */
    private static final long serialVersionUID = 3256719598056387384L;

    /**
     * The name of the variable to retrieve.
     */
    private String variable;

    /**
     * Creates a new GetVariableCommand.
     * 
     * @param variable the name of the variable to retrieve.
     */
    public GetVariableCommand(String variable)
    {
        super();
        this.variable = variable;
    }

    /**
     * Returns the name of the variable to retrieve.
     * 
     * @return the the name of the variable to retrieve.
     */
    public String getVariable()
    {
        return variable;
    }

    /**
     * Sets the name of the variable to retrieve.<p>
     * Since Asterisk 1.2 you can also use custom dialplan functions (like
     * "func(args)") as variable.
     * 
     * @param variable the name of the variable to retrieve.
     */
    public void setVariable(String variable)
    {
        this.variable = variable;
    }

    @Override
   public String buildCommand()
    {
        return "GET VARIABLE " + escapeAndQuote(variable);
    }
}
