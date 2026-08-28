/* =========================================================
   SOUNDSYNC
   MUSIC PLAYER
   =========================================================
*/


/* =========================================================
   AUDIO ELEMENT
   ========================================================= */

const audioPlayer =
    document.getElementById("audioPlayer");


/* =========================================================
   PLAYER ELEMENTS
   ========================================================= */

const playPauseBtn =
    document.getElementById("playPauseBtn");

const previousBtn =
    document.getElementById("previousBtn");

const nextBtn =
    document.getElementById("nextBtn");

const shuffleBtn =
    document.getElementById("shuffleBtn");

const repeatBtn =
    document.getElementById("repeatBtn");

const progressBar =
    document.getElementById("progressBar");

const volumeBar =
    document.getElementById("volumeBar");

const currentTimeElement =
    document.getElementById("currentTime");

const durationElement =
    document.getElementById("duration");

const currentSongTitle =
    document.getElementById("currentSongTitle");

const currentSongArtist =
    document.getElementById("currentSongArtist");

const currentSongImage =
    document.getElementById("currentSongImage");

const playerFavorite =
    document.getElementById("playerFavorite");

const djSongName =
    document.getElementById("djSongName");

const djCoverImage =
    document.getElementById("djCoverImage");

const visualizerBars =
    document.getElementById("visualizerBars");

const letsGoBtn =
    document.getElementById("letsGoBtn");

const muteBtn =
    document.getElementById("muteBtn");


/* =========================================================
   PLAYER STATE
   ========================================================= */

let currentPlaylist = [];

let currentSongIndex = -1;

let isShuffle = false;

let isRepeat = false;


/* =========================================================
   LET'S GO STATE
   ========================================================= */

let isVolumeDucking = false;

let savedVolume = 1;

let spacebarHeld = false;


/* =========================================================
   AUDIO EFFECT STATE
   ========================================================= */

let audioContext = null;

let sourceNode = null;

let bassFilter = null;

let trebleFilter = null;


/* =========================================================
   SET PLAYLIST
   ========================================================= */

function setCurrentPlaylist(
    songs
) {

    currentPlaylist =
        Array.isArray(songs)
            ? [...songs]
            : [];


    /*
     * If the current song still exists,
     * keep it selected.
     */

    if (
        currentSongIndex >= 0 &&
        currentSongIndex <
            currentPlaylist.length
    ) {

        return;

    }


    currentSongIndex = -1;

}


/* =========================================================
   GET AUDIO URL
   ========================================================= */

function getPlayerAudioUrl(
    songId
) {

    if (
        typeof getAudioUrl ===
        "function"
    ) {

        return getAudioUrl(
            songId
        );

    }


    return (
        "http://localhost:8080/api/songs/" +
        songId +
        "/audio"
    );

}


/* =========================================================
   INITIALIZE AUDIO EFFECTS
   ========================================================= */

function initializeAudioEffects() {

    if (
        audioContext
    ) {

        return true;

    }


    const AudioContextClass =
        window.AudioContext ||
        window.webkitAudioContext;


    if (
        !AudioContextClass
    ) {

        console.warn(
            "Web Audio API is not supported."
        );

        return false;

    }


    try {

        audioContext =
            new AudioContextClass();


        sourceNode =
            audioContext.createMediaElementSource(
                audioPlayer
            );


        bassFilter =
            audioContext.createBiquadFilter();


        bassFilter.type =
            "lowshelf";


        bassFilter.frequency.value =
            200;


        bassFilter.gain.value =
            0;


        trebleFilter =
            audioContext.createBiquadFilter();


        trebleFilter.type =
            "highshelf";


        trebleFilter.frequency.value =
            3000;


        trebleFilter.gain.value =
            0;


        sourceNode.connect(
            bassFilter
        );


        bassFilter.connect(
            trebleFilter
        );


        trebleFilter.connect(
            audioContext.destination
        );


        return true;

    }

    catch (
        error
    ) {

        console.error(
            "Audio effects initialization failed:",
            error
        );


        audioContext =
            null;


        return false;

    }

}


/* =========================================================
   RESUME AUDIO CONTEXT
   ========================================================= */

