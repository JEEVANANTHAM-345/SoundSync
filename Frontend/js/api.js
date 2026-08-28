/*
 * =========================================================
 * SOUNDSYNC
 * API LAYER
 * =========================================================
 */

const API_BASE_URL =
    "http://localhost:8080";

const SONGS_API =
    `${API_BASE_URL}/api/songs`;

const FAVORITES_API =
    `${API_BASE_URL}/api/favorites`;

const SOUND_SYNC_IMAGE =
    "assets/images/music-fun-cover.png";


/* =========================================================
   SONG STATE
   ========================================================= */

let songs = [];


/* =========================================================
   LOAD SONGS
   ========================================================= */

async function loadSongsFromBackend() {

    const response =
        await fetch(
            SONGS_API
        );


    if (!response.ok) {

        throw new Error(
            `Unable to load songs. HTTP ${response.status}`
        );

    }


    const data =
        await response.json();


    songs =
        Array.isArray(data)
            ? data
            : [];


    return songs;

}


/* =========================================================
   GET SONGS
   ========================================================= */

function getSongs() {

    return songs;

}


/* =========================================================
   GET SONG BY ID
   ========================================================= */

function getSongById(
    songId
) {

    const numericId =
        Number(songId);


    return songs.find(
        song =>
            Number(song.id) ===
            numericId
    );

}


/* =========================================================
   AUDIO URL
   ========================================================= */

function getAudioUrl(
    songId
) {

    return `${SONGS_API}/${songId}/audio`;

}


/* =========================================================
   UPLOAD SONGS
   ========================================================= */

async function uploadSongs(
    files
) {

    if (
        !Array.isArray(files) ||
        files.length === 0
    ) {

        throw new Error(
            "No audio files selected"
        );

    }


    const results = [];

    const errors = [];


    for (
        const file of files
    ) {

        try {

            if (
                !file.type.startsWith("audio/")
            ) {

                errors.push({

                    fileName:
                        file.name,

                    message:
                        "Only audio files are allowed"

                });

                continue;

            }


            const formData =
                new FormData();


            formData.append(
                "file",
                file
            );


            const response =
                await fetch(
                    `${SONGS_API}/upload`,
                    {
                        method:
                            "POST",

                        body:
                            formData
                    }
                );


            if (
                !response.ok
            ) {

                let message =
                    `Upload failed. HTTP ${response.status}`;


                try {

                    const errorData =
                        await response.json();


                    if (
                        errorData.message
                    ) {

                        message =
                            errorData.message;

                    }

                }

                catch {

                    /*
                     * Ignore invalid JSON response.
                     */

                }


                throw new Error(
                    message
                );

            }


            const savedSong =
                await response.json();


            results.push(
                savedSong
            );

        }

        catch (
            error
        ) {

            console.error(
                "Upload error:",
                file.name,
                error
            );


            errors.push({

                fileName:
                    file.name,

                message:
                    error.message ||
                    "Upload failed"

            });

        }

    }


    return {

        results:
            results,

        errors:
            errors

    };

}


/* =========================================================
   DELETE SONG
   ========================================================= */

async function deleteSongFromBackend(
    songId
) {

    const numericId =
        Number(songId);


    if (
        !Number.isInteger(
            numericId
        )
    ) {

        throw new Error(
            "Invalid song ID"
        );

    }


    const response =
        await fetch(
            `${SONGS_API}/${numericId}`,
            {
                method:
                    "DELETE"
            }
        );


    if (
        !response.ok &&
        response.status !== 204
    ) {

        let message =
            `Delete failed. HTTP ${response.status}`;


        try {

            const errorData =
                await response.json();


            if (
                errorData.message
            ) {

                message =
                    errorData.message;

            }

        }

        catch {

            /*
             * Ignore invalid JSON.
             */

        }


        throw new Error(
            message
        );

    }


    /*
     * Remove deleted song from
     * frontend state.
     */

    songs =
        songs.filter(
            song =>
                Number(song.id) !==
                numericId
        );


    return true;

}


/* =========================================================
   GET ALL FAVORITES
   ========================================================= */

