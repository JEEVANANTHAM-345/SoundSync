/*
 * =========================================================
 * SOUNDSYNC
 * MAIN APPLICATION
 * =========================================================
 *
 * Features:
 *
 * ✅ Add Songs
 * ✅ Song Library
 * ✅ Search
 * ✅ Favorites
 * ✅ DJ Mode
 * ✅ LET'S GO
 * ✅ Spacebar volume ducking
 *
 * Not included:
 *
 * ❌ Playlists
 * ❌ Recently Played
 *
 * =========================================================
 */


/* =========================================================
   START APPLICATION
   ========================================================= */

document.addEventListener(
    "DOMContentLoaded",
    initializeApplication
);


/* =========================================================
   INITIALIZE APPLICATION
   ========================================================= */

async function initializeApplication() {

    /*
     * Setup interface.
     */

    setupNavigation();

    setupMobileMenu();

    setupSongFileSelection();

    setupDJControls();


    /*
     * Load songs and favorites
     * from the backend.
     */

    try {

        await loadSongsFromBackend();

        await loadFavoritesFromBackend();


        /*
         * Render the Home page.
         */

        renderHome();


        /*
         * Render Songs page.
         */

        renderAllSongs();


        /*
         * Render Favorites page.
         */

        renderFavoriteSongs();

    }

    catch (error) {

        console.error(
            "SoundSync initialization failed:",
            error
        );


        /*
         * Still render the interface
         * even if backend is unavailable.
         */

        renderHome();

        renderAllSongs();

        renderFavoriteSongs();


        showToast(
            "BACKEND IS NOT CONNECTED"
        );

    }

}


/* =========================================================
   SONG FILE SELECTION
   ========================================================= */

function setupSongFileSelection() {

    const topAddButton =
        document.getElementById(
            "addSongsBtn"
        );


    const pageAddButton =
        document.getElementById(
            "addSongsBtnPage"
        );


    const fileInput =
        document.getElementById(
            "songFileInput"
        );


    /*
     * Make sure file input exists.
     */

    if (
        !fileInput
    ) {

        console.error(
            "songFileInput was not found."
        );

        return;

    }


    /*
     * Top ADD SONGS button.
     */

    if (
        topAddButton
    ) {

        topAddButton.addEventListener(
            "click",
            () => {

                fileInput.click();

            }
        );

    }


    /*
     * Songs page ADD SONGS button.
     */

    if (
        pageAddButton
    ) {

        pageAddButton.addEventListener(
            "click",
            () => {

                fileInput.click();

            }
        );

    }


    /*
     * File selected.
     */

    fileInput.addEventListener(
        "change",
        async event => {

            const files =
                Array.from(
                    event.target.files || []
                );


            if (
                files.length === 0
            ) {

                return;

            }


            showToast(
                "UPLOADING SONGS..."
            );


            try {

                /*
                 * Upload through backend.
                 */

                const result =
                    await uploadSongs(
                        files
                    );


                /*
                 * Reload songs from MySQL.
                 */

                await loadSongsFromBackend();


                /*
                 * Refresh UI.
                 */

                renderHome();

                renderAllSongs();

                renderFavoriteSongs();


                /*
                 * Success message.
                 */

                if (
                    result &&
                    Array.isArray(
                        result.results
                    ) &&
                    result.results.length > 0
                ) {

                    showToast(
                        `${result.results.length} SONG${result.results.length > 1 ? "S" : ""} UPLOADED`
                    );

                }


                /*
                 * Failed files.
                 */

                if (
                    result &&
                    Array.isArray(
                        result.errors
                    ) &&
                    result.errors.length > 0
                ) {

                    console.error(
                        "Upload errors:",
                        result.errors
                    );


                    showToast(
                        "SOME SONGS FAILED"
                    );

                }


                /*
                 * Open Songs page.
                 */

                showSection(
                    "songs"
                );

            }

            catch (error) {

                console.error(
                    "Song upload failed:",
                    error
                );


                showToast(
                    error.message ||
                    "SONG UPLOAD FAILED"
                );

            }


            /*
             * Clear input so the same
             * file can be selected again.
             */

            fileInput.value =
                "";

        }
    );

}


/* =========================================================
   HOME
   ========================================================= */

