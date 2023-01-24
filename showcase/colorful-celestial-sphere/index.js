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
let canvasContext = null;
let deviceOrientationPermissionState = "unknown";
main();
function main() {
    handleOrientationPermission();
    window.onresize = onWindowResize;
    onWindowResize();
}
function handleOrientationPermission() {
    if (typeof DeviceOrientationEvent === "undefined" || typeof DeviceOrientationEvent.requestPermission !== "function") {
        deviceOrientationPermissionState = "granted";
    }
    else {
        canvasElement.addEventListener("click", () => __awaiter(this, void 0, void 0, function* () {
            const response = yield DeviceOrientationEvent.requestPermission();
            if (response === "granted") {
                deviceOrientationPermissionState = "granted";
            }
            else {
                deviceOrientationPermissionState = "denied";
            }
            paintCanvas();
        }), { once: true });
    }
}
function onWindowResize() {
    if (canvasContext !== null) {
        canvasContext.fillStyle = "black";
        canvasContext.fillRect(0, 0, canvasElement.width, canvasElement.height);
    }
    canvasElement.style.width = `${window.innerWidth}px`;
    canvasElement.style.height = `${window.innerHeight}px`;
    canvasElement.width = window.innerWidth;
    canvasElement.height = window.innerHeight;
    canvasContext = canvasElement.getContext("2d", { alpha: true });
    paintCanvas();
}
function paintCanvas() {
    console.assert(canvasContext !== null);
    if (deviceOrientationPermissionState !== "granted") {
        canvasContext.fillStyle = "black";
        canvasContext.fillRect(0, 0, canvasElement.width, canvasElement.height);
        canvasContext.fillStyle = "white";
        canvasContext.font = "6vmin monospace";
        switch (deviceOrientationPermissionState) {
            case "unknown":
                drawTextWithWrapping("Click on the screen to allow access to device orientation.");
                break;
            case "denied":
                drawTextWithWrapping("Cannot launch app because access to device orientation was denied.");
                break;
            default:
                console.error("Invalid permission state of device orientation", deviceOrientationPermissionState);
        }
    }
}
function drawTextWithWrapping(text) {
    console.assert(canvasContext !== null);
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
