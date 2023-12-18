package org.bigbluebutton;

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
        boolean export = false;
        boolean persist = false;
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
                case 's':
                    if (i < args.length)
                        id = args[i++];
                    else {
                        System.out.println(
                                "Error: To import/export a single recording you must provide the recording ID");
                    }
                    break;
                default:
                    System.out.println("Error: Illegal option " + flag);
                }
            }
        }

        if (i < args.length)
            path = args[i];
        else {
            path = createDefaultDirectory();
            if (path == null)
                return;
        }

        executeCommands(export, persist, id, path);
    }

    private static void printUsage() {
        System.out.println("Usage: {-e|-i <persist>} [-s <id>] [PATH]");
        System.out.println("Import/export recording(s) to/from PATH. The default PATH is "
                + "\n/var/bigbluebutton/published/presentation");
        System.out.println("-e                  export recording(s)");
        System.out.println(
                "-i <persist>        import recording(s) and indicate if they should be persisted [true|false]");
        System.out.println("-s <id>             ID of single recording to be imported/exported");
    }

    private static String createDefaultDirectory() {
        Path root = Paths.get(System.getProperty("user.dir")).getFileSystem().getRootDirectories().iterator().next();
        String path = root.toAbsolutePath() + "var/bigbluebutton/published/presentation";

        File directory = new File(path);
        if (!directory.exists()) {
            boolean created = directory.mkdirs();
            if (!created) {
                System.out.println("Error: Failed to create default presentation directory");
                return null;
            }
        }

        return path;
    }

    private static void executeCommands(boolean export, boolean persist, String id, String path) {
        if (!export) {
            RecordingImportHandler handler = RecordingImportHandler.getInstance();
            if (id == null || id.isEmpty())
                handler.importRecordings(path, persist);
            else
                handler.importRecording(path, id, persist);
        } else {
            RecordingExportHandler handler = RecordingExportHandler.getInstance();
            if (id == null || id.isEmpty())
                handler.exportRecordings(path);
            else
                handler.exportRecording(id, path);
        }
    }

    private static void interactiveMode() {
        System.out.println("Use this application to import and export recording metadata");

        do {
            int impex = getResponse("Are you importing or exporting recordings? (1-Import 2-Export 3-Quit) ",
                    new int[] { 1, 2, 3 }, "Please enter either 1, 2, or 3");

            if (impex == 1) {
                importRecordings();
            } else if (impex == 2) {
                exportRecordings();
            } else {
                break;
            }
        } while (true);
    }

    private static void importRecordings() {
        RecordingImportHandler handler = RecordingImportHandler.getInstance();
        int importIndividually = getResponse("Are you importing recordings individually? (1-Yes 2-No) ",
                new int[] { 1, 2 }, "Please enter either 1 or 2");
        int persist = getResponse("Should the imported recording(s) be persisted? (1-Yes 2-No) ", new int[] { 1, 2 },
                "Please enter either 1 or 2");
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
    }

    private static void exportRecordings() {
        RecordingExportHandler handler = RecordingExportHandler.getInstance();
        int exportAll = getResponse("Do you want to export all recordings? (1-Yes 2-No) ", new int[] { 1, 2 },
                "Please enter either 1 or 2");
        String path = getResponse("Please enter the path to the directory that the recordings should be exported to: ");

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
        String response = "";
        do {
            response = console.readLine(prompt);
        } while (response == "");

        return response;
    }

    private static int parseResponse(String response, String error) {
        try {
            int parsedResponse = Integer.parseInt(response);
            return parsedResponse;
        } catch (NumberFormatException e) {
            System.out.println(error);
        }

        return -1;
    }

    private static boolean contains(final int[] array, final int key) {
        return IntStream.of(array).anyMatch(x -> x == key);
    }
}