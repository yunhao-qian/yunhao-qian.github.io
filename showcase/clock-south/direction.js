// geolocationCoords = {
//   latitude: 43.6602577,
//   longitude: -79.3977623,
//   altitude: 89.9000015258789,
//   accuracy: 1000,
// };

function direction(now, hour = 0) {
  let azimuth = SunCalc.getPosition(
    new Date(),
    geolocationCoords.latitude,
    geolocationCoords.longitude
  ).azimuth - Math.PI;
  if (azimuth < 0) {
    azimuth += Math.PI * 2;
  }

  console.log("azimuth, ", azimuth);

  function getDayOfYear(date) {
    var start = new Date(date.getFullYear(), 0, 0);
    var diff = date - start;
    var oneDay = 1000 * 60 * 60 * 24;
    return Math.floor(diff / oneDay);
  }

  function getEquationOfTime() {
    // Get the current date
    var date = new Date();
    var B = (360 / 365.24) * (getDayOfYear(date) - 81);
    var EoT =
      229.2 *
      (0.000075 +
        0.001868 * Math.cos(B) -
        0.032077 * Math.sin(B) -
        0.014615 * Math.cos(2 * B) -
        0.04089 * Math.sin(2 * B));
    return EoT;
  }

  // get UTC time

  function getCurrentUTCTime() {
    var date = new Date();
    return (
      date.getUTCHours() +
      date.getUTCMinutes() / 60 +
      date.getUTCSeconds() / 3600
    );
    // return [hour, min, sec];
  }

  // calculate apparent solar time

  var apparentSolarTime =
    (geolocationCoords.longitude / 180) * 12 +
    getCurrentUTCTime() -
    getEquationOfTime() / 60;

  // apparentSolarTime: is the true solar time in hours
  let compass_sun_direction = null;
  if (now.getHours() < 12) {
    compass_sun_direction = azimuth - hour / 2 + Math.PI - compassHeading
  } else {
    compass_sun_direction = azimuth - hour / 2 - compassHeading;
  }
  let compass_local_time = azimuth + (1 - apparentSolarTime / 12) * Math.PI - compassHeading;
  let compass_true = Math.PI - compassHeading;

  return [compass_sun_direction, compass_local_time, compass_true];
}
