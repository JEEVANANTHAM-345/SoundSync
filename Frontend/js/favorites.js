/*
 * =========================================================
 * SOUNDSYNC
 * FAVORITES
 * =========================================================
 *
 * Favorites:
 *
 * Song
 *   ↓
 * ❤️ Favorite
 *   ↓
 * Spring Boot
 *   ↓
 * MySQL
 *
 * =========================================================
 */


/* =========================================================
   FAVORITE STATE
   ========================================================= */

let favoriteSongIds = [];


/* =========================================================
   LOAD FAVORITES
   ========================================================= */

async function loadFavoritesFromBackend() {

    try {

        const favorites =
            await fetchFavorites();


        /*
         * Convert backend favorite objects
         * into song IDs.
         *
         * Example:
         *
         * [
         *   {
         *      id: 1,
         *      song: {
         *          id: 5
         *      }
         *   }
         * ]
         *
         * becomes:
         *
         * [5]
         */

        favoriteSongIds =
            Array.isArray(
                favorites
            )
                ? favorites
                    .map(
                        favorite =>
                            favorite?.song?.id ??
                            favorite?.songId ??
                            favorite?.song?.songId
                    )
                    .filter(
                        id =>
                            id !== null &&
                            id !== undefined
                    )
                    .map(
                        id =>
                            Number(id)
                    )
                : [];


        return favoriteSongIds;

    }

    catch (
        error
    ) {

        console.error(
            "Failed to load favorites:",
            error
        );


        favoriteSongIds =
            [];


        return [];

    }

}


/* =========================================================
   CHECK FAVORITE
   ========================================================= */

function isFavorite(
    songId
) {

    return favoriteSongIds.includes(
        Number(songId)
    );

}


/* =========================================================
   ADD FAVORITE
   ========================================================= */

async function addFavorite(
    songId
) {

    const numericSongId =
        Number(
            songId
        );


    try {

        /*
         * Send to backend.
         */

        await addFavoriteToBackend(
            numericSongId
        );


        /*
         * Update local state.
         */

        if (
            !favoriteSongIds.includes(
                numericSongId
            )
        ) {

            favoriteSongIds.push(
                numericSongId
            );

        }


        return true;

    }

    catch (
        error
    ) {

        console.error(
            "Failed to add favorite:",
            error
        );


        return false;

    }

}


/* =========================================================
   REMOVE FAVORITE
   ========================================================= */

async function removeFavorite(
    songId
) {

    const numericSongId =
        Number(
            songId
        );


    try {

        /*
         * Send delete request.
         */

        await removeFavoriteFromBackend(
            numericSongId
        );


        /*
         * Remove from local state.
         */

        favoriteSongIds =
            favoriteSongIds.filter(
                id =>
                    Number(id) !==
                    numericSongId
            );


        return true;

    }

    catch (
        error
    ) {

        console.error(
            "Failed to remove favorite:",
            error
        );


        return false;

    }

}


/* =========================================================
   TOGGLE FAVORITE
   ========================================================= */

async function toggleFavorite(
    songId
) {

    const numericSongId =
        Number(
            songId
        );


    /*
     * Check current state.
     */

    const currentlyFavorite =
        isFavorite(
            numericSongId
        );


    /* -----------------------------------------------------
       REMOVE
       ----------------------------------------------------- */

    if (
        currentlyFavorite
    ) {

        const success =
            await removeFavorite(
                numericSongId
            );


        if (
            !success
        ) {

            showToast(
                "FAILED TO REMOVE FAVORITE"
            );

            return;

        }


        showToast(
            "REMOVED FROM FAVORITES"
        );

    }


    /* -----------------------------------------------------
       ADD
       ----------------------------------------------------- */

    else {

        const success =
            await addFavorite(
                numericSongId
            );


        if (
            !success
        ) {

            showToast(
                "FAILED TO ADD FAVORITE"
            );

            return;

        }


        showToast(
            "ADDED TO FAVORITES"
        );

    }


    /*
     * Refresh interface.
     */

    renderHome();

    renderAllSongs();

    renderFavoriteSongs();


    /*
     * Refresh player heart.
     */

    if (
        typeof updatePlayerFavorite ===
        "function"
    ) {

        updatePlayerFavorite();

    }

}


/* =========================================================
   GET FAVORITE SONGS
   ========================================================= */

function getFavoriteSongs() {

    const songs =
        typeof getSongs ===
            "function"
            ? getSongs()
            : [];


    return songs.filter(
        song =>
            isFavorite(
                song.id
            )
    );

}


/* =========================================================
   RENDER FAVORITES
   ========================================================= */

function renderFavoriteSongs() {

    const container =
        document.getElementById(
            "favoriteSongs"
        );


    if (
        !container
    ) {

        return;

    }


    const favoriteSongs =
        getFavoriteSongs();


    /*
     * No favorites.
     */

    if (
        favoriteSongs.length === 0
    ) {

        container.innerHTML = `

            <div class="empty-state">

                <i
                    class="fa-regular fa-heart"
                ></i>


                <h3>
                    NO FAVORITES YET
                </h3>


                <p>
                    TAP THE HEART TO SAVE A SONG.
                </p>

            </div>

        `;

        return;

    }


    /*
     * Reuse the common song list renderer.
     */

    renderSongRows(
        favoriteSongs,
        container
    );

}


/* =========================================================
   REFRESH FAVORITES
   ========================================================= */

async function refreshFavorites() {

    await loadFavoritesFromBackend();


    renderFavoriteSongs();


    renderAllSongs();


    renderHome();


    if (
        typeof updatePlayerFavorite ===
        "function"
    ) {

        updatePlayerFavorite();

    }

}


/* =========================================================
   GLOBAL FUNCTIONS
   ========================================================= */

window.loadFavoritesFromBackend =
    loadFavoritesFromBackend;


window.isFavorite =
    isFavorite;


window.addFavorite =
    addFavorite;


window.removeFavorite =
    removeFavorite;


window.toggleFavorite =
    toggleFavorite;


window.getFavoriteSongs =
    getFavoriteSongs;


window.renderFavoriteSongs =
    renderFavoriteSongs;


window.refreshFavorites =
    refreshFavorites;