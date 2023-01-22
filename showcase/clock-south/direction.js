// geolocationCoords = {
//   latitude: 43.6602577,
//   longitude: -79.3977623,
//   altitude: 89.9000015258789,
//   accuracy: 1000,
// };

function direction(hour = 0) {
  var azimuth = SunCalc.getPosition(
    new Date(),
    geolocationCoords.latitude,
    geolocationCoords.longitude
  ).azimuth;

  azimuth -= Math.PI;
  azimuth = azimuth < 0 ? azimuth + 2 * Math.PI : azimuth;

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

  compass_sun_direction = azimuth - hour / 2;
  compass_local_time = azimuth - apparentSolarTime / 2;
  compass_true = orientationWrtXAxis;

  compass_sun_direction = compass_sun_direction < 0 ? compass_sun_direction + 2 * Math.PI : compass_sun_direction;
  compass_local_time = compass_local_time < 0 ? compass_local_time + 2 * Math.PI : compass_local_time;
  compass_true = compass_true < 0 ? compass_true + 2 * Math.PI : compass_true;

  compass_sun_direction = compass_sun_direction > 2 * Math.PI ? compass_sun_direction - 2 * Math.PI : compass_sun_direction;
  compass_local_time = compass_local_time > 2 * Math.PI ? compass_local_time - 2 * Math.PI : compass_local_time;
  compass_true = compass_true > 2 * Math.PI ? compass_true - 2 * Math.PI : compass_true;

  return [compass_sun_direction, compass_local_time, compass_true];
}
