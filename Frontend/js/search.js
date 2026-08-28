/*
 * =========================================================
 * SOUNDSYNC
 * SEARCH
 * =========================================================
 *
 * Search is used only for the local SoundSync
 * song library.
 *
 * Search:
 *
 *     User types song name
 *             ↓
 *        Filter songs
 *             ↓
 *        Display results
 *
 * No Playlist
 * No Recently Played
 *
 * =========================================================
 */


/* =========================================================
   ELEMENTS
   ========================================================= */

const searchInput =
    document.getElementById(
        "searchInput"
    );


const clearSearchButton =
    document.getElementById(
        "clearSearch"
    );


/* =========================================================
   SEARCH SONGS
   ========================================================= */

function performSearch(
    searchText
) {

    /*
     * Make sure songs are available.
     */

    const songs =
        typeof getSongs ===
            "function"
            ? getSongs()
            : [];


    /*
     * Clean search text.
     */

    const query =
        String(
            searchText ?? ""
        )
        .trim()
        .toLowerCase();


    /*
     * Empty search.
     *
     * Show all songs again.
     */

    if (
        query.length === 0
    ) {

        renderHome();

        renderAllSongs();

        updateClearButton(
            false
        );

        return;

    }


    /*
     * Search:
     *
     * song name
     *
     * file name
     */

    const filteredSongs =
        songs.filter(
            song => {

                const songName =
                    String(
                        song.songName ??
                        ""
                    )
                    .toLowerCase();


                const fileName =
                    String(
                        song.fileName ??
                        ""
                    )
                    .toLowerCase();


                return (
                    songName.includes(
                        query
                    ) ||
                    fileName.includes(
                        query
                    )
                );

            }
        );


    /*
     * Update clear button.
     */

    updateClearButton(
        true
    );


    /*
     * Render search results
     * in Songs page.
     */

    const songsContainer =
        document.getElementById(
            "songsList"
        );


    if (
        songsContainer
    ) {

        renderSongRows(
            filteredSongs,
            songsContainer
        );

    }


    /*
     * Also update Home song grid.
     */

    const homeContainer =
        document.getElementById(
            "popularSongs"
        );


    if (
        homeContainer
    ) {

        if (
            filteredSongs.length === 0
        ) {

            homeContainer.innerHTML = `

                <div class="empty-state">

                    <i
                        class="fa-solid fa-magnifying-glass"
                    ></i>


                    <h3>
                        NO SONGS FOUND
                    </h3>


                    <p>
                        TRY A DIFFERENT SEARCH.
                    </p>

                </div>

            `;

        }

        else {

            homeContainer.innerHTML =
                filteredSongs
                    .slice(
                        0,
                        8
                    )
                    .map(
                        song =>
                            createSongCard(
                                song
                            )
                    )
                    .join("");

        }

    }

}


/* =========================================================
   CLEAR SEARCH BUTTON
   ========================================================= */

function updateClearButton(
    show
) {

    if (
        !clearSearchButton
    ) {

        return;

    }


    clearSearchButton.classList.toggle(
        "show",
        show
    );

}


/* =========================================================
   CLEAR SEARCH
   ========================================================= */

function clearSearch() {

    if (
        !searchInput
    ) {

        return;

    }


    searchInput.value =
        "";


    updateClearButton(
        false
    );


    /*
     * Restore all songs.
     */

    renderHome();

    renderAllSongs();

}


/* =========================================================
   SEARCH INPUT EVENT
   ========================================================= */

if (
    searchInput
) {

    searchInput.addEventListener(
        "input",
        event => {

            performSearch(
                event.target.value
            );

        }
    );


    /*
     * Press ENTER.
     *
     * Show Songs page.
     */

    searchInput.addEventListener(
        "keydown",
        event => {

            if (
                event.key !==
                "Enter"
            ) {

                return;

            }


            const value =
                searchInput.value.trim();


            if (
                value.length > 0
            ) {

                showSection(
                    "songs"
                );

            }

        }
    );

}


/* =========================================================
   CLEAR BUTTON EVENT
   ========================================================= */

if (
    clearSearchButton
) {

    clearSearchButton.addEventListener(
        "click",
        clearSearch
    );

}


/* =========================================================
   GLOBAL FUNCTIONS
   ========================================================= */

window.performSearch =
    performSearch;


window.clearSearch =
    clearSearch;


window.updateClearButton =
    updateClearButton;