function renderHome() {

    const container =
        document.getElementById(
            "popularSongs"
        );


    if (
        !container
    ) {

        return;

    }


    const songs =
        getSongs();


    /*
     * No songs.
     */

    if (
        songs.length === 0
    ) {

        container.innerHTML = `

            <div class="empty-state">

                <i
                    class="fa-solid fa-music"
                ></i>


                <h3>
                    NO SONGS YET
                </h3>


                <p>
                    ADD YOUR MUSIC TO START.
                </p>

            </div>

        `;

        return;

    }


    /*
     * Show songs.
     */

    container.innerHTML =
        songs
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


/* =========================================================
   CREATE SONG CARD
   ========================================================= */

function createSongCard(
    song
) {

    const favorite =
        typeof isFavorite ===
            "function"
            ? isFavorite(
                song.id
            )
            : false;


    return `

        <article
            class="song-card"
        >


            <div
                class="song-image-container"
            >


                <img
                    class="song-image"
                    src="${SOUND_SYNC_IMAGE}"
                    alt="SoundSync"
                    draggable="false"
                >


                <!-- PLAY -->

                <button
                    class="song-play"
                    type="button"
                    title="Play"
                    onclick="
                        playSongFromList(${song.id})
                    "
                >

                    <i
                        class="fa-solid fa-play"
                    ></i>

                </button>


                <!-- FAVORITE -->

                <button
                    class="favorite-btn ${favorite ? "active" : ""}"
                    type="button"
                    title="Favorite"
                    onclick="
                        toggleFavorite(${song.id})
                    "
                >

                    <i
                        class="fa-${favorite ? "solid" : "regular"} fa-heart"
                    ></i>

                </button>


            </div>


            <div
                class="song-title"
                title="${escapeHtml(
                    song.songName
                )}"
            >

                ${escapeHtml(
                    song.songName
                )}

            </div>


        </article>

    `;

}


/* =========================================================
   SONGS PAGE
   ========================================================= */

function renderAllSongs() {

    const container =
        document.getElementById(
            "songsList"
        );


    if (
        !container
    ) {

        return;

    }


    renderSongRows(
        getSongs(),
        container
    );

}


/* =========================================================
   RENDER SONG ROWS
   ========================================================= */

function renderSongRows(
    songList,
    container
) {

    if (
        !container
    ) {

        return;

    }


    if (
        !Array.isArray(songList) ||
        songList.length === 0
    ) {

        container.innerHTML = `

            <div class="empty-state">

                <i
                    class="fa-solid fa-music"
                ></i>


                <h3>
                    NO SONGS FOUND
                </h3>


                <p>
                    ADD YOUR MUSIC TO SOUNDSYNC.
                </p>

            </div>

        `;

        return;

    }


    container.innerHTML =
        songList
            .map(
                song => {

                    const favorite =
                        typeof isFavorite ===
                            "function"
                            ? isFavorite(
                                song.id
                            )
                            : false;


                    return `

                        <div
                            class="song-row"
                        >


                            <img
                                class="song-row-image"
                                src="${SOUND_SYNC_IMAGE}"
                                alt="SoundSync"
                                draggable="false"
                            >


                            <div
                                class="song-row-info"
                            >

                                <h4>
                                    ${escapeHtml(
                                        song.songName
                                    )}
                                </h4>

                            </div>


                            <div
                                class="song-row-actions"
                            >


                                <!-- FAVORITE -->

                                <button
                                    class="icon-btn ${favorite ? "active" : ""}"
                                    type="button"
                                    title="Favorite"
                                    onclick="
                                        toggleFavorite(${song.id})
                                    "
                                >

                                    <i
                                        class="fa-${favorite ? "solid" : "regular"} fa-heart"
                                    ></i>

                                </button>


                                <!-- PLAY -->

                                <button
                                    class="icon-btn"
                                    type="button"
                                    title="Play"
                                    onclick="
                                        playSongFromList(${song.id})
                                    "
                                >

                                    <i
                                        class="fa-solid fa-play"
                                    ></i>

                                </button>


                                <!-- DELETE -->

                                <button
                                    class="icon-btn delete-song"
                                    type="button"
                                    title="Delete"
                                    onclick="
                                        deleteSong(${song.id})
                                    "
                                >

                                    <i
                                        class="fa-solid fa-trash"
                                    ></i>

                                </button>


                            </div>


                        </div>

                    `;

                }
            )
            .join("");

}


/* =========================================================
   PLAY SONG FROM LIST
   ========================================================= */

function playSongFromList(
    songId
) {

    const songs =
        getSongs();


    if (
        !Array.isArray(songs) ||
        songs.length === 0
    ) {

        showToast(
            "NO SONGS AVAILABLE"
        );

        return;

    }


    /*
     * Find selected song.
     */

    const index =
        songs.findIndex(
            song =>
                Number(
                    song.id
                ) ===
                Number(
                    songId
                )
        );


    if (
        index === -1
    ) {

        showToast(
            "SONG NOT FOUND"
        );

        return;

    }


    /*
     * Use entire library as
     * current playback list.
     */

    setCurrentPlaylist(
        songs
    );


    /*
     * Load selected song.
     */

    loadSong(
        index
    );

}


/* =========================================================
   DELETE SONG
   ========================================================= */

async function deleteSong(
    songId
) {

    const song =
        getSongById(
            songId
        );


    if (
        !song
    ) {

        showToast(
            "SONG NOT FOUND"
        );

        return;

    }


    /*
     * Confirm deletion.
     */

    const confirmed =
        window.confirm(
            `Delete "${song.songName}" from SoundSync?`
        );


    if (
        !confirmed
    ) {

        return;

    }


    try {

        /*
         * Stop playback if this is
         * the currently loaded song.
         */

        const currentSong =
            typeof currentPlaylist !==
                "undefined" &&
            currentPlaylist[
                currentSongIndex
            ];


        if (
            currentSong &&
            Number(
                currentSong.id
            ) ===
            Number(
                songId
            )
        ) {

            audioPlayer.pause();

            audioPlayer.removeAttribute(
                "src"
            );

            audioPlayer.load();


            /*
             * Reset player UI.
             */

            const title =
                document.getElementById(
                    "currentSongTitle"
                );


            const artist =
                document.getElementById(
                    "currentSongArtist"
                );


            const image =
                document.getElementById(
                    "currentSongImage"
                );


            if (
                title
            ) {

                title.textContent =
                    "NO SONG SELECTED";

            }


            if (
                artist
            ) {

                artist.textContent =
                    "SELECT A SONG TO START";

            }


            if (
                image
            ) {

                image.src =
                    SOUND_SYNC_IMAGE;

            }


            if (
                typeof updatePlayButton ===
                "function"
            ) {

                updatePlayButton(
                    false
                );

            }

        }


        /*
         * Delete from backend.
         */

        await deleteSongFromBackend(
            songId
        );


        /*
         * Reload songs.
         */

        await loadSongsFromBackend();


        /*
         * Reload favorites.
         */

        await loadFavoritesFromBackend();


        /*
         * Refresh all visible UI.
         */

        renderHome();

        renderAllSongs();

        renderFavoriteSongs();


        showToast(
            `REMOVED: ${song.songName}`
        );

    }

    catch (error) {

        console.error(
            "Delete song failed:",
            error
        );


        showToast(
            "FAILED TO DELETE SONG"
        );

    }

}


/* =========================================================
   NAVIGATION
   ========================================================= */

function setupNavigation() {

    /*
     * Navigation buttons.
     */

    document
        .querySelectorAll(
            ".nav-item"
        )
        .forEach(
            item => {

                item.addEventListener(
                    "click",
                    () => {

                        const section =
                            item.dataset.section;


                        if (
                            !section
                        ) {

                            return;

                        }


                        showSection(
                            section
                        );

                    }
                );

            }
        );


    /*
     * Buttons such as:
     *
     * VIEW ALL
     * EXPLORE MUSIC
     */

    document
        .querySelectorAll(
            "[data-section]"
        )
        .forEach(
            element => {

                /*
                 * Avoid attaching another listener
                 * to navigation items.
                 */

                if (
                    element.classList.contains(
                        "nav-item"
                    )
                ) {

                    return;

                }


                element.addEventListener(
                    "click",
                    () => {

                        const section =
                            element.dataset.section;


                        if (
                            section
                        ) {

                            showSection(
                                section
                            );

                        }

                    }
                );

            }
        );

}


/* =========================================================
   SHOW SECTION
   ========================================================= */

function showSection(
    sectionName
) {

    /*
     * Hide sections.
     */

    document
        .querySelectorAll(
            ".page-section"
        )
        .forEach(
            section => {

                section.classList.remove(
                    "active-section"
                );

            }
        );


    /*
     * Show selected section.
     */

    const target =
        document.getElementById(
            `${sectionName}Section`
        );


    if (
        target
    ) {

        target.classList.add(
            "active-section"
        );

    }


    /*
     * Update navigation state.
     */

    document
        .querySelectorAll(
            ".nav-item"
        )
        .forEach(
            item => {

                item.classList.toggle(
                    "active",
                    item.dataset.section ===
                        sectionName
                );

            }
        );


    /*
     * Refresh selected page.
     */

    switch (
        sectionName
    ) {

        case "home":

            renderHome();

            break;


        case "songs":

            renderAllSongs();

            break;


        case "favorites":

            renderFavoriteSongs();

            break;


        case "dj":

            updateDJSongDisplay();

            break;

    }


    /*
     * Scroll to top.
     */

    window.scrollTo({
        top: 0,
        left: 0,
        behavior: "smooth"
    });

}


/* =========================================================
   MOBILE MENU
   ========================================================= */

function setupMobileMenu() {

    const mobileMenu =
        document.getElementById(
            "mobileMenu"
        );


    const sidebar =
        document.querySelector(
            ".sidebar"
        );


    if (
        !mobileMenu ||
        !sidebar
    ) {

        return;

    }


    mobileMenu.addEventListener(
        "click",
        () => {

            sidebar.classList.toggle(
                "mobile-open"
            );

        }
    );


    /*
     * Close mobile menu after
     * selecting a page.
     */

    document
        .querySelectorAll(
            ".nav-item"
        )
        .forEach(
            item => {

                item.addEventListener(
                    "click",
                    () => {

                        sidebar.classList.remove(
                            "mobile-open"
                        );

                    }
                );

            }
        );

}


/* =========================================================
   DJ CONTROLS
   ========================================================= */

function setupDJControls() {

    const speedControl =
        document.getElementById(
            "speedControl"
        );


    const volumeControl =
        document.getElementById(
            "djVolume"
        );


    const bassControl =
        document.getElementById(
            "bassControl"
        );


    const trebleControl =
        document.getElementById(
            "trebleControl"
        );


    const speedValue =
        document.getElementById(
            "speedValue"
        );


    /*
     * SPEED
     */

    if (
        speedControl
    ) {

        speedControl.addEventListener(
            "input",
            () => {

                const value =
                    Number(
                        speedControl.value
                    );


                if (
                    typeof setPlaybackSpeed ===
                    "function"
                ) {

                    setPlaybackSpeed(
                        value
                    );

                }


                if (
                    speedValue
                ) {

                    speedValue.textContent =
                        `${value.toFixed(1)}X`;

                }

            }
        );

    }


    /*
     * VOLUME
     */

    if (
        volumeControl
    ) {

        volumeControl.addEventListener(
            "input",
            () => {

                const value =
                    Number(
                        volumeControl.value
                    );


                if (
                    typeof audioPlayer !==
                        "undefined"
                ) {

                    audioPlayer.volume =
                        value;

                }


                const volumeBar =
                    document.getElementById(
                        "volumeBar"
                    );


                if (
                    volumeBar
                ) {

                    volumeBar.value =
                        value;

                }


                if (
                    typeof updateMuteIcon ===
                    "function"
                ) {

                    updateMuteIcon();

                }

            }
        );

    }


    /*
     * BASS
     */

    if (
        bassControl
    ) {

        bassControl.addEventListener(
            "input",
            () => {

                if (
                    typeof setBass ===
                    "function"
                ) {

                    setBass(
                        bassControl.value
                    );

                }

            }
        );

    }


    /*
     * TREBLE
     */

    if (
        trebleControl
    ) {

        trebleControl.addEventListener(
            "input",
            () => {

                if (
                    typeof setTreble ===
                    "function"
                ) {

                    setTreble(
                        trebleControl.value
                    );

                }

            }
        );

    }

}


/* =========================================================
   UPDATE DJ SONG
   ========================================================= */

function updateDJSongDisplay() {

    const djSongName =
        document.getElementById(
            "djSongName"
        );


    if (
        !djSongName
    ) {

        return;

    }


    /*
     * currentPlaylist and
     * currentSongIndex are created
     * by player.js.
     */

    if (
        typeof currentPlaylist ===
            "undefined" ||
        typeof currentSongIndex ===
            "undefined"
    ) {

        djSongName.textContent =
            "NO SONG SELECTED";

        return;

    }


    const song =
        currentPlaylist[
            currentSongIndex
        ];


    if (
        song
    ) {

        djSongName.textContent =
            song.songName;

    }

    else {

        djSongName.textContent =
            "NO SONG SELECTED";

    }

}


/* =========================================================
   ESCAPE HTML
   ========================================================= */

function escapeHtml(
    value
) {

    const element =
        document.createElement(
            "div"
        );


    element.textContent =
        value ?? "";


    return element.innerHTML;

}


/* =========================================================
   TOAST
   ========================================================= */

function showToast(
    message
) {

    const toast =
        document.getElementById(
            "toast"
        );


    if (
        !toast
    ) {

        console.log(
            message
        );

        return;

    }


    toast.textContent =
        message;


    toast.classList.add(
        "show"
    );


    clearTimeout(
        window.soundSyncToast
    );


    window.soundSyncToast =
        setTimeout(
            () => {

                toast.classList.remove(
                    "show"
                );

            },
            2200
        );

}


/* =========================================================
   GLOBAL FUNCTIONS
   ========================================================= */

window.initializeApplication =
    initializeApplication;


window.renderHome =
    renderHome;


window.renderAllSongs =
    renderAllSongs;


window.renderSongRows =
    renderSongRows;


window.createSongCard =
    createSongCard;


window.playSongFromList =
    playSongFromList;


window.deleteSong =
    deleteSong;


window.showSection =
    showSection;


window.showToast =
    showToast;


window.updateDJSongDisplay =
    updateDJSongDisplay;


window.escapeHtml =
    escapeHtml;