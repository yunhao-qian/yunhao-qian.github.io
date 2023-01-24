var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
const canvasElement = document.querySelector("#canvas");
const canvasContext = canvasElement.getContext("2d", { alpha: true });
let deviceOrientationPermissionState = "unknown";
let screenAndDeviceOrientation = null;
main();
function main() {
    handleOrientationPermission();
    window.addEventListener("resize", onWindowResize);
    onWindowResize();
    if (deviceOrientationPermissionState === "granted") {
        startRenderLoop();
    }
}
function handleOrientationPermission() {
    if (typeof DeviceOrientationEvent !== "undefined" && typeof DeviceOrientationEvent.requestPermission === "function") {
        canvasElement.addEventListener("click", () => __awaiter(this, void 0, void 0, function* () {
            const response = yield DeviceOrientationEvent.requestPermission();
            if (response === "granted") {
                deviceOrientationPermissionState = "granted";
                startRenderLoop();
            }
            else {
                deviceOrientationPermissionState = "denied";
                paintCanvas();
            }
        }), { once: true });
    }
    else if (typeof window.ondeviceorientationabsolute !== "undefined" || typeof window.ondeviceorientation !== "undefined") {
        deviceOrientationPermissionState = "granted";
    }
    else {
        deviceOrientationPermissionState = "unsupported";
    }
}
function onWindowResize() {
    canvasContext.fillStyle = "black";
    canvasContext.fillRect(0, 0, canvasElement.width, canvasElement.height);
    canvasElement.style.width = `${window.innerWidth}px`;
    canvasElement.style.height = `${window.innerHeight}px`;
    canvasElement.width = window.innerWidth;
    canvasElement.height = window.innerHeight;
    window.requestAnimationFrame(paintCanvas);
}
function startRenderLoop() {
    function updateScreenOrientation() {
        if (typeof window.screen.orientation !== "undefined") {
            const angle = window.screen.orientation.angle;
            console.assert(angle === 0 || angle === 90 || angle === 180 || angle == 270);
            screenAndDeviceOrientation.screenAngle = angle;
        }
        else {
            switch (window.orientation) {
                case -90:
                    screenAndDeviceOrientation.screenAngle = 90;
                    break;
                case 0:
                    screenAndDeviceOrientation.screenAngle = 0;
                    break;
                case 90:
                    screenAndDeviceOrientation.screenAngle = 270;
                    break;
                case 180:
                    screenAndDeviceOrientation.screenAngle = 180;
                    break;
                default:
                    console.error("Invalid value of window orientation", window.orientation);
            }
        }
    }
    function updateDeviceOrientation(event) {
        const initialUpdate = screenAndDeviceOrientation.alpha === null;
        const degreeToRadian = 180 / Math.PI;
        if (false && typeof event.webkitCompassHeading !== "undefined") {
            screenAndDeviceOrientation.alpha = (360 - event.webkitCompassHeading) / degreeToRadian;
        }
        else {
            screenAndDeviceOrientation.alpha = event.alpha / degreeToRadian;
        }
        screenAndDeviceOrientation.beta = event.beta / degreeToRadian;
        screenAndDeviceOrientation.gamma = event.gamma / degreeToRadian;
        if (initialUpdate) {
            window.requestAnimationFrame(paintCanvas);
        }
    }
    screenAndDeviceOrientation = {
        screenAngle: 0,
        alpha: null,
        beta: null,
        gamma: null,
    };
    if (typeof window.screen.orientation !== "undefined") {
        window.screen.orientation.onchange = updateScreenOrientation;
    }
    else {
        window.addEventListener("orientationchange", updateScreenOrientation);
    }
    updateScreenOrientation();
    if (typeof window.ondeviceorientationabsolute !== "undefined") {
        window.addEventListener("deviceorientationabsolute", updateDeviceOrientation);
    }
    else {
        window.addEventListener("deviceorientation", updateDeviceOrientation);
    }
    window.requestAnimationFrame(paintCanvas);
}
function paintCanvas() {
    canvasContext.fillStyle = "black";
    canvasContext.fillRect(0, 0, canvasElement.width, canvasElement.height);
    canvasContext.fillStyle = "white";
    canvasContext.font = "5vmin monospace";
    if (deviceOrientationPermissionState !== "granted") {
        switch (deviceOrientationPermissionState) {
            case "unknown":
                drawTextWithWrapping("Click on the screen to allow access to device orientation.");
                break;
            case "denied":
                drawTextWithWrapping("Cannot launch app because access to device orientation was denied.");
                break;
            case "unsupported":
                drawTextWithWrapping("Cannot launch app because your browser does not support detecting device orientation.");
                break;
            default:
                console.error("Invalid permission state of device orientation", deviceOrientationPermissionState);
        }
        return;
    }
    if (screenAndDeviceOrientation === null || screenAndDeviceOrientation.alpha === null) {
        drawTextWithWrapping("Loading...");
        return;
    }
    drawCelestialSphere();
    window.requestAnimationFrame(paintCanvas);
}
function drawTextWithWrapping(text) {
    const allowedMaxWidth = canvasElement.width * 0.8;
    const words = text.split(" ");
    const lines = [];
    const fontHeights = [], lineHeights = [];
    let actualMaxWidth = 0;
    let currentLine = [];
    function addLine() {
        const line = currentLine.join(" ");
        lines.push(line);
        const textMetrics = canvasContext.measureText(line);
        const fontHeight = textMetrics.fontBoundingBoxAscent + textMetrics.fontBoundingBoxDescent;
        fontHeights.push(fontHeight);
        lineHeights.push(1.5 * fontHeight);
        actualMaxWidth = Math.max(actualMaxWidth, textMetrics.width);
    }
    for (const word of words) {
        currentLine.push(word);
        if (canvasContext.measureText(currentLine.join(" ")).width <= allowedMaxWidth) {
            continue;
        }
        if (currentLine.length === 1) {
            addLine();
            currentLine = [];
        }
        else {
            currentLine.pop();
            addLine();
            currentLine = [word];
        }
    }
    if (currentLine.length > 0) {
        addLine();
    }
    let textX = (canvasElement.width - actualMaxWidth) * 0.5;
    let textY = (canvasElement.height - lineHeights.reduce((a, b) => a + b, 0)) * 0.5;
    for (let i = 0; i < lines.length; ++i) {
        canvasContext.fillText(lines[i], textX, textY + (lineHeights[i] - fontHeights[i]) * 0.5, allowedMaxWidth);
        textY += lineHeights[i];
    }
}
function drawCelestialSphere() {
    canvasContext.fillStyle = "black";
    canvasContext.fillRect(0, 0, canvasElement.width, canvasElement.height);
    canvasContext.translate(canvasElement.width / 2, canvasElement.height / 2);
    canvasContext.scale(500, 500);
    const earthToScreenMatrix = computeEarthToScreenMatrix(screenAndDeviceOrientation);
    function drawPoint(theta, phi) {
        const earthCoords = [
            Math.sin(theta) * Math.cos(phi),
            Math.cos(theta) * Math.cos(phi),
            Math.sin(phi),
        ];
        let [screenX, screenY, screenZ] = multiplyMatrixVector(earthToScreenMatrix, earthCoords);
        if (screenZ < 0) {
            return;
        }
        if (screenX !== 0 || screenY !== 0) {
            const length = Math.sqrt(screenX * screenX + screenY * screenY);
            screenX /= length;
            screenY /= length;
        }
        const distanceFromCenter = Math.acos(Math.min(screenZ, 1)) / (Math.PI / 2);
        canvasContext.beginPath();
        canvasContext.arc(screenX * distanceFromCenter, screenY * distanceFromCenter, 0.02, 0, Math.PI * 2);
        canvasContext.fillStyle = `hsl(${theta}rad, ${(1 - phi / (Math.PI / 2)) * 100}%, 50%)`;
        canvasContext.fill();
    }
    for (let i = 0; i < 10; ++i) {
        const phi = i / 20 * Math.PI;
        for (let j = 0; j < 36; ++j) {
            const theta = j / 18 * Math.PI;
            drawPoint(theta, phi);
        }
    }
    drawPoint(0, Math.PI / 2);
    canvasContext.resetTransform();
}
function computeEarthToScreenMatrix(orientation) {
    const sinAlpha = Math.sin(orientation.alpha), cosAlpha = Math.cos(orientation.alpha);
    let matrix = [
        [cosAlpha, sinAlpha, 0],
        [-sinAlpha, cosAlpha, 0],
        [0, 0, 1],
    ];
    const sinBeta = Math.sin(orientation.beta), cosBeta = Math.cos(orientation.beta);
    matrix = multiplyMatrices([
        [1, 0, 0],
        [0, cosBeta, sinBeta],
        [0, -sinBeta, cosBeta],
    ], matrix);
    const sinGamma = Math.sin(orientation.gamma), cosGamma = Math.cos(orientation.gamma);
    matrix = multiplyMatrices([
        [cosGamma, 0, -sinGamma],
        [0, 1, 0],
        [sinGamma, 0, cosGamma],
    ], matrix);
    matrix = multiplyMatrices([
        [1, 0, 0],
        [0, -1, 0],
        [0, 0, -1],
    ], matrix);
    switch (orientation.screenAngle) {
        case 90:
            matrix = multiplyMatrices([
                [0, -1, 0],
                [1, 0, 0],
                [0, 0, 1],
            ], matrix);
            break;
        case 180:
            matrix = multiplyMatrices([
                [-1, 0, 0],
                [0, -1, 0],
                [0, 0, 1],
            ], matrix);
            break;
        case 270:
            matrix = multiplyMatrices([
                [0, 1, 0],
                [-1, 0, 0],
                [0, 0, 1],
            ], matrix);
            break;
        default:
            console.assert(orientation.screenAngle === 0);
    }
    return matrix;
}
function multiplyMatrixVector(a, b) {
    const result = [0, 0, 0];
    for (let row = 0; row < 3; ++row) {
        for (let i = 0; i < 3; ++i) {
            result[row] += a[row][i] * b[i];
        }
    }
    return result;
}
function multiplyMatrices(a, b) {
    const result = [
        [0, 0, 0],
        [0, 0, 0],
        [0, 0, 0],
    ];
    for (let row = 0; row < 3; ++row) {
        for (let col = 0; col < 3; ++col) {
            for (let i = 0; i < 3; ++i) {
                result[row][col] += a[row][i] * b[i][col];
            }
        }
    }
    return result;
}
