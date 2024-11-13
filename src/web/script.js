document.addEventListener('DOMContentLoaded', () => {
    const coordsDisplay = document.getElementById("coords");
    const coordsButton = document.getElementById("buttonGetCoords");
    const coordsContainer = document.getElementById("coordsMenu");

    const handleVisibilityUI = (isVisible = false) => {
        coordsContainer.classList.toggle("hidden", !isVisible);
    };

    const reqCoords = async () => {
        try {
            const options = {
                method: "POST",
                headers: {
                    "Content-Type": "application/json; charset=UTF-8"
                }
            };
            await fetch('https://dadi-coords/getCoordsButtonPressed', options);
        } catch (error) {
            console.error(`Error requesting coords: \n`, error);
        }
    };

    const showCoords = async (coords) => {
        const { lat, lon, alt } = coords;
        coordsDisplay.innerHTML = lat && lon && alt
            ? `Coordenadas: <br> X: ${lat.toFixed(2)} <br> Y: ${lon.toFixed(2)} <br> Z: ${alt.toFixed(2)}`
            : "No se pudo obtener la ubicación.";
    };

    /**
     * Handles incoming messages and performs actions based on the message type.
     *
     * @param {MessageEvent} event - The message event containing the action and coordinates.
     * @param {Object} event.data - The data object from the message event.
     * @param {string} event.data.action - The action to be performed ('showUI', 'hideUI', 'showCoords').
     * @param {Object} [event.data.coords] - The coordinates to be shown (only for 'showCoords' action).
     */
    const handleMessage = (event) => {
        const { action, coords } = event.data;
        switch (action) {
            case 'showUI':
                handleVisibilityUI(true);
                break;
            case 'hideUI':
                handleVisibilityUI(false);
                break;
            case 'showCoords':
                showCoords(coords);
                break;
            default:
                break;
        }
    };

    const handleKeyDown = async (event) => {
        const options = {
            method: "POST",
            headers: {
                "Content-Type": "application/json; charset=UTF-8"
            }
        };

        if (event.key === "Escape" || event.key === "Backspace") {
            await fetch('https://dadi-coords/closeCoordsMenu', options);
        } else if (event.key === "Enter") {
            reqCoords();
        }
    };

    window.addEventListener('message', handleMessage);
    coordsButton.addEventListener('click', reqCoords);
    window.addEventListener('keydown', handleKeyDown);
});
