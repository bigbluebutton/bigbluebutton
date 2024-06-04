package org.bigbluebutton.app;

import org.bigbluebutton.handler.EventsHandler;
import org.bigbluebutton.handler.GenerationHandler;
import org.bigbluebutton.handler.RecordingExportHandler;
import org.bigbluebutton.handler.RecordingImportHandler;

import java.io.Console;
import java.io.File;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.stream.IntStream;

public class RecordingApp {

    public static void main(String[] args) {
        if (args.length > 0) {
            commandMode(args);
        } else {
            interactiveMode();
        }
    }

    private static void commandMode(String[] args) {
        int i = 0, j;
        String arg;
        char flag;
        boolean importExport = true;
        String numRecordings = null;
        boolean export = false;
        boolean persist = false;
        boolean recording = true;
        String id = null;
        String path;

        while (i < args.length && args[i].startsWith("-")) {
            arg = args[i++];

            if (arg.equals("--help")) {
                printUsage();
                return;
            }

            for (j = 1; j < arg.length(); j++) {
                flag = arg.charAt(j);

                switch (flag) {
                case 'e':
                    export = true;
                    break;
                case 'i':
                    export = false;
                    if (i < args.length) {
                        String shouldPersist = args[i++];
                        if (shouldPersist.equalsIgnoreCase("true"))
                            persist = true;
                        else if (shouldPersist.equalsIgnoreCase("false"))
                            persist = false;
                        else {
                            System.out.println("Error: Could not parse persist argument");
                            return;
                        }
                    } else {
                        System.out.println("Error: Imports require an argument specifying if they should be persisted");
                        return;
                    }
                    break;
                case 'g':
                    importExport = false;
                    if (i < args.length)
                        numRecordings = args[i++];
                    else {
                        System.out.println(
                                "Error: To generate recordings you must provide the number of recordings to generate");
                    }
                    break;
                case 'r':
                case 'v':
                    if (flag == 'v')
                        recording = false;
                    break;
                case 's':
                    if (i < args.length)
                        id = args[i++];
                    else {
                        System.out.println(
                                "Error: To import/export a single recording or events you must provide the recording ID");
                    }
                    break;
                default:
                    System.out.println("Error: Illegal option " + flag);
                }
            }
        }

        if (!importExport) {
            int numberOfRecordings = 0;
            try {
                if (numRecordings != null)
                    numberOfRecordings = Integer.parseInt(numRecordings);
            } catch (NumberFormatException e) {
                System.out.println("Error: Could not parse the number of recordings to generate");
                return;
            }

            GenerationHandler handler = GenerationHandler.getInstance();
            if (handler == null)
                return;
            handler.generateRecordings(numberOfRecordings);
            return;
        }

        if (i < args.length)
            path = args[i];
        else {
            path = createDefaultDirectory(recording);
            if (path == null)
                return;
        }

        executeCommands(export, persist, recording, id, path);
    }

    private static void printUsage() {
        System.out.println("********** Import/Export Mode **********");
        System.out.println("Usage: {-e|-i <persist>} {-r|-v} [-s <id>] [PATH]");
        System.out.println("Import/export recording(s)/event(s) to/from PATH.");
        System.out.println("The default values for PATH are");
        System.out.println("    /var/bigbluebutton/published/presentation for recordings");
        System.out.println("    /var/bigbluebutton/events for events");
        System.out.println("-e                  export recording(s)/event(s_");
        System.out.println(
                "-i <persist>        import recording(s)/event(s) and indicate if they should be persisted [true|false]");
        System.out.println("{-r|-v}            Indicated whether you wish to import/export recordings or events");
        System.out.println("-s <id>             ID of a single recording/event to be imported/exported");
        System.out.println("********** Generation Mode **********");
        System.out.println("Usage: -g [NUMBER]");
        System.out.println("Generate a specified NUMBER of recording metadata");
    }

    private static String createDefaultDirectory(boolean recording) {
        Path root = Paths.get(System.getProperty("user.dir")).getFileSystem().getRootDirectories().iterator().next();
        String recordings = root.toAbsolutePath() + "var/bigbluebutton/published/presentation";
        String events = root.toAbsolutePath() + "var/bigbluebutton/events";

        String path = recordings;
        String target = "presentation";

        if (!recording) {
            path = events;
            target = "events";
        }

        File directory = new File(path);
        if (!directory.exists()) {
            boolean created = directory.mkdirs();
            if (!created) {
                System.out.println("Error: Failed to create default " + target + " directory");
                return null;
            }
        }

        return path;
    }

    private static void executeCommands(boolean export, boolean persist, boolean recording, String id, String path) {
        if (!export) {
            if (recording) {
                RecordingImportHandler handler = RecordingImportHandler.getInstance();
                if (handler == null)
                    return;
                if (id == null || id.isEmpty())
                    handler.importRecordings(path, persist);
                else
                    handler.importRecording(path, id, persist);
            } else {
                EventsHandler handler = EventsHandler.getInstance();
                if (handler == null)
                    return;
                if (id == null || id.isEmpty())
                    handler.importEvents(path, persist);
                else
                    handler.importEvents(path, id, persist);
            }
        } else {
            if (recording) {
                RecordingExportHandler handler = RecordingExportHandler.getInstance();
                if (handler == null)
                    return;
                if (id == null || id.isEmpty())
                    handler.exportRecordings(path);
                else
                    handler.exportRecording(id, path);
            } else {
                EventsHandler handler = EventsHandler.getInstance();
                if (handler == null)
                    return;
                if (id == null || id.isEmpty())
                    handler.exportEvents(path);
                else
                    handler.exportEvents(id, path);
            }
        }
    }

