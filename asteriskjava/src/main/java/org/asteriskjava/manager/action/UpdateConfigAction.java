/*
 *  Copyright 2004-2007 Stefan Reuter and others
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
package org.asteriskjava.manager.action;

import java.util.Map;
import java.util.HashMap;

/**
 * The UpdateConfigAction sends an UpdateConfig command to the asterisk server.
 * Please take note that unlike the manager documentation, this command does not
 * dump back the config file upon success -- it only tells you it succeeded. You
 * should use the handy addCommand method this class provides for specifying
 * what actions you would like to take on the configuration file. It will
 * generate appropriate sequence numbers for the command. You may use the static
 * ACTION_* fields provided by this action to specify what action you would like
 * to take, while avoiding handling the strings required. Plain fields:
 * SrcFilename: Configuration filename to read(e.g. foo.conf) DstFilename:
 * Configuration filename to write(e.g. foo.conf) Reload: Whether or not a
 * reload should take place (or name of specific module) Repeatable fields:
 * Action-XXXXXX: Action to Take (NewCat,RenameCat,DelCat,Update,Delete,Append)
 * Cat-XXXXXX: Category to operate on Var-XXXXXX: Variable to work on
 * Value-XXXXXX: Value to work on Match-XXXXXX: Extra match required to match
 * line
 * 
 * @see org.asteriskjava.manager.response.GetConfigResponse
 * @see org.asteriskjava.manager.action.UpdateConfigAction#addCommand
 * @author martins
 * @since 0.3
 */
public class UpdateConfigAction extends AbstractManagerAction
{
    /**
     * Serializable version identifier.
     */
    static final long serialVersionUID = 4753117770471622025L;

    private static final String RELOAD_STRING_YES = "Yes";
    private static final String RELOAD_STRING_NO = "No";

    /* Actions accepted by commands in the sequence */
    public static final String ACTION_NEWCAT = "NewCat";
    public static final String ACTION_RENAMECAT = "RenameCat";
    public static final String ACTION_DELCAT = "DelCat";
    public static final String ACTION_UPDATE = "Update";
    public static final String ACTION_DELETE = "Delete";
    public static final String ACTION_APPEND = "Append";
    
    protected String srcFilename;
    protected String dstFilename;
    protected String reload;

    protected int actionCounter;
    protected Map<String, String> actions;

    /**
     * Creates a new UpdateConfigAction.
     */
    public UpdateConfigAction()
    {
        this.actionCounter = 0;
        actions = new HashMap<String, String>();
    }

    /**
     * Creates a new UpdateConfigAction with the given parameters.
     * 
     * @param srcFilename the name of the file to get.
     */
    public UpdateConfigAction(String srcFilename, String dstFilename, boolean reload)
    {
        this.actionCounter = 0;
        this.srcFilename = srcFilename;
        this.dstFilename = dstFilename;
        setReload(reload);
        actions = new HashMap<String, String>();
    }

    /**
     * Adds a command to update a config file while sparing you the details of
     * the Manager's required syntax. If you want to omit one of the command's
     * sections, provide a null value to this method. The command index will be
     * incremented even if you supply a null for all parameters, though the map
     * will be unaffected.
     * 
     * @param action Action to Take
     *            (NewCat,RenameCat,DelCat,Update,Delete,Append), see static
     *            fields
     * @param cat Category to operate on
     * @param var Variable to work on
     * @param value Value to work on
     * @param match Extra match required to match line
     */
    public void addCommand(String action, String cat, String var, String value, String match)
    {
        // for convienence of reference, shorter!
        final String stringCounter = String.format("%06d", this.actionCounter);

        if (action != null)
        {
            actions.put("Action-" + stringCounter, action);
        }

        if (cat != null)
        {
            actions.put("Cat-" + stringCounter, cat);
        }

        if (var != null)
        {
            actions.put("Var-" + stringCounter, var);
        }

        if (value != null)
        {
            actions.put("Value-" + stringCounter, value);
        }

        if (match != null)
        {
            actions.put("Match-" + stringCounter, match);
        }

        this.actionCounter++;
    }

    /**
     * Returns the name of this action, i.e. "UpdateConfig".
     */
    @Override
   public String getAction()
    {
        return "UpdateConfig";
    }

    /**
     * Returns the source filename.
     */
    public String getSrcFilename()
    {
        return srcFilename;
    }

    /**
     * Sets the source filename.
     */
    public void setSrcFilename(String filename)
    {
        this.srcFilename = filename;
    }

    /**
     * Returns the destination filename.
     */
    public String getDstFilename()
    {
        return dstFilename;
    }

    /**
     * Sets the source filename.
     */
    public void setDstFilename(String filename)
    {
        this.dstFilename = filename;
    }

    /**
     * @return should Asterisk reload, or the name of a specific module to
     *         reload
     */
    public String getReload()
    {
        return reload;
    }

    /**
     * Sets the reload behavior of this action, or sets a specific module to be
     * reloaded
     * 
     * @param reload the reload parameter to set
     * @see org.asteriskjava.manager.action.UpdateConfigAction#setReload(boolean)
     */
    public void setReload(String reload)
    {
        this.reload = reload;
    }

    /**
     * Sets the reload behavior of this action. If you don't know what string to
     * feed Asterisk, this method will provide the appropriate one.
     * 
     * @param reload the reload parameter to set
     * @see org.asteriskjava.manager.action.UpdateConfigAction#setReload(String)
     */
    public void setReload(boolean reload)
    {
        this.reload = reload ? UpdateConfigAction.RELOAD_STRING_YES : UpdateConfigAction.RELOAD_STRING_NO;
    }

    /**
     * Returns Map of the action's desired operations where Map keys contain:
     * action,cat,var,value,match pairs followed by -XXXXXX, and the Map values
     * contain the values for those keys. This method will typically only be
     * used by the ActionBuilder to generate the actual strings to be sent to
     * the manager interface.
     * 
     * @see org.asteriskjava.manager.action.UpdateConfigAction#addCommand
     * @return a Map of the actions that should be taken
     */
    public Map<String, String> getAttributes()
    {
        return actions;
    }

    /**
     * You may use this field to directly, programmatically add your own Map of
     * key,value pairs that you would like to send for this command. Setting
     * your own map will reset the command index to the number of keys in the
     * Map
     * 
     * @see org.asteriskjava.manager.action.UpdateConfigAction#addCommand
     * @param actions the actions to set
     */
    public void setAttributes(Map<String, String> actions)
    {
        this.actions = actions;
        this.actionCounter = actions.keySet().size();
    }

}
