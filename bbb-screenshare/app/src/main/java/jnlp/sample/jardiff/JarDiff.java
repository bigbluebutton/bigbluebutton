/*
 * Copyright (c) 2006, 2010, Oracle and/or its affiliates. All rights reserved.
 *
 * Redistribution and use in source and binary forms, with or without
 * modification, are permitted provided that the following conditions are met:
 *
 * -Redistribution of source code must retain the above copyright notice, this
 *  list of conditions and the following disclaimer.
 *
 * -Redistribution in binary form must reproduce the above copyright notice,
 *  this list of conditions and the following disclaimer in the documentation
 *  and/or other materials provided with the distribution.
 *
 * Neither the name of Oracle nor the names of contributors may
 * be used to endorse or promote products derived from this software without
 * specific prior written permission.
 *
 * This software is provided "AS IS," without a warranty of any kind. ALL
 * EXPRESS OR IMPLIED CONDITIONS, REPRESENTATIONS AND WARRANTIES, INCLUDING
 * ANY IMPLIED WARRANTY OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE
 * OR NON-INFRINGEMENT, ARE HEREBY EXCLUDED. SUN MICROSYSTEMS, INC. ("SUN")
 * AND ITS LICENSORS SHALL NOT BE LIABLE FOR ANY DAMAGES SUFFERED BY LICENSEE
 * AS A RESULT OF USING, MODIFYING OR DISTRIBUTING THIS SOFTWARE OR ITS
 * DERIVATIVES. IN NO EVENT WILL SUN OR ITS LICENSORS BE LIABLE FOR ANY LOST
 * REVENUE, PROFIT OR DATA, OR FOR DIRECT, INDIRECT, SPECIAL, CONSEQUENTIAL,
 * INCIDENTAL OR PUNITIVE DAMAGES, HOWEVER CAUSED AND REGARDLESS OF THE THEORY
 * OF LIABILITY, ARISING OUT OF THE USE OF OR INABILITY TO USE THIS SOFTWARE,
 * EVEN IF SUN HAS BEEN ADVISED OF THE POSSIBILITY OF SUCH DAMAGES.
 *
 * You acknowledge that this software is not designed, licensed or intended
 * for use in the design, construction, operation or maintenance of any
 * nuclear facility.
 */

package jnlp.sample.jardiff;

import java.io.*;
import java.util.*;
import java.util.jar.*;
import java.util.zip.*;


/**
 * JarDiff is able to create a jar file containing the delta between two
 * jar files (old and new). The delta jar file can then be applied to the
 * old jar file to reconstruct the new jar file.
 * <p>
 * Refer to the JNLP spec for details on how this is done.
 *
 * @version 1.13, 06/26/03
 */
public class JarDiff implements JarDiffConstants {
    private static final int DEFAULT_READ_SIZE = 2048;
    private static byte[] newBytes = new byte[DEFAULT_READ_SIZE];
    private static byte[] oldBytes = new byte[DEFAULT_READ_SIZE];
    private static ResourceBundle _resources = null;

    // The JARDiff.java is the stand-along jardiff.jar tool. Thus, we do not
    // depend on Globals.java and other stuff here. Instead, we use an explicit
    // _debug flag.
    private static boolean _debug;

    public static ResourceBundle getResources() {
        if (_resources == null) {
            _resources = ResourceBundle.getBundle("jnlp/sample/jardiff/resources/strings");
        }
        return _resources;
    }

