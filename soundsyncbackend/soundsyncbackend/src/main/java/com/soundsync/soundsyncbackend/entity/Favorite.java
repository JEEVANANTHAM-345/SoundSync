package com.soundsync.soundsyncbackend.entity;

import jakarta.persistence.*;

import java.time.LocalDateTime;

@Entity
@Table(
        name = "favorites",
        uniqueConstraints = {
                @UniqueConstraint(
                        columnNames = "song_id"
                )
        }
)
public class Favorite {

    // =====================================================
    // ID
    // =====================================================

    @Id
    @GeneratedValue(
            strategy = GenerationType.IDENTITY
    )
    private Long id;


    // =====================================================
    // SONG
    // =====================================================

    @OneToOne(
            fetch = FetchType.EAGER,
            optional = false
    )
    @JoinColumn(
            name = "song_id",
            nullable = false,
            unique = true
    )
    private Song song;


    // =====================================================
    // CREATED AT
    // =====================================================

    @Column(
            name = "created_at",
            nullable = false
    )
    private LocalDateTime createdAt;


    // =====================================================
    // EMPTY CONSTRUCTOR
    // =====================================================

    public Favorite() {
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
    // GET SONG
    // =====================================================

    public Song getSong() {

        return song;

    }


    // =====================================================
    // SET SONG
    // =====================================================

    public void setSong(
            Song song
    ) {

        this.song = song;

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

        this.createdAt = createdAt;

    }

}