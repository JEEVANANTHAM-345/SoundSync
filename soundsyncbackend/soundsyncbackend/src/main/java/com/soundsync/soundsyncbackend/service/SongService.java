package com.soundsync.soundsyncbackend.service;

import com.soundsync.soundsyncbackend.entity.Song;
import com.soundsync.soundsyncbackend.repository.FavoriteRepository;
import com.soundsync.soundsyncbackend.repository.SongRepository;

import org.springframework.core.io.Resource;
import org.springframework.core.io.UrlResource;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardCopyOption;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Service
public class SongService {

    private final SongRepository songRepository;

    private final FavoriteRepository favoriteRepository;


    /*
     * Uploaded audio files are stored
     * inside the uploads folder.
     */
    private final Path uploadDirectory =
            Paths.get("uploads")
                    .toAbsolutePath()
                    .normalize();


    // =====================================================
    // CONSTRUCTOR
    // =====================================================

    public SongService(
            SongRepository songRepository,
            FavoriteRepository favoriteRepository
    ) {

        this.songRepository =
                songRepository;

        this.favoriteRepository =
                favoriteRepository;

        createUploadDirectory();
    }


    // =====================================================
    // CREATE UPLOAD DIRECTORY
    // =====================================================

    private void createUploadDirectory() {

        try {

            Files.createDirectories(
                    uploadDirectory
            );

        } catch (IOException e) {

            throw new RuntimeException(
                    "Could not create upload directory",
                    e
            );

        }

    }


    // =====================================================
    // GET ALL SONGS
    // =====================================================

    public List<Song> getAllSongs() {

        return songRepository.findAll();

    }


    // =====================================================
    // GET SONG BY ID
    // =====================================================

    public Optional<Song> getSongById(
            Long id
    ) {

        return songRepository.findById(
                id
        );

    }


    // =====================================================
    // UPLOAD SONG
    // =====================================================

    public Song uploadSong(
            MultipartFile file
    ) {

        // -------------------------------------------------
        // VALIDATE FILE
        // -------------------------------------------------

        if (
                file == null ||
                file.isEmpty()
        ) {

            throw new IllegalArgumentException(
                    "Audio file cannot be empty"
            );

        }


        // -------------------------------------------------
        // VALIDATE CONTENT TYPE
        // -------------------------------------------------

        String contentType =
                file.getContentType();


        if (
                contentType == null ||
                !contentType.toLowerCase()
                        .startsWith("audio/")
        ) {

            throw new IllegalArgumentException(
                    "Only audio files are allowed"
            );

        }


        // -------------------------------------------------
        // GET ORIGINAL FILE NAME
        // -------------------------------------------------

        String originalFileName =
                file.getOriginalFilename();


        if (
                originalFileName == null ||
                originalFileName.isBlank()
        ) {

            throw new IllegalArgumentException(
                    "Invalid file name"
            );

        }


        // -------------------------------------------------
        // CLEAN FILE NAME
        // -------------------------------------------------

        String cleanFileName =
                Paths.get(
                        originalFileName
                )
                .getFileName()
                .toString()
                .trim();


        if (
                cleanFileName.isBlank()
        ) {

            throw new IllegalArgumentException(
                    "Invalid file name"
            );

        }


        // =================================================
        // DUPLICATE SONG CHECK
        // =================================================
        //
        // We compare normalized filenames so that:
        //
        // Song.mp3
        // song.mp3
        // Song.MP3
        // " Song.mp3 "
        //
        // are treated as the same uploaded file name.
        //
        // This prevents creating another Song record and
        // another physical audio file.
        // =================================================

        String normalizedFileName =
                normalizeFileName(
                        cleanFileName
                );


        List<Song> existingSongs =
                songRepository.findAll();


        for (
                Song existingSong :
                existingSongs
        ) {

            if (
                    existingSong == null
            ) {

                continue;

            }


            String existingFileName =
                    existingSong.getFileName();


            if (
                    existingFileName == null
            ) {

                continue;

            }


            String normalizedExistingName =
                    normalizeFileName(
                            existingFileName
                    );


            if (
                    normalizedFileName.equals(
                            normalizedExistingName
                    )
            ) {

                throw new IllegalArgumentException(
                        "Song already exists: " +
                        cleanFileName
                );

            }

        }


        // -------------------------------------------------
        // SONG NAME
        // -------------------------------------------------

        String songName =
                removeExtension(
                        cleanFileName
                );


        // -------------------------------------------------
        // FILE EXTENSION
        // -------------------------------------------------

        String extension =
                getExtension(
                        cleanFileName
                );


        // -------------------------------------------------
        // GENERATE UNIQUE STORED FILE NAME
        // -------------------------------------------------

        String storedFileName =
                UUID.randomUUID()
                        .toString()
                + extension;


        Path destination =
                uploadDirectory
                        .resolve(
                                storedFileName
                        )
                        .normalize();


        // -------------------------------------------------
        // SAFETY CHECK
        // -------------------------------------------------

        if (
                !destination.startsWith(
                        uploadDirectory
                )
        ) {

            throw new IllegalArgumentException(
                    "Invalid file path"
            );

        }


        // -------------------------------------------------
        // SAVE PHYSICAL AUDIO FILE
        // -------------------------------------------------

        try {

            Files.copy(
                    file.getInputStream(),
                    destination,
                    StandardCopyOption.REPLACE_EXISTING
            );

        } catch (IOException e) {

            throw new RuntimeException(
                    "Failed to save audio file",
                    e
            );

        }


        // -------------------------------------------------
        // CREATE SONG ENTITY
        // -------------------------------------------------

        Song song =
                new Song();


        song.setSongName(
                songName
        );


        song.setFileName(
                cleanFileName
        );


        song.setFilePath(
                destination.toString()
        );


        song.setCreatedAt(
                LocalDateTime.now()
        );


        // -------------------------------------------------
        // SAVE SONG TO DATABASE
        // -------------------------------------------------

        return songRepository.save(
                song
        );

    }