function resumeAudioContext() {

    if (
        audioContext &&
        audioContext.state ===
            "suspended"
    ) {

        audioContext
            .resume()
            .catch(
                error => {

                    console.warn(
                        "AudioContext resume failed:",
                        error
                    );

                }
            );

    }

}


/* =========================================================
   LOAD SONG
   ========================================================= */

function loadSong(
    index,
    autoplay = true
) {

    if (
        currentPlaylist.length === 0
    ) {

        showToast(
            "ADD SONGS FIRST"
        );

        return;

    }


    /*
     * Keep index inside the playlist.
     */

    if (
        index < 0
    ) {

        index =
            currentPlaylist.length - 1;

    }


    if (
        index >=
            currentPlaylist.length
    ) {

        index = 0;

    }


    const song =
        currentPlaylist[
            index
        ];


    if (
        !song ||
        song.id === null ||
        song.id === undefined
    ) {

        showToast(
            "INVALID SONG"
        );

        return;

    }


    /*
     * Stop current playback.
     */

    audioPlayer.pause();


    /*
     * Clear old source.
     */

    audioPlayer.removeAttribute(
        "src"
    );


    audioPlayer.load();


    /*
     * Set new song.
     */

    currentSongIndex =
        index;


    /*
     * Build backend audio URL.
     */

    const audioUrl =
        getPlayerAudioUrl(
            song.id
        );


    console.log(
        "Loading song:",
        song.songName
    );


    console.log(
        "Audio URL:",
        audioUrl
    );


    audioPlayer.src =
        audioUrl;


    audioPlayer.load();


    /*
     * Update player information.
     */

    if (
        currentSongTitle
    ) {

        currentSongTitle.textContent =
            song.songName ||
            "UNKNOWN SONG";

    }


    if (
        currentSongArtist
    ) {

        currentSongArtist.textContent =
            "LOCAL AUDIO";

    }


    /*
     * Use SoundSync cover.
     */

    if (
        typeof SOUND_SYNC_IMAGE !==
        "undefined"
    ) {

        if (
            currentSongImage
        ) {

            currentSongImage.src =
                SOUND_SYNC_IMAGE;

        }


        if (
            djCoverImage
        ) {

            djCoverImage.src =
                SOUND_SYNC_IMAGE;

        }

    }


    /*
     * Update DJ title.
     */

    if (
        djSongName
    ) {

        djSongName.textContent =
            song.songName ||
            "UNKNOWN SONG";

    }


    /*
     * Update favorite state.
     */

    updatePlayerFavorite();


    /*
     * Reset progress.

     */

    if (
        progressBar
    ) {

        progressBar.value =
            0;

    }


    if (
        currentTimeElement
    ) {

        currentTimeElement.textContent =
            "0:00";

    }


    if (
        durationElement
    ) {

        durationElement.textContent =
            "0:00";

    }


    /*
     * Play if required.
     */

    if (
        autoplay
    ) {

        playSong();

    }

}


/* =========================================================
   PLAY SONG
   ========================================================= */

async function playSong() {

    if (
        currentPlaylist.length === 0
    ) {

        showToast(
            "ADD SONGS FIRST"
        );

        return;

    }


    /*
     * If no song is currently loaded,
     * load the first song.
     */

    if (
        !audioPlayer.src ||
        audioPlayer.src ===
            window.location.href
    ) {

        if (
            currentSongIndex < 0
        ) {

            loadSong(
                0,
                false
            );

        }

    }


    /*
     * Resume audio effects if available.
     */

    initializeAudioEffects();

    resumeAudioContext();


    /*
     * Start browser audio playback.
     */

    try {

        await audioPlayer.play();


        updatePlayButton(
            true
        );

    }

    catch (
        error
    ) {

        console.error(
            "Unable to play song:",
            error
        );


        console.error(
            "Audio source:",
            audioPlayer.src
        );


        showToast(
            "UNABLE TO PLAY SONG"
        );

    }

}


/* =========================================================
   PAUSE SONG
   ========================================================= */

function pauseSong() {

    audioPlayer.pause();

    updatePlayButton(
        false
    );

}


/* =========================================================
   TOGGLE PLAY / PAUSE
   ========================================================= */

