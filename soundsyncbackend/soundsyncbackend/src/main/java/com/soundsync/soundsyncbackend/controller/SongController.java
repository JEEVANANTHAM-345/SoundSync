package com.soundsync.soundsyncbackend.controller;

import com.soundsync.soundsyncbackend.entity.Song;
import com.soundsync.soundsyncbackend.service.SongService;
import org.springframework.core.io.Resource;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;

@RestController
@RequestMapping("/api/songs")
@CrossOrigin(
        origins = {
                "http://localhost:5500",
                "http://127.0.0.1:5500"
        }
)
public class SongController {

    private final SongService songService;


    // =====================================================
    // CONSTRUCTOR
    // =====================================================

    public SongController(
            SongService songService
    ) {

        this.songService =
                songService;

    }


    // =====================================================
    // GET ALL SONGS
    //
    // GET /api/songs
    // =====================================================

    @GetMapping
    public ResponseEntity<List<Song>> getAllSongs() {

        return ResponseEntity.ok(
                songService.getAllSongs()
        );

    }


    // =====================================================
    // GET SONG BY ID
    //
    // GET /api/songs/{id}
    // =====================================================

    @GetMapping("/{id}")
    public ResponseEntity<Song> getSongById(
            @PathVariable Long id
    ) {

        return songService
                .getSongById(id)
                .map(
                        ResponseEntity::ok
                )
                .orElseGet(
                        () ->
                                ResponseEntity
                                        .notFound()
                                        .build()
                );

    }


    // =====================================================
    // UPLOAD SONG
    //
    // POST /api/songs/upload
    // =====================================================

    @PostMapping(
            value = "/upload",
            consumes =
                    MediaType.MULTIPART_FORM_DATA_VALUE
    )
    public ResponseEntity<Song> uploadSong(
            @RequestParam("file")
            MultipartFile file
    ) {

        Song savedSong =
                songService.uploadSong(
                        file
                );


        return ResponseEntity.ok(
                savedSong
        );

    }


    // =====================================================
    // STREAM AUDIO
    //
    // GET /api/songs/{id}/audio
    // =====================================================

    @GetMapping("/{id}/audio")
    public ResponseEntity<Resource> streamAudio(
            @PathVariable Long id
    ) {

        Resource resource =
                songService.getAudioFile(
                        id
                );


        MediaType mediaType =
                determineMediaType(
                        resource
                );


        return ResponseEntity
                .ok()

                // Audio MIME type.
                .contentType(
                        mediaType
                )

                // Play inside browser.
                .header(
                        HttpHeaders.CONTENT_DISPOSITION,
                        "inline; filename=\"" +
                                resource.getFilename() +
                                "\""
                )

                // Allow browser media loading.
                .header(
                        HttpHeaders.ACCEPT_RANGES,
                        "bytes"
                )

                .body(
                        resource
                );

    }


    // =====================================================
    // DELETE SONG
    //
    // DELETE /api/songs/{id}
    // =====================================================

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteSong(
            @PathVariable Long id
    ) {

        if (
                songService
                        .getSongById(id)
                        .isEmpty()
        ) {

            return ResponseEntity
                    .notFound()
                    .build();

        }


        songService.deleteSong(
                id
        );


        return ResponseEntity
                .noContent()
                .build();

    }


    // =====================================================
    // DETERMINE AUDIO TYPE
    // =====================================================

    private MediaType determineMediaType(
            Resource resource
    ) {

        String fileName =
                resource.getFilename();


        if (
                fileName == null
        ) {

            return MediaType.APPLICATION_OCTET_STREAM;

        }


        String name =
                fileName.toLowerCase();


        if (
                name.endsWith(".mp3")
        ) {

            return MediaType.parseMediaType(
                    "audio/mpeg"
            );

        }


        if (
                name.endsWith(".wav")
        ) {

            return MediaType.parseMediaType(
                    "audio/wav"
            );

        }


        if (
                name.endsWith(".ogg")
        ) {

            return MediaType.parseMediaType(
                    "audio/ogg"
            );

        }


        if (
                name.endsWith(".m4a")
        ) {

            return MediaType.parseMediaType(
                    "audio/mp4"
            );

        }


        if (
                name.endsWith(".aac")
        ) {

            return MediaType.parseMediaType(
                    "audio/aac"
            );

        }


        if (
                name.endsWith(".flac")
        ) {

            return MediaType.parseMediaType(
                    "audio/flac"
            );

        }


        return MediaType.APPLICATION_OCTET_STREAM;

    }

}