    /**
     * Creates a patch from the two passed in files, writing the result
     * to <code>os</code>.
     */
    public static void createPatch(String oldPath, String newPath,
                            OutputStream os, boolean minimal) throws IOException{
        JarFile2 oldJar = new JarFile2(oldPath);
        JarFile2 newJar = new JarFile2(newPath);

        try {
          Iterator entries;
          HashMap moved = new HashMap();
          HashSet visited = new HashSet();
          HashSet implicit = new HashSet();
          HashSet moveSrc = new HashSet();
          HashSet newEntries = new HashSet();


          // FIRST PASS
          // Go through the entries in new jar and
          // determine which files are candidates for implicit moves
          // ( files that has the same filename and same content in old.jar
          // and new.jar )
          // and for files that cannot be implicitly moved, we will either
          // find out whether it is moved or new (modified)
          entries = newJar.getJarEntries();
          if (entries != null) {
            while (entries.hasNext()) {
                JarEntry newEntry = (JarEntry)entries.next();
                        String newname = newEntry.getName();

                // Return best match of contents, will return a name match if possible
                String oldname = oldJar.getBestMatch(newJar, newEntry);
                if (oldname == null) {
                    // New or modified entry
                    if (_debug) {
                        System.out.println("NEW: "+ newname);
                    }
                    newEntries.add(newname);
                } else {
                    // Content already exist - need to do a move

                    // Should do implicit move? Yes, if names are the same, and
                    // no move command already exist from oldJar
                    if (oldname.equals(newname) && !moveSrc.contains(oldname)) {
                        if (_debug) {
                            System.out.println(newname + " added to implicit set!");
                        }
                        implicit.add(newname);
                            } else {
                    // The 1.0.1/1.0 JarDiffPatcher cannot handle
                    // multiple MOVE command with same src.
                    // The work around here is if we are going to generate
                    // a MOVE command with duplicate src, we will
                    // instead add the target as a new file.  This way
                    // the jardiff can be applied by 1.0.1/1.0
                    // JarDiffPatcher also.
                        if (!minimal && (implicit.contains(oldname) ||
                            moveSrc.contains(oldname) )) {

                            // generate non-minimal jardiff
                            // for backward compatibility

                            if (_debug) {

                                System.out.println("NEW: "+ newname);
                            }
                            newEntries.add(newname);
                        } else {
                            // Use newname as key, since they are unique
                            if (_debug) {
                                System.err.println("moved.put " + newname + " " + oldname);
                            }
                            moved.put(newname, oldname);
                            moveSrc.add(oldname);
                        }
                        // Check if this disables an implicit 'move <oldname> <oldname>'
                        if (implicit.contains(oldname) && minimal) {

                           if (_debug) {
                              System.err.println("implicit.remove " + oldname);

                              System.err.println("moved.put " + oldname + " " + oldname);

                            }
                            implicit.remove(oldname);
                            moved.put(oldname, oldname);
                            moveSrc.add(oldname);
                        }


                    }
                }
            }
          } //if (entries != null)

          // SECOND PASS: <deleted files> = <oldjarnames> - <implicitmoves> -
          // <source of move commands> - <new or modified entries>
          ArrayList deleted = new ArrayList();
          entries = oldJar.getJarEntries();
          if (entries != null) {
              while (entries.hasNext()) {
                  JarEntry oldEntry = (JarEntry)entries.next();
                  String oldName = oldEntry.getName();
                  if (!implicit.contains(oldName) && !moveSrc.contains(oldName)
                    && !newEntries.contains(oldName)) {
                      if (_debug) {
                          System.err.println("deleted.add " + oldName);
                      }
                      deleted.add(oldName);
                  }
              }
          }

          //DEBUG
          if (_debug) {
              //DEBUG:  print out moved map
              entries = moved.keySet().iterator();
              if (entries != null) {
                  System.out.println("MOVED MAP!!!");
                  while (entries.hasNext()) {
                      String newName = (String)entries.next();
                      String oldName = (String)moved.get(newName);
                      System.out.println("key is " + newName + " value is " + oldName);
                      }
              }

              //DEBUG:  print out IMOVE map
              entries = implicit.iterator();
              if (entries != null) {
                  System.out.println("IMOVE MAP!!!");
                  while (entries.hasNext()) {
                      String newName = (String)entries.next();
                      System.out.println("key is " + newName);
                  }
              }
          }

          JarOutputStream jos = new JarOutputStream(os);

          // Write out all the MOVEs and REMOVEs
          createIndex(jos, deleted, moved);

          // Put in New and Modified entries
          entries = newEntries.iterator();
          if (entries != null) {

              while (entries.hasNext()) {
                  String newName = (String)entries.next();
                  if (_debug) {
                      System.out.println("New File: " + newName);
                  }
                  writeEntry(jos, newJar.getEntryByName(newName), newJar);
              }
          }


          jos.finish();
          jos.close();

        } catch (IOException ioE){
          throw ioE;
        } finally {
          try {
              oldJar.getJarFile().close();
          } catch (IOException e1) {
              //ignore
          }
          try {
              newJar.getJarFile().close();
          } catch (IOException e1) {
            //ignore
          }
        } // finally
    }

    /**
     * Writes the index file out to <code>jos</code>.
     * <code>oldEntries</code> gives the names of the files that were removed,
     * <code>movedMap</code> maps from the new name to the old name.
     */
    private static void createIndex(JarOutputStream jos, List oldEntries,
                             Map movedMap) throws
                       IOException {
        StringWriter writer = new StringWriter();

        writer.write(VERSION_HEADER);
        writer.write("\r\n");

        // Write out entries that have been removed
        for (int counter = 0; counter < oldEntries.size(); counter++) {
            String name = (String)oldEntries.get(counter);

            writer.write(REMOVE_COMMAND);
            writer.write(" ");
            writeEscapedString(writer, name);
            writer.write("\r\n");
        }

        // And those that have moved
        Iterator names = movedMap.keySet().iterator();

        if (names != null) {
            while (names.hasNext()) {
                String newName = (String)names.next();
                String oldName = (String)movedMap.get(newName);

                writer.write(MOVE_COMMAND);
                writer.write(" ");
                writeEscapedString(writer, oldName);
                writer.write(" ");
                writeEscapedString(writer, newName);
                writer.write("\r\n");

            }
        }

        JarEntry je = new JarEntry(INDEX_NAME);
        byte[] bytes = writer.toString().getBytes("UTF-8");

        writer.close();
        jos.putNextEntry(je);
        jos.write(bytes, 0, bytes.length);
    }

