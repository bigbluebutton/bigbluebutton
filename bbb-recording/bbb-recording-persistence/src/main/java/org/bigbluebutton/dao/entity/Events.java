package org.bigbluebutton.dao.entity;

import lombok.Getter;
import lombok.Setter;

import javax.persistence.*;

@Entity
@Table(name = "events")
@Getter
@Setter
public class Events {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id")
    private Long id;

    @Column(name = "content")
    private String content;

    @OneToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "recording_id", referencedColumnName = "id")
    private Recording recording;
}
