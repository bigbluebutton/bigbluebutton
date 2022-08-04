package org.bigbluebutton.handler;

import org.bigbluebutton.dao.DataStore;
import org.bigbluebutton.dao.entity.*;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import java.lang.reflect.Field;
import java.math.BigInteger;
import java.security.MessageDigest;
import java.security.NoSuchAlgorithmException;
import java.time.*;
import java.util.*;
import java.util.concurrent.ThreadLocalRandom;
import java.util.function.Predicate;
import java.util.stream.Collectors;
import java.util.stream.Stream;

public class GenerationHandler {

    private static final Logger logger = LoggerFactory.getLogger(GenerationHandler.class);

    private static GenerationHandler instance;
    private final DataStore dataStore;

    private Set<String> metadataKeys;

    private GenerationHandler() {
        this.dataStore = DataStore.getInstance();
    }

    public static GenerationHandler getInstance() {
        if (instance == null) {
            instance = new GenerationHandler();
            if (instance.dataStore == null)
                instance = null;
        }

        return instance;
    }

    public void generateRecordings(int numRecordings) {
        logger.info("Generating {} recordings", numRecordings);
        for (int i = 0; i < numRecordings; i++) {
            Recording recording = generateRecording();
            dataStore.save(recording);
            printStatus(i, numRecordings);
        }
    }

    private Recording generateRecording() {
        Recording recording = new Recording();

        String meetingId = UUID.randomUUID().toString();
        recording.setMeetingId(meetingId);

        StringBuilder hash;
        String recordId = null;
        try {
            MessageDigest digest = MessageDigest.getInstance("SHA-1");
            byte[] messageDigest = digest.digest(meetingId.getBytes());
            BigInteger signum = new BigInteger(1, messageDigest);
            hash = new StringBuilder(signum.toString(16));
            while (hash.length() < 32)
                hash.insert(0, "0");
            recordId = hash.toString();
        } catch (NoSuchAlgorithmException ignored) {
        }

        if (recordId != null)
            recording.setRecordId(recordId);
        else
            recording.setRecordId(meetingId);

        fillFields(recording, new String[] { "id", "recordId", "meetingId", "metadata", "format", "callbackData",
                "tracks", "events" });

        recording.setMetadata(generateMetadata(recording));
        recording.setFormat(generatePlaybackFormat(recording));
        recording.setCallbackData(generateCallbackData(recording));

        return recording;
    }

    private Set<Metadata> generateMetadata(Recording recording) {
        ThreadLocalRandom random = ThreadLocalRandom.current();
        int numMetadata = random.nextInt(5, 11);

        if (metadataKeys == null) {
            metadataKeys = new HashSet<>();
            List<Metadata> metadataList = dataStore.findAll(Metadata.class);
            metadataKeys = metadataList.stream().map(Metadata::getKey).collect(Collectors.toSet());
        }

        Set<String> usableKeys = new HashSet<>(Set.copyOf(metadataKeys));
        return Stream.generate(() -> {
            Metadata m = new Metadata();
            m.setRecording(recording);

            if (!usableKeys.isEmpty()) {
                Optional<String> optional = usableKeys.stream().skip(random.nextInt(usableKeys.size())).findFirst();
                String key = optional.get();
                m.setKey(key);
                usableKeys.remove(key);
            } else
                m.setKey(generateRandomString(false));

            m.setValue(generateRandomString(false));
            return m;
        }).limit(numMetadata).collect(Collectors.toSet());
    }

    private PlaybackFormat generatePlaybackFormat(Recording recording) {
        PlaybackFormat playbackFormat = new PlaybackFormat();
        playbackFormat.setFormat("capture");

        fillFields(playbackFormat, new String[] { "id", "format", "recording", "thumbnails" });
        playbackFormat.setThumbnails(generateThumbnails(playbackFormat));

        playbackFormat.setRecording(recording);
        return playbackFormat;
    }

    private Set<Thumbnail> generateThumbnails(PlaybackFormat format) {
        ThreadLocalRandom random = ThreadLocalRandom.current();
        int numThumbnails = random.nextInt(1, 6);

        return Stream.generate(() -> {
            Thumbnail thumbnail = new Thumbnail();
            thumbnail.setPlaybackFormat(format);
            fillFields(thumbnail, new String[] { "id", "sequence", "playbackFormat" });
            return thumbnail;
        }).limit(numThumbnails).collect(Collectors.toSet());
    }

    private CallbackData generateCallbackData(Recording recording) {
        CallbackData callbackData = new CallbackData();
        callbackData.setMeetingId(recording.getMeetingId());
        callbackData.setRecording(recording);
        fillFields(callbackData, new String[] { "id", "meetingId", "recording" });
        return callbackData;
    }

    private <T> void fillFields(T object, String[] excludedFields) {
        Field[] fields = object.getClass().getDeclaredFields();
        for (Field field : fields) {
            String fieldName = field.getName();
            if (Arrays.asList(excludedFields).contains(fieldName))
                continue;
            field.setAccessible(true);
            Object fieldValue = generateValue(field.getType());
            try {
                field.set(object, fieldValue);
            } catch (Exception e) {
                logger.info("Error: Failed to set {} on {}", fieldValue, field.getAnnotatedType());
            }
        }

    }

    private Object generateValue(Class<?> type) {
        Object value = null;
        Random random = new Random();

        switch (type.getSimpleName()) {
        case "int":
        case "Integer":
            value = random.nextInt();
            break;
        case "long":
        case "Long":
            value = random.nextLong();
            break;
        case "double":
        case "Double":
            value = random.nextDouble();
            break;
        case "boolean":
        case "Boolean":
            value = random.nextDouble() < 0.5;
            break;
        case "String":
            value = generateRandomString(true);
            break;
        case "LocalDateTime":
            value = generateRandomDate();
            break;
        default:
            logger.info("Generation of {} not supported", type.getSimpleName());
            break;

        }

        return value;
    }

    private String generateRandomString(boolean alphaNumeric) {
        int leftLimit = (alphaNumeric) ? 48 : 97;
        int rightLimit = 122;
        int stringLength = 16;
        Random random = new Random();

        return random.ints(leftLimit, rightLimit + 1).filter(i -> (i <= 57 || i > 65) && (i <= 90 || i >= 97))
                .limit(stringLength).collect(StringBuilder::new, StringBuilder::appendCodePoint, StringBuilder::append)
                .toString();
    }

    private LocalDateTime generateRandomDate() {
        Instant currentTime = Instant.now();
        long leftLimit = currentTime.minus(Duration.ofDays(5 * 365)).getEpochSecond();
        long rightLimit = currentTime.getEpochSecond();
        long randomTime = ThreadLocalRandom.current().nextLong(leftLimit, rightLimit);
        return LocalDateTime.ofEpochSecond(randomTime, 0, ZoneId.systemDefault().getRules().getOffset(currentTime));
    }

    private void printStatus(int current, int end) {
        if (current + 1 == end)
            System.out.println("Done!                                  \n");
        int percent = (int) ((current * 100.0f) / end);

        int num = (int) ((double) percent / 5);

        String progress = "[" + "*".repeat(Math.max(0, num + 1)) + " ".repeat(Math.max(0, 20 - num)) + "] " + percent
                + "%\r";
        System.out.print(progress);
    }
}
