const topContainer = document.getElementById("top-container");
const splashStartButton = document.getElementById("splash-start-button");
const previousButton = document.getElementById("previous-button");
const nextButton = document.getElementById("next-button");

const clockPageIDs = [
  "point-towards-sun-page",
  "bisector-pointing-south-page",
  "real-south-direction-page",
  "error-sun-direction-page",
  "error-local-time-page",
  "error-system-error-page",
];
const mainPageIDs = ["introduction-page"].concat(clockPageIDs, ["thank-you-page"]);
const allPageIDs = ["splash-page"].concat(mainPageIDs);

let currentPageName = "splash-page";

function disableButton(button) {
  button.setAttribute("onclick", null);
  button.classList.add("button-disabled");
}

/**
 * Start from north and rotate clockwise, the angle towards the phone's heading direction in radians.
 */
let compassHeading = null;

let deviceOrientationEvent = null;

/**
 * The following 3 properties of the object are of interest.
 * - altitude
 * - latitude
 * - longitude
 */
let geolocationCoords = null;

function handleDeviceOrientation(event) {
  deviceOrientationEvent = event;
  let headingInDegrees;
  if ("webkitCompassHeading" in event) {
    headingInDegrees = event.webkitCompassHeading;
  } else {
    headingInDegrees = 360 - event.alpha;
  }
  compassHeading = headingInDegrees / (180 / Math.PI);
}

async function onSplashStartButtonClicked() {
  if (typeof DeviceOrientationEvent !== 'undefined' && typeof DeviceOrientationEvent.requestPermission === 'function') {
    const deviceOrientationResponse = await DeviceOrientationEvent.requestPermission();
    if (deviceOrientationResponse !== "granted") {
      disableButton(splashStartButton);
      return;
    }
  }
  if ("ondeviceorientationabsolute" in window) {
    window.addEventListener("deviceorientationabsolute", handleDeviceOrientation, true);
  } else {
    window.addEventListener("deviceorientation", handleDeviceOrientation, true);
  }

  if (typeof Geolocation !== 'undefined' && typeof Geolocation.requestPermission === 'function') {
    const geolocationResponse = await Geolocation.requestPermission();
    if (geolocationResponse !== "granted") {
      disableButton(splashStartButton);
      return;
    }
  }
  if (!navigator.geolocation) {
    disableButton(splashStartButton);
    return;
  }
  const geolocation = await new Promise((resolve, reject) => {
    navigator.geolocation.getCurrentPosition(resolve, reject);
  });
  geolocationCoords = geolocation.coords;
  goToPageWithID('introduction-page');
}

function goToPageWithID(pageID) {
  topContainer.classList.remove("at-clock-pages", ...allPageIDs.map(id => "at-" + id));
  topContainer.classList.add("at-" + pageID);
  if (clockPageIDs.includes(pageID)) {
    topContainer.classList.add("at-clock-pages");
  }
  const index = mainPageIDs.indexOf(pageID);
  if (index === 0) {
    previousButton.classList.add("button-disabled");
  } else {
    previousButton.classList.remove("button-disabled");
    previousButton.onclick = () => {
      goToPageWithID(mainPageIDs[index - 1]);
      clear();
    };
  }
  if (index === mainPageIDs.length - 1) {
    nextButton.classList.add("button-disabled");
  } else {
    nextButton.classList.remove("button-disabled");
    nextButton.onclick = () => goToPageWithID(mainPageIDs[index + 1]);
  }
  currentPageName = pageID;
}