async function fetchFavorites() {

    const response =
        await fetch(
            FAVORITES_API
        );


    if (
        !response.ok
    ) {

        throw new Error(
            `Unable to load favorites. HTTP ${response.status}`
        );

    }


    const data =
        await response.json();


    return Array.isArray(data)
        ? data
        : [];

}


/* =========================================================
   ADD FAVORITE
   ========================================================= */

async function addFavoriteToBackend(
    songId
) {

    const numericId =
        Number(songId);


    /*
     * VERY IMPORTANT:
     * Never send undefined/null/NaN
     * as a song ID.
     */

    if (
        !Number.isInteger(
            numericId
        ) ||
        numericId <= 0
    ) {

        throw new Error(
            `Invalid song ID: ${songId}`
        );

    }


    /*
     * Verify the song exists in the
     * frontend's current song list.
     */

    const song =
        getSongById(
            numericId
        );


    if (
        !song
    ) {

        /*
         * Reload from backend once.
         *
         * This is especially important
         * immediately after uploading a song.
         */

        await loadSongsFromBackend();

    }


    /*
     * Check again after reload.
     */

    const verifiedSong =
        getSongById(
            numericId
        );


    if (
        !verifiedSong
    ) {

        throw new Error(
            `Song ID ${numericId} does not exist`
        );

    }


    /*
     * Send Favorite request.
     */

    const response =
        await fetch(
            `${FAVORITES_API}/${numericId}`,
            {
                method:
                    "POST",

                headers: {
                    "Accept":
                        "application/json"
                }
            }
        );


    /*
     * Handle backend errors.
     */

    if (
        !response.ok
    ) {

        let message =
            `Favorite request failed. HTTP ${response.status}`;


        try {

            const errorData =
                await response.json();


            if (
                errorData.message
            ) {

                message =
                    errorData.message;

            }

            else if (
                errorData.error
            ) {

                message =
                    errorData.error;

            }

        }

        catch {

            /*
             * Ignore invalid JSON.
             */

        }


        throw new Error(
            message
        );

    }


    /*
     * Return backend response.
     */

    return await response.json();

}


/* =========================================================
   REMOVE FAVORITE
   ========================================================= */

async function removeFavoriteFromBackend(
    songId
) {

    const numericId =
        Number(songId);


    if (
        !Number.isInteger(
            numericId
        ) ||
        numericId <= 0
    ) {

        throw new Error(
            `Invalid song ID: ${songId}`
        );

    }


    const response =
        await fetch(
            `${FAVORITES_API}/${numericId}`,
            {
                method:
                    "DELETE",

                headers: {
                    "Accept":
                        "application/json"
                }
            }
        );


    if (
        !response.ok &&
        response.status !== 204
    ) {

        let message =
            `Remove favorite failed. HTTP ${response.status}`;


        try {

            const errorData =
                await response.json();


            if (
                errorData.message
            ) {

                message =
                    errorData.message;

            }

            else if (
                errorData.error
            ) {

                message =
                    errorData.error;

            }

        }

        catch {

            /*
             * Ignore invalid JSON.
             */

        }


        throw new Error(
            message
        );

    }


    return true;

}


/* =========================================================
   CHECK BACKEND
   ========================================================= */

async function checkBackendConnection() {

    try {

        const response =
            await fetch(
                SONGS_API
            );


        return response.ok;

    }

    catch (
        error
    ) {

        console.error(
            "Backend connection failed:",
            error
        );


        return false;

    }

}


/* =========================================================
   GLOBAL
   ========================================================= */

window.API_BASE_URL =
    API_BASE_URL;

window.SOUND_SYNC_IMAGE =
    SOUND_SYNC_IMAGE;

window.loadSongsFromBackend =
    loadSongsFromBackend;

window.getSongs =
    getSongs;

window.getSongById =
    getSongById;

window.getAudioUrl =
    getAudioUrl;

window.uploadSongs =
    uploadSongs;

window.deleteSongFromBackend =
    deleteSongFromBackend;

window.fetchFavorites =
    fetchFavorites;

window.addFavoriteToBackend =
    addFavoriteToBackend;

window.removeFavoriteFromBackend =
    removeFavoriteFromBackend;

window.checkBackendConnection =
    checkBackendConnection;