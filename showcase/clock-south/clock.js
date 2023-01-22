var canvas = document.getElementById("canvas");
var ctx = canvas.getContext("2d");
let dim = Math.min(window.innerWidth, window.innerHeight);
ctx.canvas.width = dim;
ctx.canvas.height = dim;
var radius = dim / 2;
ctx.translate(radius, radius);
radius = radius * 0.9;

var now_1 = -1;
var second_1;
var flag_1 = false;

var now_2 = -1;
var second_2;
var flag_2 = false;

var now_3 = -1;
var second_3;
var flag_3 = false;

var not_init = true;

window.requestAnimationFrame(draw);

function clear() {
  now_1 = -1;
  flag_1 = false;

  now_2 = -1;
  flag_2 = false;

  now_3 = -1;
  flag_3 = false;

  not_init = true;
}

function draw() {
  if (!clockPageIDs.slice(-3).includes(currentPageName)) {
    clock();
  } else {
    if (not_init) {
      let [hour, minute, second] = calcTime();

      compass_measured = hour / 2;

      [compass_sun_direction, compass_local_time, compass_true] =
        direction(hour);

      console.log(
        compass_measured,
        compass_sun_direction,
        compass_local_time,
        compass_true
      );

      not_init = false;
    }

    if (currentPageName === "error-sun-direction-page" && !flag_1) {
      if (now_1 === -1) {
        now_1 = new Date();
        second_1 = now_1.getSeconds() + now_1.getMilliseconds() / 1000;
      }
      requestAnimationFrame(() => {
        flag_1 = explainError(
          second_1,
          compass_measured,
          compass_sun_direction
        );
      });
    } else if (currentPageName === "error-local-time-page" && !flag_2) {
      if (now_2 === -1) {
        now_2 = new Date();
        second_2 = now_2.getSeconds() + now_2.getMilliseconds() / 1000;
      }
      requestAnimationFrame(() => {
        flag_2 = explainError(
          second_2,
          compass_sun_direction,
          compass_local_time
        );
      });
    } else if (currentPageName === "error-system-error-page" && !flag_3) {
      if (now_3 === -1) {
        now_3 = new Date();
        second_3 = now_3.getSeconds() + now_3.getMilliseconds() / 1000;
      }
      requestAnimationFrame(() => {
        flag_3 = explainError(second_3, compass_local_time, compass_true);
      });
    }
  }
  window.requestAnimationFrame(draw);
}

function calcTime() {
  var now = new Date();
  var hour = now.getHours();
  var minute = now.getMinutes();
  var second = now.getSeconds();
  var millisecond = now.getMilliseconds();
  //hour
  hour = hour % 12;
  hour =
    (hour * Math.PI) / 6 +
    (minute * Math.PI) / (6 * 60) +
    (second * Math.PI) / (360 * 60) +
    (millisecond * Math.PI) / (360 * 60 * 1000);
  //minute
  minute =
    (minute * Math.PI) / 30 +
    (second * Math.PI) / (30 * 60) +
    (millisecond * Math.PI) / (30 * 60 * 1000);
  // second
  second = (second * Math.PI) / 30 + (millisecond * Math.PI) / (30 * 1000);
  return [hour, minute, second];
}

function drawClockFaceWithNumber() {
  drawFace(ctx, radius);
  drawNumbers(ctx, radius);

  function drawFace(ctx, radius) {
    var grad;
    ctx.beginPath();
    ctx.arc(0, 0, radius, 0, 2 * Math.PI);
    ctx.fillStyle = "white";
    ctx.fill();
    grad = ctx.createRadialGradient(0, 0, radius * 0.95, 0, 0, radius * 1.05);
    grad.addColorStop(0, "#333");
    grad.addColorStop(0.5, "white");
    grad.addColorStop(1, "#333");
    ctx.strokeStyle = grad;
    ctx.lineWidth = radius * 0.1;
    ctx.stroke();
    ctx.beginPath();
    ctx.arc(0, 0, radius * 0.1, 0, 2 * Math.PI);
    ctx.fillStyle = "#333";
    ctx.fill();
  }

  function drawNumbers(ctx, radius) {
    var ang;
    var num;
    ctx.font = radius * 0.15 + "px arial";
    ctx.textBaseline = "middle";
    ctx.textAlign = "center";
    for (num = 1; num <= 12; num++) {
      ang = (num * Math.PI) / 6;
      ctx.rotate(ang);
      ctx.translate(0, -radius * 0.85);
      ctx.rotate(-ang);
      ctx.fillText(num.toString(), 0, 0);
      ctx.rotate(ang);
      ctx.translate(0, radius * 0.85);
      ctx.rotate(-ang);
    }
  }
}

