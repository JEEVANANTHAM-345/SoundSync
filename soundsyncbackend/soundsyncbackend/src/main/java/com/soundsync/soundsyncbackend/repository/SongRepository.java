package com.soundsync.soundsyncbackend.repository;

import com.soundsync.soundsyncbackend.entity.Song;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface SongRepository
        extends JpaRepository<Song, Long> {

    /*
     * Check whether a song with the same
     * original file name already exists.
     */
    Optional<Song> findByFileName(String fileName);

}