    // =====================================================
    // NORMALIZE FILE NAME
    // =====================================================

    private String normalizeFileName(
            String fileName
    ) {

        if (
                fileName == null
        ) {

            return "";

        }


        return fileName
                .trim()
                .toLowerCase();

    }


    // =====================================================
    // GET AUDIO FILE
    // =====================================================

    public Resource getAudioFile(
            Long id
    ) {

        // -------------------------------------------------
        // FIND SONG
        // -------------------------------------------------

        Song song =
                songRepository
                        .findById(id)
                        .orElseThrow(
                                () ->
                                        new IllegalArgumentException(
                                                "Song not found"
                                        )
                        );


        // -------------------------------------------------
        // GET STORED FILE PATH
        // -------------------------------------------------

        Path filePath =
                Paths.get(
                        song.getFilePath()
                )
                .toAbsolutePath()
                .normalize();


        // -------------------------------------------------
        // CHECK FILE EXISTS
        // -------------------------------------------------

        if (
                !Files.exists(
                        filePath
                )
        ) {

            throw new RuntimeException(
                    "Audio file does not exist"
            );

        }


        // -------------------------------------------------
        // CHECK FILE IS READABLE
        // -------------------------------------------------

        if (
                !Files.isReadable(
                        filePath
                )
        ) {

            throw new RuntimeException(
                    "Audio file is not readable"
            );

        }


        // -------------------------------------------------
        // CREATE RESOURCE
        // -------------------------------------------------

        try {

            Resource resource =
                    new UrlResource(
                            filePath.toUri()
                    );


            if (
                    !resource.exists() ||
                    !resource.isReadable()
            ) {

                throw new RuntimeException(
                        "Audio file cannot be loaded"
                );

            }


            return resource;

        } catch (IOException e) {

            throw new RuntimeException(
                    "Could not load audio file",
                    e
            );

        }

    }


    // =====================================================
    // DELETE SONG
    // =====================================================

    @Transactional
    public void deleteSong(
            Long id
    ) {

        // -------------------------------------------------
        // FIND SONG
        // -------------------------------------------------

        Song song =
                songRepository
                        .findById(id)
                        .orElseThrow(
                                () ->
                                        new IllegalArgumentException(
                                                "Song not found"
                                        )
                        );


        // -------------------------------------------------
        // REMOVE FAVORITE RELATIONSHIP
        // -------------------------------------------------

        if (
                favoriteRepository
                        .existsBySongId(id)
        ) {

            favoriteRepository
                    .deleteBySongId(id);

        }


        // -------------------------------------------------
        // DELETE PHYSICAL AUDIO FILE
        // -------------------------------------------------

        try {

            Path filePath =
                    Paths.get(
                            song.getFilePath()
                    )
                    .toAbsolutePath()
                    .normalize();


            Files.deleteIfExists(
                    filePath
            );

        } catch (IOException e) {

            throw new RuntimeException(
                    "Failed to delete audio file",
                    e
            );

        }


        // -------------------------------------------------
        // DELETE SONG FROM MYSQL
        // -------------------------------------------------

        songRepository.delete(
                song
        );

    }


    // =====================================================
    // REMOVE FILE EXTENSION
    // =====================================================

    private String removeExtension(
            String fileName
    ) {

        int dotIndex =
                fileName.lastIndexOf(
                        "."
                );


        if (
                dotIndex <= 0
        ) {

            return fileName;

        }


        return fileName.substring(
                0,
                dotIndex
        );

    }


    // =====================================================
    // GET FILE EXTENSION
    // =====================================================

    private String getExtension(
            String fileName
    ) {

        int dotIndex =
                fileName.lastIndexOf(
                        "."
                );


        if (
                dotIndex < 0
        ) {

            return "";

        }


        return fileName.substring(
                dotIndex
        );

    }

}