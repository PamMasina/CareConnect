export type Clinic = {
  id: string
  name: string
  address: string
  suburb: string
  phone: string
  openTime: string
  closeTime: string
  days: number[]
  distance: string
  lat: number
  lng: number
}

export const CLINICS: Clinic[] = [
  { id: 'langa-chc', name: 'Langa CHC', address: 'Washington Rd', suburb: 'Langa', phone: '+27 21 694 3000', openTime: '07:30', closeTime: '19:00', days: [1,2,3,4,5,6], distance: '2.1 km', lat: -33.9456, lng: 18.5219 },
  { id: 'khayelitsha-clinic', name: 'Khayelitsha Clinic', address: 'Ntlazana Rd', suburb: 'Khayelitsha', phone: '+27 21 360 8400', openTime: '08:00', closeTime: '17:00', days: [1,2,3,4,5], distance: '4.8 km', lat: -34.0403, lng: 18.6770 },
  { id: 'mitchells-cdc', name: "Mitchells Plain CDC", address: 'AZ Berman Dr', suburb: "Mitchells Plain", phone: '+27 21 370 0730', openTime: '08:00', closeTime: '16:00', days: [1,2,3,4,5], distance: '9.2 km', lat: -34.0350, lng: 18.6180 },
  { id: 'gugulethu-chc', name: 'Gugulethu CHC', address: 'NY 108', suburb: 'Gugulethu', phone: '+27 21 638 6300', openTime: '07:00', closeTime: '20:00', days: [1,2,3,4,5], distance: '11.4 km', lat: -33.9660, lng: 18.5680 },
  { id: 'cape-town-community', name: 'Cape Town Community Clinic', address: '123 Long Street', suburb: 'Cape Town CBD', phone: '+27 21 000 0000', openTime: '08:00', closeTime: '17:00', days: [1,2,3,4,5], distance: '3.0 km', lat: -33.9249, lng: 18.4241 },
  { id: 'greenpoint', name: 'Greenpoint Community Clinic', address: 'Main Rd', suburb: 'Green Point', phone: '+27 21 434 2000', openTime: '08:00', closeTime: '16:30', days: [1,2,3,4,5], distance: '5.5 km', lat: -33.9056, lng: 18.4110 },
  { id: 'adriaanse', name: 'Adriaanse Clinic', address: 'Adriaanse Ave', suburb: 'Bellville', phone: '+27 21 946 1111', openTime: '08:00', closeTime: '16:30', days: [1,2,3,4,5], distance: '5.5 km', lat: -33.9020, lng: 18.6290 },
  { id: 'albow-gardens', name: 'Albow Gardens Community Day Centre', address: 'Albow Gardens', suburb: 'Mitchells Plain', phone: '+27 21 392 5000', openTime: '07:30', closeTime: '16:30', days: [1,2,3,4,5], distance: '8.0 km', lat: -34.0450, lng: 18.5900 },
  { id: 'delft-south', name: 'Delft South Clinic', address: 'Delft South', suburb: 'Delft', phone: '+27 21 954 2000', openTime: '08:00', closeTime: '16:30', days: [1,2,3,4,5], distance: '15.0 km', lat: -33.9880, lng: 18.6420 },
  { id: 'eastridge', name: 'Eastridge Clinic', address: 'Eastridge', suburb: 'Mitchells Plain', phone: '+27 21 392 1200', openTime: '08:00', closeTime: '16:30', days: [1,2,3,4,5], distance: '10.5 km', lat: -34.0500, lng: 18.6250 },
  { id: 'hanover-park', name: 'Hanover Park Clinic', address: 'Hanover Park Ave', suburb: 'Hanover Park', phone: '+27 21 692 7000', openTime: '08:00', closeTime: '16:30', days: [1,2,3,4,5], distance: '6.0 km', lat: -33.9900, lng: 18.6110 },
  { id: 'langa-clinic', name: 'Langa Clinic', address: 'Langa', suburb: 'Langa', phone: '+27 21 694 1100', openTime: '08:00', closeTime: '16:30', days: [1,2,3,4,5], distance: '2.0 km', lat: -33.9440, lng: 18.5250 },
  { id: 'lansdowne', name: 'Lansdowne Clinic', address: 'Lansdowne Rd', suburb: 'Lansdowne', phone: '+27 21 697 2000', openTime: '08:00', closeTime: '16:30', days: [1,2,3,4,5], distance: '7.5 km', lat: -33.9930, lng: 18.4830 },
  { id: 'luvuyo-cdc', name: 'Luvuyo Community Day Centre', address: 'Luvuyo', suburb: 'Khayelitsha', phone: '+27 21 361 4000', openTime: '07:30', closeTime: '16:30', days: [1,2,3,4,5], distance: '5.0 km', lat: -34.0330, lng: 18.6650 },
  { id: 'maitland', name: 'Maitland Clinic', address: 'Maitland', suburb: 'Maitland', phone: '+27 21 593 3000', openTime: '08:00', closeTime: '16:30', days: [1,2,3,4,5], distance: '4.0 km', lat: -33.9240, lng: 18.4880 },
  { id: 'manenberg', name: 'Manenberg Clinic', address: 'Manenberg', suburb: 'Manenberg', phone: '+27 21 637 3000', openTime: '08:00', closeTime: '16:30', days: [1,2,3,4,5], distance: '8.5 km', lat: -33.9860, lng: 18.5520 },
  { id: 'masiphumelele', name: 'Masiphumelele Clinic', address: 'Masiphumelele', suburb: 'Ocean View', phone: '+27 21 785 4000', openTime: '08:00', closeTime: '16:30', days: [1,2,3,4,5], distance: '30.0 km', lat: -34.1300, lng: 18.3700 },
  { id: 'muizenberg', name: 'Muizenberg Clinic', address: 'Muizenberg', suburb: 'Muizenberg', phone: '+27 21 788 1200', openTime: '08:00', closeTime: '16:30', days: [1,2,3,4,5], distance: '25.0 km', lat: -34.1050, lng: 18.4680 },
  { id: 'parkwood', name: 'Parkwood Clinic', address: 'Parkwood', suburb: 'Parkwood', phone: '+27 21 797 2000', openTime: '08:00', closeTime: '16:30', days: [1,2,3,4,5], distance: '8.0 km', lat: -33.9800, lng: 18.4900 },
  { id: 'nyanga', name: 'Nyanga Clinic', address: 'Nyanga', suburb: 'Nyanga', phone: '+27 21 386 7000', openTime: '08:00', closeTime: '16:30', days: [1,2,3,4,5], distance: '12.0 km', lat: -33.9800, lng: 18.5850 },
  { id: 'philippi', name: 'Philippi Clinic', address: 'Philippi', suburb: 'Philippi', phone: '+27 21 372 1200', openTime: '08:00', closeTime: '16:30', days: [1,2,3,4,5], distance: '16.0 km', lat: -34.0050, lng: 18.5950 },
  { id: 'athlone', name: 'Athlone Clinic', address: 'Athlone', suburb: 'Athlone', phone: '+27 21 695 6000', openTime: '08:00', closeTime: '16:30', days: [1,2,3,4,5], distance: '6.5 km', lat: -33.9630, lng: 18.5100 },
  { id: 'bellville', name: 'Bellville Clinic', address: 'Bellville', suburb: 'Bellville', phone: '+27 21 948 6000', openTime: '08:00', closeTime: '16:30', days: [1,2,3,4,5], distance: '18.0 km', lat: -33.9000, lng: 18.6280 },
]

function toRad(deg: number) {
  return (deg * Math.PI) / 180
}

function haversineKm(aLat: number, aLng: number, bLat: number, bLng: number) {
  const R = 6371
  const dLat = toRad(bLat - aLat)
  const dLng = toRad(bLng - aLng)
  const h =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(aLat)) * Math.cos(toRad(bLat)) * Math.sin(dLng / 2) ** 2
  return 2 * R * Math.asin(Math.sqrt(h))
}

// Route an emergency to the community clinic nearest to the patient's GPS position.
export function nearestClinic(lat: number, lng: number): Clinic {
  let best = CLINICS[0]
  let bestDist = Infinity
  for (const c of CLINICS) {
    const d = haversineKm(lat, lng, c.lat, c.lng)
    if (d < bestDist) {
      bestDist = d
      best = c
    }
  }
  return best
}

export function clinicByName(name?: string | null): Clinic | undefined {
  if (!name) return undefined
  return CLINICS.find(c => c.name === name)
}
