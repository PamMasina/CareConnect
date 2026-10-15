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
}

export const CLINICS: Clinic[] = [
  { id: 'langa-chc', name: 'Langa CHC', address: 'Washington Rd', suburb: 'Langa', phone: '+27 21 694 3000', openTime: '07:30', closeTime: '19:00', days: [1,2,3,4,5,6], distance: '2.1 km' },
  { id: 'khayelitsha-clinic', name: 'Khayelitsha Clinic', address: 'Ntlazana Rd', suburb: 'Khayelitsha', phone: '+27 21 360 8400', openTime: '08:00', closeTime: '17:00', days: [1,2,3,4,5], distance: '4.8 km' },
  { id: 'mitchells-cdc', name: "Mitchells Plain CDC", address: 'AZ Berman Dr', suburb: "Mitchells Plain", phone: '+27 21 370 0730', openTime: '08:00', closeTime: '16:00', days: [1,2,3,4,5], distance: '9.2 km' },
  { id: 'gugulethu-chc', name: 'Gugulethu CHC', address: 'NY 108', suburb: 'Gugulethu', phone: '+27 21 638 6300', openTime: '07:00', closeTime: '20:00', days: [1,2,3,4,5], distance: '11.4 km' },
  { id: 'cape-town-community', name: 'Cape Town Community Clinic', address: '123 Long Street', suburb: 'Cape Town CBD', phone: '+27 21 000 0000', openTime: '08:00', closeTime: '17:00', days: [1,2,3,4,5], distance: '3.0 km' },
  { id: 'adriaanse', name: 'Adriaanse Clinic', address: 'Adriaanse Ave', suburb: 'Bellville', phone: '+27 21 946 1111', openTime: '08:00', closeTime: '16:30', days: [1,2,3,4,5], distance: '5.5 km' },
  { id: 'albow-gardens', name: 'Albow Gardens Community Day Centre', address: 'Albow Gardens', suburb: 'Mitchells Plain', phone: '+27 21 392 5000', openTime: '07:30', closeTime: '16:30', days: [1,2,3,4,5], distance: '8.0 km' },
  { id: 'delft-south', name: 'Delft South Clinic', address: 'Delft South', suburb: 'Delft', phone: '+27 21 954 2000', openTime: '08:00', closeTime: '16:30', days: [1,2,3,4,5], distance: '15.0 km' },
  { id: 'eastridge', name: 'Eastridge Clinic', address: 'Eastridge', suburb: 'Mitchells Plain', phone: '+27 21 392 1200', openTime: '08:00', closeTime: '16:30', days: [1,2,3,4,5], distance: '10.5 km' },
  { id: 'hanover-park', name: 'Hanover Park Clinic', address: 'Hanover Park Ave', suburb: 'Hanover Park', phone: '+27 21 692 7000', openTime: '08:00', closeTime: '16:30', days: [1,2,3,4,5], distance: '6.0 km' },
  { id: 'langa-clinic', name: 'Langa Clinic', address: 'Langa', suburb: 'Langa', phone: '+27 21 694 1100', openTime: '08:00', closeTime: '16:30', days: [1,2,3,4,5], distance: '2.0 km' },
  { id: 'lansdowne', name: 'Lansdowne Clinic', address: 'Lansdowne Rd', suburb: 'Lansdowne', phone: '+27 21 697 2000', openTime: '08:00', closeTime: '16:30', days: [1,2,3,4,5], distance: '7.5 km' },
  { id: 'luvuyo-cdc', name: 'Luvuyo Community Day Centre', address: 'Luvuyo', suburb: 'Khayelitsha', phone: '+27 21 361 4000', openTime: '07:30', closeTime: '16:30', days: [1,2,3,4,5], distance: '5.0 km' },
  { id: 'maitland', name: 'Maitland Clinic', address: 'Maitland', suburb: 'Maitland', phone: '+27 21 593 3000', openTime: '08:00', closeTime: '16:30', days: [1,2,3,4,5], distance: '4.0 km' },
  { id: 'manenberg', name: 'Manenberg Clinic', address: 'Manenberg', suburb: 'Manenberg', phone: '+27 21 637 3000', openTime: '08:00', closeTime: '16:30', days: [1,2,3,4,5], distance: '8.5 km' },
  { id: 'masiphumelele', name: 'Masiphumelele Clinic', address: 'Masiphumelele', suburb: 'Ocean View', phone: '+27 21 785 4000', openTime: '08:00', closeTime: '16:30', days: [1,2,3,4,5], distance: '30.0 km' },
  { id: 'muizenberg', name: 'Muizenberg Clinic', address: 'Muizenberg', suburb: 'Muizenberg', phone: '+27 21 788 1200', openTime: '08:00', closeTime: '16:30', days: [1,2,3,4,5], distance: '25.0 km' },
  { id: 'parkwood', name: 'Parkwood Clinic', address: 'Parkwood', suburb: 'Parkwood', phone: '+27 21 797 2000', openTime: '08:00', closeTime: '16:30', days: [1,2,3,4,5], distance: '8.0 km' },
  { id: 'nyanga', name: 'Nyanga Clinic', address: 'Nyanga', suburb: 'Nyanga', phone: '+27 21 386 7000', openTime: '08:00', closeTime: '16:30', days: [1,2,3,4,5], distance: '12.0 km' },
  { id: 'philippi', name: 'Philippi Clinic', address: 'Philippi', suburb: 'Philippi', phone: '+27 21 372 1200', openTime: '08:00', closeTime: '16:30', days: [1,2,3,4,5], distance: '16.0 km' },
  { id: 'athlone', name: 'Athlone Clinic', address: 'Athlone', suburb: 'Athlone', phone: '+27 21 695 6000', openTime: '08:00', closeTime: '16:30', days: [1,2,3,4,5], distance: '6.5 km' },
  { id: 'bellville', name: 'Bellville Clinic', address: 'Bellville', suburb: 'Bellville', phone: '+27 21 948 6000', openTime: '08:00', closeTime: '16:30', days: [1,2,3,4,5], distance: '18.0 km' },
]