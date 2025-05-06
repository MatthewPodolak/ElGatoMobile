export function routeDecoder(encoded, precision = 5) {
    const points = [];
    const factor = Math.pow(10, precision);
    let index = 0;
    let lat = 0;
    let lng = 0;
  
    while (index < encoded.length) {
      let result = 1;
      let shift = 0;
      let b;
  
      do {
        b = encoded.charCodeAt(index++) - 63 - 1;
        result += b << shift;
        shift += 5;
      } while (b >= 0x1f);
      lat += (result & 1) ? ~(result >> 1) : (result >> 1);
  
      result = 1;
      shift = 0;
      do {
        b = encoded.charCodeAt(index++) - 63 - 1;
        result += b << shift;
        shift += 5;
      } while (b >= 0x1f);
      lng += (result & 1) ? ~(result >> 1) : (result >> 1);
  
      points.push({
        latitude: lat / factor,
        longitude: lng / factor,
      });
    }
  
    return points;
  }  