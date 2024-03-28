package org.bigbluebutton.dao.entity;

import lombok.Getter;
import lombok.Setter;

import javax.persistence.*;


@Entity
@Table(name = "track")
@Getter
@Setter
public class Track {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id")
    private Long id;

    @Column(name = "href")
    private String href;

    @Column(name = "kind")
    private String kind;

    @Column(name = "lang")
    private String lang;

    @Column(name = "label")
    private String label;

    @Column(name = "original_name")
    private String originalName;

    @Column(name = "temp_name")
    private String tempName;

    @Column(name = "content_type")
    private String contentType;

    @Column(name = "source")
    private String source;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "recording_id", referencedColumnName = "id")
    private Recording recording;
}
