package com.soundsync.soundsyncbackend.entity;

import jakarta.persistence.*;

import java.time.LocalDateTime;

@Entity
@Table(name = "songs")
public class Song {

    // =====================================================
    // ID
    // =====================================================

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;


    // =====================================================
    // SONG NAME
    // =====================================================

    @Column(
            name = "song_name",
            nullable = false
    )
    private String songName;


    // =====================================================
    // ORIGINAL FILE NAME
    // =====================================================

    @Column(
            name = "file_name",
            nullable = false
    )
    private String fileName;


    // =====================================================
    // STORED FILE PATH
    // =====================================================

    @Column(
            name = "file_path",
            nullable = false
    )
    private String filePath;


    // =====================================================
    // CREATED TIME
    // =====================================================

    @Column(
            name = "created_at"
    )
    private LocalDateTime createdAt;


    // =====================================================
    // EMPTY CONSTRUCTOR
    // =====================================================

    public Song() {
    }


    // =====================================================
    // GET ID
    // =====================================================

    public Long getId() {

        return id;

    }


    // =====================================================
    // SET ID
    // =====================================================

    public void setId(
            Long id
    ) {

        this.id = id;

    }


    // =====================================================
    // GET SONG NAME
    // =====================================================

    public String getSongName() {

        return songName;

    }


    // =====================================================
    // SET SONG NAME
    // =====================================================

    public void setSongName(
            String songName
    ) {

        this.songName =
                songName;

    }


    // =====================================================
    // GET FILE NAME
    // =====================================================

    public String getFileName() {

        return fileName;

    }


    // =====================================================
    // SET FILE NAME
    // =====================================================

    public void setFileName(
            String fileName
    ) {

        this.fileName =
                fileName;

    }


    // =====================================================
    // GET FILE PATH
    // =====================================================

    public String getFilePath() {

        return filePath;

    }


    // =====================================================
    // SET FILE PATH
    // =====================================================

    public void setFilePath(
            String filePath
    ) {

        this.filePath =
                filePath;

    }


    // =====================================================
    // GET CREATED AT
    // =====================================================

    public LocalDateTime getCreatedAt() {

        return createdAt;

    }


    // =====================================================
    // SET CREATED AT
    // =====================================================

    public void setCreatedAt(
            LocalDateTime createdAt
    ) {

        this.createdAt =
                createdAt;

    }

}