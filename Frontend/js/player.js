/* =========================================================
   DJ CONTROL DISPLAY VALUES
   ========================================================= */

/*
 * PLAYBACK SPEED
 */

const speedControl =
    document.getElementById("speedControl");

const speedValue =
    document.getElementById("speedValue");


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


            /*
             * Apply speed to audio.
             */

            setPlaybackSpeed(
                value
            );

        }
    );

}


/*
 * BASS
 */

const bassControl =
    document.getElementById("bassControl");


if (
    bassControl
) {

    /*
     * The number is the span immediately
     * inside the control card.
     */

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


            /*
             * Apply bass effect.
             */

            setBass(
                value
            );

        }
    );

}


/*
 * TREBLE
 */

const trebleControl =
    document.getElementById("trebleControl");


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


            /*
             * Apply treble effect.
             */

            setTreble(
                value
            );

        }
    );

}


/*
 * DJ VOLUME
 */

const djVolume =
    document.getElementById("djVolume");


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


            /*
             * Convert:
             *
             * 0.00 → 0%
             * 0.50 → 50%
             * 1.00 → 100%
             */

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
             * Change actual audio volume.
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

            }

        }
    );

}


/*
 * =========================================================
 * INITIAL DISPLAY VALUES
 * =========================================================
 */

if (
    speedControl &&
    speedValue
) {

    speedValue.textContent =
        `${Number(speedControl.value).toFixed(1)}X`;

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