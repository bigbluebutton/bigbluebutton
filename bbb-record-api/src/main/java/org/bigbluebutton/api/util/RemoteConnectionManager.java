package org.bigbluebutton.api.util;

import com.jcraft.jsch.ChannelSftp;
import com.jcraft.jsch.JSch;
import com.jcraft.jsch.JSchException;
import com.jcraft.jsch.Session;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import java.io.BufferedReader;
import java.io.InputStream;
import java.io.InputStreamReader;
import java.util.Properties;
import java.util.Scanner;
import java.util.Vector;
import java.util.stream.Collectors;

public class RemoteConnectionManager {

    public static final String USERNAME = "root";
    public static final String HOST = "demo1.bigbluebutton.org";
    public static final String PRIVATE_KEY_PATH = "";
    public static final int PORT = 22;

    private static final Logger logger = LoggerFactory.getLogger(DataStore.class);

    private Session session;
    ChannelSftp sftpChannel;
    private String passPhrase;
    private static RemoteConnectionManager instance;

    private RemoteConnectionManager() {
        getPassPhrase();
    }

    private void getPassPhrase() {
        System.out.print("Enter your ssh key passphrase: ");
        Scanner scanner = new Scanner(System.in);
        passPhrase = scanner.nextLine();
    }

    private void createSession() {
        JSch jsch = new JSch();
        session = null;

        try {
            jsch.addIdentity(PRIVATE_KEY_PATH, passPhrase);

            logger.info("Getting session for {}@{}:{}", USERNAME, HOST, PORT);
            session = jsch.getSession(USERNAME, HOST, PORT);

            session.setConfig("PreferredAuthentications", "publickey,keyboard-interactive,password");
            Properties config = new Properties();
            config.put("StrictHostKeyChecking", "no");
            session.setConfig(config);
        } catch(JSchException e) {
            e.printStackTrace();
        }
    }

    private void createSftpChannel() {
        sftpChannel = null;
        createSession();

        try {
            logger.info("Connecting to session");
            session.connect();

            logger.info("Opening SFTP channel");
            sftpChannel = (ChannelSftp) session.openChannel("sftp");
            sftpChannel.connect();
        } catch(JSchException e) {
            e.printStackTrace();
        }
    }

    public static RemoteConnectionManager getInstance() {
        if(instance == null) {
            instance = new RemoteConnectionManager();
        }
        return instance;
    }

    public String readFile(String path) {
        String fileContent = null;
        createSftpChannel();

        try {
            logger.info("Opening stream to file {}", path);
            InputStream inputStream = sftpChannel.get(path);
            BufferedReader bufferedReader = new BufferedReader(new InputStreamReader(inputStream));
            fileContent = bufferedReader.lines().collect(Collectors.joining());
        } catch(Exception e) {
            e.printStackTrace();
        } finally {
            if(session != null) {
                session.disconnect();
            }
            if(sftpChannel != null) {
                sftpChannel.disconnect();
            }
        }

        return fileContent;
    }

    public Vector<ChannelSftp.LsEntry> getDirectoryEntries(String path) {
        Vector<ChannelSftp.LsEntry> entries = null;
        createSftpChannel();

        try {
            logger.info("Retrieving contents of directory {}", path);
            entries = sftpChannel.ls(path);
        } catch(Exception e) {
            e.printStackTrace();
        } finally {
            if(session != null) {
                session.disconnect();
            }
            if(sftpChannel != null) {
                sftpChannel.disconnect();
            }
        }

        return entries;
    }

    public void makeDirectory(String path) {
        createSftpChannel();

        try {
            logger.info("Creating new directory {}", path);
            sftpChannel.mkdir(path);
        } catch(Exception e) {
            e.printStackTrace();
        } finally {
            if(session != null) {
                session.disconnect();
            }
            if(sftpChannel != null) {
                sftpChannel.disconnect();
            }
        }
    }
}