function togglePlayPause() {

    if (
        audioPlayer.paused
    ) {

        playSong();

    }
    else {

        pauseSong();

    }

}


/* =========================================================
   NEXT SONG
   ========================================================= */

function nextSong() {

    if (
        currentPlaylist.length === 0
    ) {

        return;

    }


    let nextIndex;


    if (
        isShuffle
    ) {

        if (
            currentPlaylist.length === 1
        ) {

            nextIndex = 0;

        }
        else {

            do {

                nextIndex =
                    Math.floor(
                        Math.random() *
                        currentPlaylist.length
                    );

            }
            while (
                nextIndex ===
                currentSongIndex
            );

        }

    }
    else {

        nextIndex =
            currentSongIndex + 1;


        if (
            nextIndex >=
                currentPlaylist.length
        ) {

            nextIndex = 0;

        }

    }


    loadSong(
        nextIndex,
        true
    );

}


/* =========================================================
   PREVIOUS SONG
   ========================================================= */

function previousSong() {

    if (
        currentPlaylist.length === 0
    ) {

        return;

    }


    /*
     * If the song has already played
     * for more than 3 seconds, restart it.
     */

    if (
        audioPlayer.currentTime > 3
    ) {

        audioPlayer.currentTime =
            0;

        return;

    }


    let previousIndex =
        currentSongIndex - 1;


    if (
        previousIndex < 0
    ) {

        previousIndex =
            currentPlaylist.length - 1;

    }


    loadSong(
        previousIndex,
        true
    );

}


/* =========================================================
   SHUFFLE
   ========================================================= */

function toggleShuffle() {

    isShuffle =
        !isShuffle;


    if (
        shuffleBtn
    ) {

        shuffleBtn.classList.toggle(
            "active",
            isShuffle
        );

    }


    showToast(
        isShuffle
            ? "SHUFFLE ON"
            : "SHUFFLE OFF"
    );

}


/* =========================================================
   REPEAT
   ========================================================= */

function toggleRepeat() {

    isRepeat =
        !isRepeat;


    if (
        repeatBtn
    ) {

        repeatBtn.classList.toggle(
            "active",
            isRepeat
        );

    }


    showToast(
        isRepeat
            ? "REPEAT ON"
            : "REPEAT OFF"
    );

}


/* =========================================================
   UPDATE PLAY BUTTON
   ========================================================= */

function updatePlayButton(
    playing
) {

    if (
        playPauseBtn
    ) {

        playPauseBtn.innerHTML =
            playing
                ? `<i class="fa-solid fa-pause"></i>`
                : `<i class="fa-solid fa-play"></i>`;

    }


    if (
        visualizerBars
    ) {

        visualizerBars.classList.toggle(
            "playing",
            playing
        );

    }

}


/* =========================================================
   FORMAT TIME
   ========================================================= */

function formatTime(
    seconds
) {

    if (
        !Number.isFinite(seconds) ||
        seconds < 0
    ) {

        return "0:00";

    }


    const minutes =
        Math.floor(
            seconds / 60
        );


    const remainingSeconds =
        Math.floor(
            seconds % 60
        );


    return (
        minutes +
        ":" +
        remainingSeconds
            .toString()
            .padStart(
                2,
                "0"
            )
    );

}


/* =========================================================
   UPDATE PROGRESS
   ========================================================= */

function updateProgress() {

    const duration =
        audioPlayer.duration;


    if (
        !Number.isFinite(duration) ||
        duration <= 0
    ) {

        return;

    }


    const percentage =
        (
            audioPlayer.currentTime /
            duration
        ) * 100;


    if (
        progressBar
    ) {

        progressBar.value =
            percentage;

    }


    if (
        currentTimeElement
    ) {

        currentTimeElement.textContent =
            formatTime(
                audioPlayer.currentTime
            );

    }


    if (
        durationElement
    ) {

        durationElement.textContent =
            formatTime(
                duration
            );

    }

}


/* =========================================================
   SEEK SONG
   ========================================================= */

function seekSong() {

    if (
        !Number.isFinite(
            audioPlayer.duration
        ) ||
        audioPlayer.duration <= 0
    ) {

        return;

    }


    const percentage =
        Number(
            progressBar.value
        );


    audioPlayer.currentTime =
        (
            percentage /
            100
        ) *
        audioPlayer.duration;

}


