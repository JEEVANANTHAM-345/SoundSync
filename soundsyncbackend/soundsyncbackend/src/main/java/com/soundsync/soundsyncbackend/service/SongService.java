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
        // Validate file
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
        // Validate content type
        // -------------------------------------------------

        String contentType =
                file.getContentType();


        if (
                contentType == null ||
                !contentType.startsWith("audio/")
        ) {

            throw new IllegalArgumentException(
                    "Only audio files are allowed"
            );

        }


        // -------------------------------------------------
        // Original filename
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
        // Clean filename
        // -------------------------------------------------

        String cleanFileName =
                Paths.get(
                        originalFileName
                )
                .getFileName()
                .toString();


        // -------------------------------------------------
        // Song name
        // -------------------------------------------------

        String songName =
                removeExtension(
                        cleanFileName
                );


        // -------------------------------------------------
        // File extension
        // -------------------------------------------------

        String extension =
                getExtension(
                        cleanFileName
                );


        // -------------------------------------------------
        // Generate unique stored filename
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
        // Save physical audio file
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
        // Save song information in MySQL
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


        return songRepository.save(
                song
        );

    }


    // =====================================================
    // GET AUDIO FILE
    // =====================================================

    public Resource getAudioFile(
            Long id
    ) {

        // -------------------------------------------------
        // Find song
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
        // Get stored file path
        // -------------------------------------------------

        Path filePath =
                Paths.get(
                        song.getFilePath()
                )
                .toAbsolutePath()
                .normalize();


        // -------------------------------------------------
        // Check file
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
        // Convert to Resource
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
    //
    // Delete flow:
    //
    // Song
    //   ↓
    // Remove Favorite
    //   ↓
    // Delete MP3
    //   ↓
    // Delete Song record
    //
    // =====================================================

    @Transactional
    public void deleteSong(
            Long id
    ) {

        // -------------------------------------------------
        // Find song
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
        // Remove favorite relationship
        // -------------------------------------------------

        if (
                favoriteRepository
                        .existsBySongId(id)
        ) {

            favoriteRepository
                    .deleteBySongId(id);

        }


        // -------------------------------------------------
        // Delete physical audio file
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
        // Delete song from MySQL
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