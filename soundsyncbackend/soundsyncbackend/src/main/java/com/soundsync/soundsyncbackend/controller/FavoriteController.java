package com.soundsync.soundsyncbackend.controller;

import com.soundsync.soundsyncbackend.entity.Favorite;
import com.soundsync.soundsyncbackend.service.FavoriteService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/favorites")
@CrossOrigin(
        origins = {
                "http://localhost:5500",
                "http://127.0.0.1:5500"
        }
)
public class FavoriteController {

    private final FavoriteService favoriteService;


    // =====================================================
    // CONSTRUCTOR
    // =====================================================

    public FavoriteController(
            FavoriteService favoriteService
    ) {

        this.favoriteService =
                favoriteService;

    }


    // =====================================================
    // GET ALL FAVORITES
    // =====================================================

    @GetMapping
    public ResponseEntity<List<Favorite>> getAllFavorites() {

        return ResponseEntity.ok(
                favoriteService.getAllFavorites()
        );

    }


    // =====================================================
    // ADD FAVORITE
    // =====================================================

    @PostMapping("/{songId}")
    public ResponseEntity<Favorite> addFavorite(
            @PathVariable Long songId
    ) {

        Favorite favorite =
                favoriteService.addFavorite(
                        songId
                );


        return ResponseEntity.ok(
                favorite
        );

    }


    // =====================================================
    // REMOVE FAVORITE
    // =====================================================

    @DeleteMapping("/{songId}")
    public ResponseEntity<Void> removeFavorite(
            @PathVariable Long songId
    ) {

        boolean removed =
                favoriteService.removeFavorite(
                        songId
                );


        if (
                !removed
        ) {

            return ResponseEntity
                    .notFound()
                    .build();

        }


        return ResponseEntity
                .noContent()
                .build();

    }


    // =====================================================
    // CHECK FAVORITE
    // =====================================================

    @GetMapping("/{songId}/check")
    public ResponseEntity<Boolean> checkFavorite(
            @PathVariable Long songId
    ) {

        return ResponseEntity.ok(
                favoriteService.isFavorite(
                        songId
                )
        );

    }

}