/* =========================================================
   CHANGE MAIN VOLUME
   ========================================================= */

function changeVolume() {

    /*
     * Don't change volume manually
     * while LET'S GO is active.
     */

    if (
        isVolumeDucking
    ) {

        return;

    }


    const value =
        Number(
            volumeBar.value
        );


    if (
        !Number.isFinite(value)
    ) {

        return;

    }


    audioPlayer.volume =
        Math.max(
            0,
            Math.min(
                1,
                value
            )
        );


    updateMuteIcon();

}


/* =========================================================
   MUTE
   ========================================================= */

function toggleMute() {

    if (
        isVolumeDucking
    ) {

        return;

    }


    if (
        audioPlayer.volume > 0
    ) {

        audioPlayer.dataset.previousVolume =
            audioPlayer.volume;


        audioPlayer.volume =
            0;


        if (
            volumeBar
        ) {

            volumeBar.value =
                0;

        }

    }
    else {

        const previousVolume =
            Number(
                audioPlayer.dataset.previousVolume ||
                1
            );


        audioPlayer.volume =
            previousVolume;


        if (
            volumeBar
        ) {

            volumeBar.value =
                previousVolume;

        }

    }


    updateMuteIcon();

}


/* =========================================================
   UPDATE MUTE ICON
   ========================================================= */

function updateMuteIcon() {

    if (
        !muteBtn
    ) {

        return;

    }


    if (
        audioPlayer.volume === 0
    ) {

        muteBtn.innerHTML =
            `<i class="fa-solid fa-volume-xmark"></i>`;

    }
    else {

        muteBtn.innerHTML =
            `<i class="fa-solid fa-volume-high"></i>`;

    }

}


/* =========================================================
   =========================================================
   LET'S GO
   =========================================================
   ========================================================= */


/* =========================================================
   START VOLUME DUCKING
   ========================================================= */

function startVolumeDucking() {

    if (
        isVolumeDucking
    ) {

        return;

    }


    /*
     * Remember current volume.
     */

    savedVolume =
        audioPlayer.volume;


    /*
     * Activate ducking.
     */

    isVolumeDucking =
        true;


    /*
     * Reduce volume to 15%.
     */

    audioPlayer.volume =
        0.15;


    /*
     * Update volume slider.
     */

    if (
        volumeBar
    ) {

        volumeBar.value =
            0.15;

    }


    /*
     * Visual state.
     */

    if (
        letsGoBtn
    ) {

        letsGoBtn.classList.add(
            "active"
        );

    }


    document.body.classList.add(
        "volume-duck-active"
    );

}


/* =========================================================
   STOP VOLUME DUCKING
   ========================================================= */

function stopVolumeDucking() {

    if (
        !isVolumeDucking
    ) {

        return;

    }


    /*
     * Restore previous volume.
     */

    audioPlayer.volume =
        savedVolume;


    if (
        volumeBar
    ) {

        volumeBar.value =
            savedVolume;

    }


    /*
     * Reset state.
     */

    isVolumeDucking =
        false;


    /*
     * Remove visual state.
     */

    if (
        letsGoBtn
    ) {

        letsGoBtn.classList.remove(
            "active"
        );

    }


    document.body.classList.remove(
        "volume-duck-active"
    );


    updateMuteIcon();

}


/* =========================================================
   LET'S GO BUTTON
   ========================================================= */

if (
    letsGoBtn
) {

    letsGoBtn.addEventListener(
        "pointerdown",
        event => {

            event.preventDefault();


            startVolumeDucking();


            try {

                letsGoBtn.setPointerCapture(
                    event.pointerId
                );

            }
            catch {

                /*
                 * Ignore pointer capture errors.
                 */

            }

        }
    );


    letsGoBtn.addEventListener(
        "pointerup",
        event => {

            event.preventDefault();


            stopVolumeDucking();


            try {

                letsGoBtn.releasePointerCapture(
                    event.pointerId
                );

            }
            catch {

                /*
                 * Ignore pointer release errors.
                 */

            }

        }
    );


    letsGoBtn.addEventListener(
        "pointercancel",
        () => {

            stopVolumeDucking();

        }
    );


    letsGoBtn.addEventListener(
        "pointerleave",
        () => {

            if (
                isVolumeDucking
            ) {

                stopVolumeDucking();

            }

        }
    );

}


