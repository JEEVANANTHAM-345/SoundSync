package com.soundsync.soundsyncbackend.repository;

import com.soundsync.soundsyncbackend.entity.Favorite;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import org.springframework.transaction.annotation.Transactional;

import java.util.Optional;

@Repository
public interface FavoriteRepository
        extends JpaRepository<Favorite, Long> {

    // =====================================================
    // FIND FAVORITE BY SONG ID
    // =====================================================

    @Query("""
            SELECT f
            FROM Favorite f
            WHERE f.song.id = :songId
            """)
    Optional<Favorite> findBySongId(
            @Param("songId") Long songId
    );


    // =====================================================
    // CHECK FAVORITE BY SONG ID
    // =====================================================

    @Query("""
            SELECT COUNT(f) > 0
            FROM Favorite f
            WHERE f.song.id = :songId
            """)
    boolean existsBySongId(
            @Param("songId") Long songId
    );


    // =====================================================
    // DELETE FAVORITE BY SONG ID
    // =====================================================

    @Modifying
    @Transactional
    @Query("""
            DELETE FROM Favorite f
            WHERE f.song.id = :songId
            """)
    void deleteBySongId(
            @Param("songId") Long songId
    );

}