    private static void writeEscapedString(Writer writer, String string)
                      throws IOException {
        int index = 0;
        int last = 0;
        char[] chars = null;

        while ((index = string.indexOf(' ', index)) != -1) {
            if (last != index) {
                if (chars == null) {
                    chars = string.toCharArray();
                }
                writer.write(chars, last, index - last);
            }
            last = index;
            index++;
            writer.write('\\');
        }
        if (last != 0) {
            writer.write(chars, last, chars.length - last);
        }
        else {
            // no spaces
            writer.write(string);
        }
    }

    private static void writeEntry(JarOutputStream jos, JarEntry entry,
                            JarFile2 file) throws IOException {
        writeEntry(jos, entry, file.getJarFile().getInputStream(entry));
    }

    private static void writeEntry(JarOutputStream jos, JarEntry entry,
                            InputStream data) throws IOException {
        jos.putNextEntry(entry);

        try {
            // Read the entry
            int size = data.read(newBytes);

            while (size != -1) {
                jos.write(newBytes, 0, size);
                size = data.read(newBytes);
            }
        } catch(IOException ioE) {
            throw ioE;
        } finally {
            try {
                data.close();
            } catch(IOException e){
                //Ignore
            }

        }
    }




    /**
     * JarFile2 wraps a JarFile providing some convenience methods.
     */
    private static class JarFile2 {
        private JarFile _jar;
        private List _entries;
        private HashMap _nameToEntryMap;
        private HashMap _crcToEntryMap;

        public JarFile2(String path) throws IOException {
            _jar = new JarFile(new File(path));
            index();
        }

        public JarFile getJarFile() {
            return _jar;
        }

        public Iterator getJarEntries() {
            return _entries.iterator();
        }

        public JarEntry getEntryByName(String name) {
            return (JarEntry)_nameToEntryMap.get(name);
        }

        /**
         * Returns true if the two InputStreams differ.
         */
        private static boolean differs(InputStream oldIS, InputStream newIS)
            throws IOException {
        int newSize = 0;
        int oldSize;
        int total = 0;
        boolean retVal = false;

        try{
            while (newSize != -1) {
                newSize = newIS.read(newBytes);
                oldSize = oldIS.read(oldBytes);

                if (newSize != oldSize) {
                    if (_debug) {
                        System.out.println("\tread sizes differ: " + newSize +
                            " " + oldSize + " total " + total);
                    }
                    retVal = true;
                    break;
                }
                if (newSize > 0) {
                    while (--newSize >= 0) {
                        total++;
                        if (newBytes[newSize] != oldBytes[newSize]) {
                            if (_debug) {
                                System.out.println("\tbytes differ at " +
                                                    total);
                            }
                            retVal = true;
                            break;
                        }
                        if ( retVal ) {
                            //Jump out
                            break;
                        }
                        newSize = 0;
                    }
                }
            }
        } catch(IOException ioE){
            throw ioE;
        } finally {
            try {
                oldIS.close();
            } catch(IOException e){
                //Ignore
            }
            try {
                newIS.close();
            } catch(IOException e){
                //Ignore
            }
        }
            return retVal;
        }

        public String getBestMatch(JarFile2 file, JarEntry entry) throws IOException {
            // check for same name and same content, return name if found
            if (contains(file, entry)) {
                return (entry.getName());
            }

            // return name of same content file or null
            return (hasSameContent(file,entry));
        }

        public boolean contains(JarFile2 f, JarEntry e) throws IOException {

            JarEntry thisEntry = getEntryByName(e.getName());

            // Look up name in 'this' Jar2File - if not exist return false
            if (thisEntry == null)
                return false;

            // Check CRC - if no match - return false
            if (thisEntry.getCrc() != e.getCrc())
                return false;

            // Check contents - if no match - return false
            InputStream oldIS = getJarFile().getInputStream(thisEntry);
            InputStream newIS = f.getJarFile().getInputStream(e);
            boolean retValue = differs(oldIS, newIS);

            return !retValue;
        }

