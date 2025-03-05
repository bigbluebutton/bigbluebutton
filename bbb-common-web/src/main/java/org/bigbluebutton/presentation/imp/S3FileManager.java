package org.bigbluebutton.presentation.imp;

import com.amazonaws.auth.AWSCredentials;
import com.amazonaws.auth.AWSStaticCredentialsProvider;
import com.amazonaws.auth.BasicAWSCredentials;
import com.amazonaws.client.builder.AwsClientBuilder;
import com.amazonaws.services.s3.AmazonS3;
import com.amazonaws.services.s3.AmazonS3ClientBuilder;
import com.amazonaws.services.s3.model.GetObjectRequest;
import com.amazonaws.services.s3.model.PutObjectRequest;
import com.amazonaws.services.s3.model.S3Object;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import java.io.File;
import java.io.FileInputStream;
import java.io.IOException;
import java.io.InputStream;
import java.security.MessageDigest;
import java.security.NoSuchAlgorithmException;
import java.util.HashMap;
import java.util.Map;

public class S3FileManager {
    private static Logger log = LoggerFactory.getLogger(S3FileManager.class);
    private boolean presentationConversionCacheEnabled = false;
    private String accessKeyId = "";
    private String accessKeySecret = "";
    private String bucketName = "";
    private String region = "";
    private String endpointUrl = "";
    private boolean pathStyleAccess = false;
    private AmazonS3 s3Client = null;
    private static final Map<String, Boolean> prersentationCacheEnabledMap = new HashMap<>();

    public AmazonS3 getS3Client() {
        if(s3Client == null) {
            AWSCredentials credentials = new BasicAWSCredentials(accessKeyId, accessKeySecret);
            s3Client = AmazonS3ClientBuilder.standard()
                    .withCredentials(new AWSStaticCredentialsProvider(credentials))
                    .withEndpointConfiguration(new AwsClientBuilder.EndpointConfiguration(endpointUrl, region))
                    .withPathStyleAccessEnabled(pathStyleAccess)
                    .build();
        }

        return s3Client;
    }

    public static void storePresentationEnabledCache(Boolean presentationConversionCacheEnabled, String meetingId) {
        if (!prersentationCacheEnabledMap.containsKey(meetingId)) {
            prersentationCacheEnabledMap.put(meetingId, presentationConversionCacheEnabled);
        } else {
            prersentationCacheEnabledMap.replace(meetingId, presentationConversionCacheEnabled);
        }
    }

    public static void removePresentationCacheEnabledForMeeting(String meetingId) {
        prersentationCacheEnabledMap.remove(meetingId);
    }

    public boolean exists(String key) {
        return getS3Client() != null && getS3Client().doesObjectExist(bucketName, key);
    }

    public void upload(String key, File file) {
        if(getS3Client() != null) {
            getS3Client().putObject(new PutObjectRequest(bucketName, key, file));
        }
    }

    public S3Object download(String key) {
        if(getS3Client() != null) {
            return getS3Client().getObject(new GetObjectRequest(bucketName, key));
        } else {
            return null;
        }
    }

    public String generateHash(File file) throws IOException, NoSuchAlgorithmException {
        MessageDigest digest = MessageDigest.getInstance("SHA-256");
        try (InputStream is = new FileInputStream(file)) {
            byte[] buffer = new byte[8192];
            int bytesRead;
            while ((bytesRead = is.read(buffer)) != -1) {
                digest.update(buffer, 0, bytesRead);
            }
        }
        byte[] hashBytes = digest.digest();
        StringBuilder hashString = new StringBuilder();
        for (byte b : hashBytes) {
            hashString.append(String.format("%02x", b));
        }
        return hashString.toString();
    }


    public boolean isPresentationConversionCacheEnabled(String meetingId) {
        if (prersentationCacheEnabledMap.containsKey(meetingId)) {
            return prersentationCacheEnabledMap.get(meetingId);
        } return presentationConversionCacheEnabled;
    }

    public void setPresentationConversionCacheEnabled(boolean presentationConversionCacheEnabled) {
        if(presentationConversionCacheEnabled) {
            log.info("S3 cache system enabled");
        } else {
            log.info("S3 cache system disabled");
        }
        this.presentationConversionCacheEnabled = presentationConversionCacheEnabled;
    }

    public String getAccessKeyId() {
        return accessKeyId;
    }

    public void setAccessKeyId(String accessKeyId) {
        this.accessKeyId = accessKeyId;
    }

    public String getAccessKeySecret() {
        return accessKeySecret;
    }

    public void setAccessKeySecret(String accessKeySecret) {
        this.accessKeySecret = accessKeySecret;
    }

    public String getBucketName() {
        return bucketName;
    }

    public void setBucketName(String bucketName) {
        this.bucketName = bucketName;
    }

    public String getRegion() {
        return region;
    }

    public void setRegion(String region) {
        this.region = region;
    }

    public String getEndpointUrl() {
        return endpointUrl;
    }

    public void setEndpointUrl(String endpointUrl) {
        this.endpointUrl = endpointUrl;
    }

    public boolean isPathStyleAccess() {
        return pathStyleAccess;
    }

    public void setPathStyleAccess(boolean pathStyleAccess) {
        this.pathStyleAccess = pathStyleAccess;
    }
}
