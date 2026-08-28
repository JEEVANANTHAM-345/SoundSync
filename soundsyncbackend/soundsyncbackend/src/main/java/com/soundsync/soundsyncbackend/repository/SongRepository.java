package com.soundsync.soundsyncbackend.repository;

import com.soundsync.soundsyncbackend.entity.Song;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface SongRepository
        extends JpaRepository<Song, Long> {

}