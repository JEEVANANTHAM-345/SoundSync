package com.soundsync.soundsyncbackend.service;

import com.soundsync.soundsyncbackend.entity.Favorite;
import com.soundsync.soundsyncbackend.entity.Song;
import com.soundsync.soundsyncbackend.repository.FavoriteRepository;
import com.soundsync.soundsyncbackend.repository.SongRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;

@Service
public class FavoriteService {

    private final FavoriteRepository favoriteRepository;

    private final SongRepository songRepository;


    // =====================================================
    // CONSTRUCTOR
    // =====================================================

    public FavoriteService(
            FavoriteRepository favoriteRepository,
            SongRepository songRepository
    ) {

        this.favoriteRepository =
                favoriteRepository;

        this.songRepository =
                songRepository;

    }


    // =====================================================
    // GET ALL FAVORITES
    // =====================================================

    public List<Favorite> getAllFavorites() {

        return favoriteRepository.findAll();

    }


    // =====================================================
    // ADD FAVORITE
    // =====================================================

    @Transactional
    public Favorite addFavorite(
            Long songId
    ) {

        if (
                songId == null
        ) {

            throw new IllegalArgumentException(
                    "Song ID cannot be null"
            );

        }


        // -------------------------------------------------
        // Check if favorite already exists
        // -------------------------------------------------

        Favorite existingFavorite =
                favoriteRepository
                        .findBySongId(songId)
                        .orElse(null);


        if (
                existingFavorite != null
        ) {

            return existingFavorite;

        }


        // -------------------------------------------------
        // Find Song
        // -------------------------------------------------

        Song song =
                songRepository
                        .findById(songId)
                        .orElseThrow(
                                () ->
                                        new IllegalArgumentException(
                                                "Song not found with ID: " +
                                                        songId
                                        )
                        );


        // -------------------------------------------------
        // Create Favorite
        // -------------------------------------------------

        Favorite favorite =
                new Favorite();


        favorite.setSong(
                song
        );


        // -------------------------------------------------
        // IMPORTANT
        // Set created_at value
        // -------------------------------------------------

        favorite.setCreatedAt(
                LocalDateTime.now()
        );


        // -------------------------------------------------
        // Save Favorite
        // -------------------------------------------------

        return favoriteRepository.save(
                favorite
        );

    }


    // =====================================================
    // REMOVE FAVORITE
    // =====================================================

    @Transactional
    public boolean removeFavorite(
            Long songId
    ) {

        if (
                songId == null
        ) {

            return false;

        }


        Favorite favorite =
                favoriteRepository
                        .findBySongId(songId)
                        .orElse(null);


        if (
                favorite == null
        ) {

            return false;

        }


        favoriteRepository.delete(
                favorite
        );


        return true;

    }


    // =====================================================
    // CHECK FAVORITE
    // =====================================================

    public boolean isFavorite(
            Long songId
    ) {

        if (
                songId == null
        ) {

            return false;

        }


        return favoriteRepository
                .existsBySongId(
                        songId
                );

    }

}