        public String hasSameContent(JarFile2 file, JarEntry entry) throws
        IOException {

            String thisName = null;

            Long crcL = new Long(entry.getCrc());

            // check if this jar contains files with the passed in entry's crc
            if (_crcToEntryMap.containsKey(crcL)) {
                // get the Linked List with files with the crc
                LinkedList ll = (LinkedList)_crcToEntryMap.get(crcL);
                // go through the list and check for content match
                ListIterator li = ll.listIterator(0);
                if (li != null) {
                    while (li.hasNext()) {
                            JarEntry thisEntry = (JarEntry)li.next();

                            // check for content match
                        InputStream oldIS = getJarFile().getInputStream(thisEntry);
                        InputStream newIS = file.getJarFile().getInputStream(entry);

                        if (!differs(oldIS, newIS)) {
                            thisName = thisEntry.getName();
                            return thisName;
                        }
                    }
                    }
            }

            return thisName;

        }





        private void index() throws IOException {
            Enumeration entries = _jar.entries();

            _nameToEntryMap = new HashMap();
            _crcToEntryMap = new HashMap();

            _entries = new ArrayList();
            if (_debug) {
                System.out.println("indexing: " + _jar.getName());
            }
            if (entries != null) {
                while (entries.hasMoreElements()) {
                    JarEntry entry = (JarEntry)entries.nextElement();

                    long crc = entry.getCrc();

                    Long crcL = new Long(crc);

                    if (_debug) {
                        System.out.println("\t" + entry.getName() + " CRC " +
                                      crc);
                    }

                    _nameToEntryMap.put(entry.getName(), entry);
                    _entries.add(entry);

                    // generate the CRC to entries map
                    if (_crcToEntryMap.containsKey(crcL)) {
                        // key exist, add the entry to the correcponding
                        // linked list

                        // get the linked list
                        LinkedList ll = (LinkedList)_crcToEntryMap.get(crcL);

                        // put in the new entry
                        ll.add(entry);

                        // put it back in the hash map
                        _crcToEntryMap.put(crcL, ll);
                    } else {
                        // create a new entry in the hashmap for the new key

                        // first create the linked list and put in the new
                        // entry
                        LinkedList ll = new LinkedList();
                        ll.add(entry);

                        // create the new entry in the hashmap
                        _crcToEntryMap.put(crcL, ll);
                    }

                }
            }
        }

    }


    private static void showHelp() {
        System.out.println("JarDiff: [-nonminimal (for backward compatibility with 1.0.1/1.0] [-creatediff | -applydiff] [-output file] old.jar new.jar");
    }

    // -creatediff -applydiff -debug -output file
    public static void main(String[] args) throws IOException {
        boolean diff = true;
        boolean minimal = true;
        String outputFile = "out.jardiff";

        for (int counter = 0; counter < args.length; counter++) {
            // for backward compatibilty with 1.0.1/1.0
            if (args[counter].equals("-nonminimal") ||
                args[counter].equals("-n")) {
                minimal = false;
            }
            else if (args[counter].equals("-creatediff") ||
                args[counter].equals("-c")) {
                diff = true;
            }
            else if (args[counter].equals("-applydiff") ||
                args[counter].equals("-a")) {
                diff = false;
            }
            else if (args[counter].equals("-debug") ||
                args[counter].equals("-d")) {
                _debug = true;
            }
            else if (args[counter].equals("-output") ||
                     args[counter].equals("-o")) {
                if (++counter < args.length) {
                    outputFile = args[counter];
                }
            }
            else if (args[counter].equals("-applydiff") ||
                args[counter].equals("-a")) {
                diff = false;
            }
            else {
                if ((counter + 2) != args.length) {
                    showHelp();
                    System.exit(0);
                }
                if (diff) {
                    try {
                        OutputStream os = new FileOutputStream(outputFile);

                        JarDiff.createPatch(args[counter],
                                              args[counter + 1], os, minimal);
                        os.close();
                    } catch (IOException ioe) {
                        try {
                            System.out.println(getResources().getString("jardiff.error.create") + " " + ioe);
                        } catch (MissingResourceException mre) {
                        }
                    }
                }
                else {
                    try {
                        OutputStream os = new FileOutputStream(outputFile);

                        new JarDiffPatcher().applyPatch(
                            null,
                            args[counter],
                            args[counter + 1],
                            os);
                        os.close();
                    } catch (IOException ioe) {
                        try {
                            System.out.println(getResources().getString("jardiff.error.apply") + " " + ioe);
                        } catch (MissingResourceException mre) {
                        }
                    }
                }
                System.exit(0);
            }
        }
        showHelp();
    }
}
