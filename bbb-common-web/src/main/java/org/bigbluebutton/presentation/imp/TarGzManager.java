package org.bigbluebutton.presentation.imp;

import org.apache.commons.compress.archivers.tar.TarArchiveEntry;
import org.apache.commons.compress.archivers.tar.TarArchiveInputStream;
import org.apache.commons.compress.archivers.tar.TarArchiveOutputStream;
import org.apache.commons.compress.compressors.gzip.GzipCompressorOutputStream;
import org.apache.commons.compress.utils.IOUtils;
import com.amazonaws.services.s3.model.S3Object;

import java.io.*;
import java.util.Arrays;
import java.util.Collections;
import java.util.List;
import java.util.zip.GZIPInputStream;

public class TarGzManager {
    private static final List<String> allowedDirs = Collections.unmodifiableList(
            Arrays.asList("thumbnails", "textfiles", "svgs", "pngs")
    );

    public static File compress(String sourceDirectory, String outputFileName, Integer numOfPages) throws IOException {
        File tempTarGzFile = File.createTempFile(outputFileName, ".tar.gz");

        File parentDir = new File(sourceDirectory);
        File[] directories = parentDir.listFiles(File::isDirectory);

        try (FileOutputStream fos = new FileOutputStream(tempTarGzFile);
             GzipCompressorOutputStream gzos = new GzipCompressorOutputStream(fos);
             TarArchiveOutputStream taos = new TarArchiveOutputStream(gzos)) {

            taos.setLongFileMode(TarArchiveOutputStream.LONGFILE_GNU);

            for (File directory : directories) {
                if (allowedDirs.contains(directory.getName())) {
                    addDirectoryToTarGz(taos, directory, "");
                }
            }

            for (int page = 1; page <= numOfPages; page++) {
                File pageFile = new File(sourceDirectory + "/page" + "-" + page + ".pdf");
                if(pageFile.exists()) {
                    addFileToTarGz(taos, pageFile, "");
                }
            }
        }

        return tempTarGzFile;
    }

    public static void decompress(S3Object s3Object, String destinationPath) throws IOException {
        try (GZIPInputStream gzipInputStream = new GZIPInputStream(s3Object.getObjectContent());
             TarArchiveInputStream tarInputStream = new TarArchiveInputStream(gzipInputStream)) {

            TarArchiveEntry tarEntry;
            while ((tarEntry = tarInputStream.getNextTarEntry()) != null) {
                File outputFile = new File(destinationPath, tarEntry.getName());

                if (tarEntry.isDirectory()) {
                    if (!outputFile.exists() && !outputFile.mkdirs()) {
                        throw new IOException("Could not create directory: " + outputFile.getAbsolutePath());
                    }
                } else {
                    File parent = outputFile.getParentFile();
                    if (!parent.exists() && !parent.mkdirs()) {
                        throw new IOException("Could not create directory: " + parent.getAbsolutePath());
                    }

                    try (FileOutputStream fos = new FileOutputStream(outputFile)) {
                        IOUtils.copy(tarInputStream, fos);
                    }
                }
            }
        }
    }

    private static void addDirectoryToTarGz(TarArchiveOutputStream taos, File directory, String base) throws IOException {
        String entryName = base + directory.getName();
        taos.putArchiveEntry(new TarArchiveEntry(directory, entryName));
        taos.closeArchiveEntry();

        File[] files = directory.listFiles();
        if (files != null) {
            for (File file : files) {
                if (file.isDirectory()) {
                    addDirectoryToTarGz(taos, file, entryName + "/");
                } else {
                    addFileToTarGz(taos, file, entryName);
                }
            }
        }
    }

    private static void addFileToTarGz(TarArchiveOutputStream taos, File file, String path) throws IOException {
        try (FileInputStream fis = new FileInputStream(file)) {
            TarArchiveEntry entry = new TarArchiveEntry(file, path + "/" + file.getName());
            taos.putArchiveEntry(entry);
            IOUtils.copy(fis, taos);
            taos.closeArchiveEntry();
        }
    }
}