function clock() {
  ctx.clearRect(-dim / 2, -dim / 2, dim, dim);
  drawClockFaceWithNumber();

  let [hour, minute, second] = calcTime();

  drawTime(ctx, radius, hour, minute, second);

  function drawTime(ctx, radius, hour, minute, second) {
    drawHand(ctx, hour, radius * 0.5, radius * 0.07);
    drawHand(ctx, minute, radius * 0.8, radius * 0.07);
    drawHand(ctx, second, radius * 0.9, radius * 0.02);

    if (clockPageIDs.slice(1, -3).includes(currentPageName)) {
      // draw the dotted line to 12 o'clock
      drawHand(ctx, 0, radius, radius * 0.01, "square", true);
      // draw the line bisecting 12 o'clock and hour hand
      drawHand(ctx, hour / 2, radius, radius * 0.02, "square");
    }

    if (currentPageName === "real-south-direction-page") {
      [compass_sun_direction, compass_local_time, compass_true] =
        direction(hour);
      drawHand(ctx, compass_true, radius, radius * 0.02, "square");
    }
  }
}

function drawHand(ctx, pos, length, width, lineCap = "round", dotted = false) {
  if (dotted) {
    ctx.setLineDash([20, 15]);
  }
  ctx.beginPath();
  ctx.lineWidth = width;
  ctx.lineCap = lineCap;
  ctx.moveTo(0, 0);
  ctx.rotate(pos);
  ctx.lineTo(0, -length);
  ctx.stroke();
  ctx.rotate(-pos);
  if (dotted) {
    ctx.setLineDash([]);
  }
}

function explainError(old_second, compass1, compass2, speed = 1 / 6) {
  if (compass2 - compass1 > Math.PI) {
    compass2 -= 2 * Math.PI;
  } else if (compass2 - compass1 < -Math.PI) {
    compass2 += 2 * Math.PI;
  }
  ctx.clearRect(-dim / 2, -dim / 2, dim, dim);
  drawClockFaceWithNumber();

  var now = new Date();
  var new_second = now.getSeconds() + now.getMilliseconds() / 1000;
  var second =
    new_second - old_second < 0
      ? 60 + new_second - old_second
      : new_second - old_second;

  drawHand(ctx, compass1, radius, Math.max(radius * 0.01, 1), "square", true);

  if (compass1 < compass2) {
    ctx.beginPath();
    ctx.arc(
      0,
      0,
      radius * 0.95,
      compass1 - Math.PI / 2,
      compass1 + second * Math.PI * speed - Math.PI / 2
    );
    ctx.lineTo(0, 0);
    ctx.fillStyle = "blue";
    ctx.fill();

    drawHand(
      ctx,
      compass1 + second * Math.PI * speed,
      radius,
      Math.max(radius * 0.01, 1),
      "square",
      true
    );
  } else {
    ctx.beginPath();
    ctx.arc(
      0,
      0,
      radius * 0.95,
      compass1 - second * Math.PI * speed - Math.PI / 2,
      compass1 - Math.PI / 2
    );
    ctx.lineTo(0, 0);
    ctx.fillStyle = "blue";
    ctx.fill();

    drawHand(
      ctx,
      compass1 - second * Math.PI * speed,
      radius,
      Math.max(radius * 0.01, 1),
      "square",
      true
    );
  }

  if (
    (compass1 < compass2 && compass1 + second * Math.PI * speed < compass2) ||
    (compass1 >= compass2 && compass1 - second * Math.PI * speed >= compass2)
  ) {
    requestAnimationFrame(() => {
      explainError(old_second, compass1, compass2);
    });
  } else {
    return true;
  }
}