    private static void interactiveMode() {
        System.out.println("Use this application to import and export recording metadata");

        do {
            int generation = getResponse("Are you generating recordings? (1-Yes 2-No) ", new int[] { 1, 2 },
                    "Please enter either 1 or 2");

            if (generation == 1) {
                generationMode();
                continue;
            }

            int impex = getResponse("Are you importing or exporting recordings/events? (1-Import 2-Export 3-Quit) ",
                    new int[] { 1, 2, 3 }, "Please enter either 1, 2, or 3");

            int recordingsOrEvents = 1;
            if (impex == 1 || impex == 2) {
                recordingsOrEvents = getResponse("Are you working with recordings or events? (1-Recordings 2-Events) ",
                        new int[] { 1, 2 }, "Please enter either 1 or 2");
            }

            boolean recordings = recordingsOrEvents != 2;

            if (impex == 1) {
                importMode(recordings);
            } else if (impex == 2) {
                exportMode(recordings);
            } else {
                break;
            }
        } while (true);
    }

    private static void importMode(boolean recordings) {
        if (recordings) {
            RecordingImportHandler handler = RecordingImportHandler.getInstance();
            if (handler == null)
                return;
            int importIndividually = getResponse("Are you importing recordings individually? (1-Yes 2-No) ",
                    new int[] { 1, 2 }, "Please enter either 1 or 2");
            int persist = getResponse("Should the imported recording(s) be persisted? (1-Yes 2-No) ",
                    new int[] { 1, 2 }, "Please enter either 1 or 2");
            boolean shouldPersist = persist == 1;

            if (importIndividually == 1) {
                do {
                    String path = getResponse(
                            "Please enter the path to the recording metadata.xml file (enter q to quit): ");

                    if (path.equalsIgnoreCase("q") || path.equalsIgnoreCase("quit"))
                        break;

                    String recordingId = getResponse("Please enter the ID of the recording: ");
                    handler.importRecording(path, recordingId, shouldPersist);
                } while (true);
            } else {
                String path = getResponse("Please enter the path to the directory containing the metadata.xml files: ");
                handler.importRecordings(path, shouldPersist);
            }
        } else {
            EventsHandler handler = EventsHandler.getInstance();
            if (handler == null)
                return;
            int importIndividually = getResponse("Are you importing events individually? (1-Yes 2-No) ",
                    new int[] { 1, 2 }, "Please enter either 1 or 2");
            int persist = getResponse("Should the imported event(s) be persisted? (1-Yes 2-No) ", new int[] { 1, 2 },
                    "Please enter either 1 or 2");
            boolean shouldPersist = persist == 1;

            if (importIndividually == 1) {
                do {
                    String path = getResponse(
                            "Please enter the path to the recording data.json file (enter q to quit): ");

                    if (path.equalsIgnoreCase("q") || path.equalsIgnoreCase("quit"))
                        break;

                    String recordingId = getResponse("Please enter the ID of the recording: ");
                    handler.importEvents(path, recordingId, shouldPersist);
                } while (true);
            } else {
                String path = getResponse("Please enter the path to the directory containing the data.json files: ");
                handler.importEvents(path, shouldPersist);
            }
        }
    }

    private static void exportMode(boolean recordings) {
        if (recordings) {
            RecordingExportHandler handler = RecordingExportHandler.getInstance();
            if (handler == null)
                return;

            int exportAll = getResponse("Do you want to export all recordings? (1-Yes 2-No) ", new int[] { 1, 2 },
                    "Please enter either 1 or 2");
            String path = getResponse(
                    "Please enter the path to the directory that the recordings should be exported to: ");

            if (exportAll == 1) {
                handler.exportRecordings(path);
            } else {
                do {
                    String response = getResponse(
                            "Please enter the ID of the recording you would like to export (enter q to quit): ");
                    if (response.equalsIgnoreCase("q") || response.equalsIgnoreCase("quit"))
                        break;
                    handler.exportRecording(response, path);
                } while (true);
            }
        } else {
            EventsHandler handler = EventsHandler.getInstance();
            if (handler == null)
                return;
            int exportAll = getResponse("Do you want to export all events? (1-Yes 2-No) ", new int[] { 1, 2 },
                    "Please enter either 1 or 2");
            String path = getResponse("Please enter the path to the directory that the events should be exported to: ");

            if (exportAll == 1) {
                handler.exportEvents(path);
            } else {
                do {
                    String response = getResponse(
                            "Please enter the ID of the recording for the events you would like to export (enter q to quit): ");
                    if (response.equalsIgnoreCase("q") || response.equalsIgnoreCase("quit"))
                        break;
                    handler.exportEvents(response, path);
                } while (true);
            }
        }
    }

    private static void generationMode() {
        int numRecordings = -1;
        do {
            String response = getResponse("How many recordings would you like to generate? ");
            try {
                numRecordings = Integer.parseInt(response);
            } catch (NumberFormatException e) {
                System.out.println("You must enter a positive number");
            }
        } while (numRecordings < 1);

        GenerationHandler handler = GenerationHandler.getInstance();
        if (handler == null)
            return;
        handler.generateRecordings(numRecordings);
    }

    private static int getResponse(String prompt, int[] options, String error) {
        Console console = System.console();
        String response;
        int result;
        do {
            response = console.readLine(prompt);
            result = parseResponse(response, error);
        } while (!contains(options, result));

        return result;
    }

    private static String getResponse(String prompt) {
        Console console = System.console();
        String response;
        do {
            response = console.readLine(prompt);
        } while (response.equals(""));

        return response;
    }

    private static int parseResponse(String response, String error) {
        try {
            return Integer.parseInt(response);
        } catch (NumberFormatException e) {
            System.out.println(error);
        }

        return -1;
    }

    private static boolean contains(final int[] array, final int key) {
        return IntStream.of(array).anyMatch(x -> x == key);
    }
}
