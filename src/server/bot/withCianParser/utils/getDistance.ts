const getDistanceBetween2PointsOnSphere = (
  { lat: lat1, lng: lng1 },
  { lat: lat2, lng: lng2 },
  r = 6371
): number => {
  const pi = Math.PI

  // Need to convert to radians:

  const lat1r = (lat1 * pi) / 180
  const lat2r = (lat2 * pi) / 180
  const lng1r = (lng1 * pi) / 180
  const lng2r = (lng2 * pi) / 180

  return (
    r *
    Math.acos(
      Math.sin(lat1r) * Math.sin(lat2r) +
        Math.cos(lat1r) * Math.cos(lat2r) * Math.cos(lng1r - lng2r)
    )
  )
}

export const getDistanceInKM = ({ from, to }: any): number => {
  return Number(getDistanceBetween2PointsOnSphere(from, to).toFixed(2))
}
