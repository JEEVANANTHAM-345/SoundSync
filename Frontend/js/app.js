/*
 * =========================================================
 * SOUNDSYNC
 * MAIN APPLICATION
 * =========================================================
 */


/* =========================================================
   CURRENT SECTION
   =========================================================
   
   IMPORTANT:
   Store the current page in sessionStorage so that
   if the browser reloads after uploading a song,
   SoundSync returns to the same page instead of Home.
   ========================================================= */

let currentSection =
    sessionStorage.getItem(
        "soundsync_current_section"
    ) || "home";


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

    setupNavigation();

    setupMobileMenu();

    setupSongFileSelection();

    setupDJControls();


    try {

        await loadSongsFromBackend();

        await loadFavoritesFromBackend();


        renderHome();

        renderAllSongs();

        renderFavoriteSongs();


        /*
         * IMPORTANT:
         *
         * Restore the page that was active before
         * a browser refresh/reload.
         */

        showSection(
            currentSection
        );

    }

    catch (error) {

        console.error(
            "SoundSync initialization failed:",
            error
        );


        renderHome();

        renderAllSongs();

        renderFavoriteSongs();


        /*
         * Even if backend is unavailable,
         * restore the previous section.
         */

        showSection(
            currentSection
        );


        showToast(
            "BACKEND IS NOT CONNECTED"
        );

    }

}


/* =========================================================
   SAVE CURRENT SECTION
   ========================================================= */

function saveCurrentSection(
    sectionName
) {

    currentSection =
        sectionName;


    sessionStorage.setItem(
        "soundsync_current_section",
        sectionName
    );

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


    if (
        !fileInput
    ) {

        console.error(
            "songFileInput was not found."
        );

        return;

    }


    /*
     * =====================================================
     * TOP ADD SONGS BUTTON
     * =====================================================
     */

    if (
        topAddButton
    ) {

        topAddButton.addEventListener(
            "click",
            () => {

                /*
                 * Save whichever page the user
                 * is currently viewing.
                 */

                saveCurrentSection(
                    currentSection
                );


                fileInput.dataset.sourceSection =
                    currentSection;


                fileInput.click();

            }
        );

    }


    /*
     * =====================================================
     * SONGS PAGE ADD SONGS BUTTON
     * =====================================================
     */

    if (
        pageAddButton
    ) {

        pageAddButton.addEventListener(
            "click",
            () => {

                /*
                 * This button is specifically
                 * located on the Songs page.
                 */

                saveCurrentSection(
                    "songs"
                );


                fileInput.dataset.sourceSection =
                    "songs";


                fileInput.click();

            }
        );

    }


    /*
     * =====================================================
     * FILE SELECTED
     * =====================================================
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


            /*
             * Get the page that was active BEFORE
             * the file picker was opened.
             */

            const sourceSection =
                fileInput.dataset.sourceSection ||
                currentSection ||
                "home";


            /*
             * Save it again so even a browser reload
             * knows where the user came from.
             */

            saveCurrentSection(
                sourceSection
            );


            console.log(
                "Upload source:",
                sourceSection
            );


            showToast(
                "UPLOADING SONGS..."
            );


            try {

                /*
                 * Upload songs.
                 */

                const result =
                    await uploadSongs(
                        files
                    );


                /*
                 * Reload songs from backend.
                 */

                await loadSongsFromBackend();


                /*
                 * Reload favorites.

                 */

                await loadFavoritesFromBackend();


                /*
                 * Refresh all data.
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
                 * Restore original page.
                 */

                saveCurrentSection(
                    sourceSection
                );


                showSection(
                    sourceSection
                );

            }

            catch (error) {

                console.error(
                    "Song upload failed:",
                    error
                );


                /*
                 * Keep the original page even
                 * when upload fails.
                 */

                saveCurrentSection(
                    sourceSection
                );


                showSection(
                    sourceSection
                );


                showToast(
                    error.message ||
                    "SONG UPLOAD FAILED"
                );

            }


            /*
             * Clear input.
             *
             * Allows selecting the same file again.
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


    setCurrentPlaylist(
        songs
    );


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

        await deleteSongFromBackend(
            songId
        );


        await loadSongsFromBackend();


        await loadFavoritesFromBackend();


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


    document
        .querySelectorAll(
            "[data-section]"
        )
        .forEach(
            element => {

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

    const validSections = [
        "home",
        "songs",
        "favorites",
        "dj"
    ];


    if (
        !validSections.includes(
            sectionName
        )
    ) {

        sectionName =
            "home";

    }


    /*
     * IMPORTANT:
     *
     * Save the selected page immediately.
     */

    saveCurrentSection(
        sectionName
    );


    /*
     * Hide all sections.
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
     * Update navigation.

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
     * Refresh page.

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
     * Close mobile sidebar.

     */

    const sidebar =
        document.querySelector(
            ".sidebar"
        );


    if (
        sidebar &&
        window.innerWidth <= 760
    ) {

        sidebar.classList.remove(
            "mobile-open"
        );

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
   DJ SONG DISPLAY
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