export default function routeEncoder(points, precision = 5) {
  let output = '';
  let prevLat = 0;
  let prevLng = 0;
  const factor = Math.pow(10, precision);

  for (let i = 0; i < points.length; i++) {
    let lat = Math.round(points[i].latitude * factor);
    let lng = Math.round(points[i].longitude * factor);

    let dLat = lat - prevLat;
    let dLng = lng - prevLng;

    [dLat, dLng].forEach((val) => {
      val = val < 0 ? ~(val << 1) : (val << 1);
      while (val >= 0x20) {
        output += String.fromCharCode((0x20 | (val & 0x1f)) + 63);
        val >>= 5;
      }
      output += String.fromCharCode(val + 63);
    });

    prevLat = lat;
    prevLng = lng;
  }

  return output;
}