/* =========================================================
   SPACEBAR
   ========================================================= */

document.addEventListener(
    "keydown",
    event => {

        if (
            event.code !==
            "Space"
        ) {

            return;

        }


        /*
         * Don't interfere with text inputs.
         */

        const activeElement =
            document.activeElement;


        if (
            activeElement &&
            (
                activeElement.tagName ===
                    "INPUT" ||

                activeElement.tagName ===
                    "TEXTAREA" ||

                activeElement.tagName ===
                    "SELECT" ||

                activeElement.isContentEditable
            )
        ) {

            return;

        }


        /*
         * Prevent browser scrolling.
         */

        event.preventDefault();


        /*
         * Ignore repeated keydown events.
         */

        if (
            event.repeat ||
            spacebarHeld
        ) {

            return;

        }


        spacebarHeld =
            true;


        /*
         * Same function used by
         * LET'S GO.
         */

        startVolumeDucking();

    }
);


document.addEventListener(
    "keyup",
    event => {

        if (
            event.code !==
            "Space"
        ) {

            return;

        }


        event.preventDefault();


        spacebarHeld =
            false;


        /*
         * Same function used by
         * LET'S GO.
         */

        stopVolumeDucking();

    }
);


/* =========================================================
   SPACEBAR SAFETY
   ========================================================= */

window.addEventListener(
    "blur",
    () => {

        spacebarHeld =
            false;


        stopVolumeDucking();

    }
);


/* =========================================================
   PLAYBACK SPEED
   ========================================================= */

function setPlaybackSpeed(
    value
) {

    const speed =
        Number(value);


    if (
        !Number.isFinite(speed) ||
        speed <= 0
    ) {

        return;

    }


    audioPlayer.playbackRate =
        speed;

}


/* =========================================================
   BASS
   ========================================================= */

function setBass(
    value
) {

    if (
        !initializeAudioEffects()
    ) {

        return;

    }


    const numericValue =
        Number(value);


    if (
        !Number.isFinite(
            numericValue
        )
    ) {

        return;

    }


    const gain =
        (
            numericValue - 50
        ) *
        0.24;


    bassFilter.gain.value =
        gain;


    resumeAudioContext();

}


/* =========================================================
   TREBLE
   ========================================================= */

function setTreble(
    value
) {

    if (
        !initializeAudioEffects()
    ) {

        return;

    }


    const numericValue =
        Number(value);


    if (
        !Number.isFinite(
            numericValue
        )
    ) {

        return;

    }


    const gain =
        (
            numericValue - 50
        ) *
        0.24;


    trebleFilter.gain.value =
        gain;


    resumeAudioContext();

}


/* =========================================================
   UPDATE PLAYER FAVORITE
   ========================================================= */

function updatePlayerFavorite() {

    if (
        !playerFavorite
    ) {

        return;

    }


    if (
        currentSongIndex < 0 ||
        currentPlaylist.length === 0
    ) {

        playerFavorite.classList.remove(
            "active"
        );


        playerFavorite.innerHTML =
            `<i class="fa-regular fa-heart"></i>`;


        return;

    }


    const song =
        currentPlaylist[
            currentSongIndex
        ];


    if (
        !song
    ) {

        return;

    }


    if (
        typeof isFavorite !==
        "function"
    ) {

        return;

    }


    const favorite =
        isFavorite(
            song.id
        );


    playerFavorite.classList.toggle(
        "active",
        favorite
    );


    playerFavorite.innerHTML =
        favorite
            ? `<i class="fa-solid fa-heart"></i>`
            : `<i class="fa-regular fa-heart"></i>`;

}


/* =========================================================
   UPDATE DJ DISPLAY
   ========================================================= */

function updateDJDisplay() {

    if (
        !djSongName
    ) {

        return;

    }


    if (
        currentSongIndex < 0 ||
        currentPlaylist.length === 0
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

}


/* =========================================================
   DJ CONTROL DISPLAY VALUES
   ========================================================= */


/* =========================================================
   PLAYBACK SPEED DISPLAY
   ========================================================= */

const speedControl =
    document.getElementById(
        "speedControl"
    );


const speedValue =
    document.getElementById(
        "speedValue"
    );


if (
    speedControl &&
    speedValue
) {

    speedControl.addEventListener(
        "input",
        () => {

            const value =
                Number(
                    speedControl.value
                );


            speedValue.textContent =
                `${value.toFixed(1)}X`;


            setPlaybackSpeed(
                value
            );

        }
    );

}


/* =========================================================
   BASS DISPLAY
   ========================================================= */

const bassControl =
    document.getElementById(
        "bassControl"
    );


if (
    bassControl
) {

    const bassValue =
        bassControl
            .closest(
                ".dj-control-card"
            )
            ?.querySelector(
                ".dj-control-header span"
            );


    bassControl.addEventListener(
        "input",
        () => {

            const value =
                Number(
                    bassControl.value
                );


            if (
                bassValue
            ) {

                bassValue.textContent =
                    value;

            }


            setBass(
                value
            );

        }
    );

}


/* =========================================================
   TREBLE DISPLAY
   ========================================================= */

const trebleControl =
    document.getElementById(
        "trebleControl"
    );


if (
    trebleControl
) {

    const trebleValue =
        trebleControl
            .closest(
                ".dj-control-card"
            )
            ?.querySelector(
                ".dj-control-header span"
            );


    trebleControl.addEventListener(
        "input",
        () => {

            const value =
                Number(
                    trebleControl.value
                );


            if (
                trebleValue
            ) {

                trebleValue.textContent =
                    value;

            }


            setTreble(
                value
            );

        }
    );

}


/* =========================================================
   DJ VOLUME DISPLAY
   ========================================================= */

const djVolume =
    document.getElementById(
        "djVolume"
    );


if (
    djVolume
) {

    const djVolumeValue =
        djVolume
            .closest(
                ".dj-control-card"
            )
            ?.querySelector(
                ".dj-control-header span"
            );


    djVolume.addEventListener(
        "input",
        () => {

            const value =
                Number(
                    djVolume.value
                );


            const percentage =
                Math.round(
                    value * 100
                );


            if (
                djVolumeValue
            ) {

                djVolumeValue.textContent =
                    `${percentage}%`;

            }


            /*
             * Update actual player volume
             * unless LET'S GO is active.
             */

            if (
                !isVolumeDucking
            ) {

                audioPlayer.volume =
                    value;


                if (
                    volumeBar
                ) {

                    volumeBar.value =
                        value;

                }


                updateMuteIcon();

            }

        }
    );

}


/* =========================================================
   INITIAL DJ VALUES
   ========================================================= */

if (
    speedControl &&
    speedValue
) {

    speedValue.textContent =
        `${Number(
            speedControl.value
        ).toFixed(1)}X`;

}


if (
    bassControl
) {

    const bassValue =
        bassControl
            .closest(
                ".dj-control-card"
            )
            ?.querySelector(
                ".dj-control-header span"
            );


    if (
        bassValue
    ) {

        bassValue.textContent =
            bassControl.value;

    }

}


if (
    trebleControl
) {

    const trebleValue =
        trebleControl
            .closest(
                ".dj-control-card"
            )
            ?.querySelector(
                ".dj-control-header span"
            );


    if (
        trebleValue
    ) {

        trebleValue.textContent =
            trebleControl.value;

    }

}


if (
    djVolume
) {

    const djVolumeValue =
        djVolume
            .closest(
                ".dj-control-card"
            )
            ?.querySelector(
                ".dj-control-header span"
            );


    if (
        djVolumeValue
    ) {

        djVolumeValue.textContent =
            `${Math.round(
                Number(
                    djVolume.value
                ) * 100
            )}%`;

    }

}


/* =========================================================
   AUDIO EVENTS
   ========================================================= */


/*
 * Metadata loaded.
 */

audioPlayer.addEventListener(
    "loadedmetadata",
    () => {

        if (
            durationElement
        ) {

            durationElement.textContent =
                formatTime(
                    audioPlayer.duration
                );

        }


        if (
            currentTimeElement
        ) {

            currentTimeElement.textContent =
                "0:00";

        }


        if (
            progressBar
        ) {

            progressBar.value =
                0;

        }

    }
);


/*
 * Progress.
 */

audioPlayer.addEventListener(
    "timeupdate",
    updateProgress
);


/*
 * Playing.
 */

audioPlayer.addEventListener(
    "play",
    () => {

        updatePlayButton(
            true
        );


        updateDJDisplay();


        resumeAudioContext();

    }
);


/*
 * Paused.
 */

audioPlayer.addEventListener(
    "pause",
    () => {

        updatePlayButton(
            false
        );

    }
);


/*
 * Song ended.
 */

audioPlayer.addEventListener(
    "ended",
    () => {

        if (
            isRepeat
        ) {

            audioPlayer.currentTime =
                0;


            playSong();

        }
        else {

            nextSong();

        }

    }
);


/*
 * Audio error.
 */

audioPlayer.addEventListener(
    "error",
    () => {

        console.error(
            "Audio playback error:",
            audioPlayer.error
        );


        console.error(
            "Audio source:",
            audioPlayer.src
        );


        showToast(
            "UNABLE TO PLAY SONG"
        );

    }
);


/* =========================================================
   PLAYER BUTTON EVENTS
   ========================================================= */

if (
    playPauseBtn
) {

    playPauseBtn.addEventListener(
        "click",
        togglePlayPause
    );

}


if (
    previousBtn
) {

    previousBtn.addEventListener(
        "click",
        previousSong
    );

}


if (
    nextBtn
) {

    nextBtn.addEventListener(
        "click",
        nextSong
    );

}


if (
    shuffleBtn
) {

    shuffleBtn.addEventListener(
        "click",
        toggleShuffle
    );

}


if (
    repeatBtn
) {

    repeatBtn.addEventListener(
        "click",
        toggleRepeat
    );

}


if (
    progressBar
) {

    progressBar.addEventListener(
        "input",
        seekSong
    );

}


if (
    volumeBar
) {

    volumeBar.addEventListener(
        "input",
        changeVolume
    );

}


if (
    muteBtn
) {

    muteBtn.addEventListener(
        "click",
        toggleMute
    );

}


/* =========================================================
   PLAYER FAVORITE BUTTON
   ========================================================= */

if (
    playerFavorite
) {

    playerFavorite.addEventListener(
        "click",
        () => {

            if (
                currentSongIndex < 0 ||
                currentPlaylist.length === 0
            ) {

                showToast(
                    "SELECT A SONG FIRST"
                );

                return;

            }


            const song =
                currentPlaylist[
                    currentSongIndex
                ];


            if (
                !song
            ) {

                return;

            }


            if (
                typeof toggleFavorite ===
                "function"
            ) {

                toggleFavorite(
                    song.id
                );

            }

        }
    );

}


/* =========================================================
   INITIAL PLAYER STATE
   ========================================================= */

audioPlayer.volume =
    1;


audioPlayer.playbackRate =
    1;


if (
    volumeBar
) {

    volumeBar.value =
        1;

}


updateMuteIcon();

updatePlayButton(
    false
);


/* =========================================================
   GLOBAL FUNCTIONS
   ========================================================= */

window.setCurrentPlaylist =
    setCurrentPlaylist;

window.loadSong =
    loadSong;

window.playSong =
    playSong;

window.pauseSong =
    pauseSong;

window.nextSong =
    nextSong;

window.previousSong =
    previousSong;

window.togglePlayPause =
    togglePlayPause;

window.toggleShuffle =
    toggleShuffle;

window.toggleRepeat =
    toggleRepeat;

window.setPlaybackSpeed =
    setPlaybackSpeed;

window.setBass =
    setBass;

window.setTreble =
    setTreble;

window.updateMuteIcon =
    updateMuteIcon;

window.updatePlayerFavorite =
    updatePlayerFavorite;

window.updateDJDisplay =
    updateDJDisplay;

window.startVolumeDucking =
    startVolumeDucking;

window.stopVolumeDucking =
    stopVolumeDucking;