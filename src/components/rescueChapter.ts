export const STREAM_URL = 'solace-watch8r3.onion';
export const TRAINING_GPS = '12.34567, -45.67890';
export const PHOTO_FILES = ['IMG_0211.png','IMG_0212.png','IMG_0213.png','IMG_0214.png','IMG_0215.png','IMG_0216.png'];
export const CARRIER = 'IMG_0214.png';
export const rescueState = { drive: false, scanned: new Set<string>(), metadata: false, location: false, finalDrive: false, police: false };
export const chapterChanged = () => window.dispatchEvent(new Event('rescue-chapter'));
export function unlockPhotoDrive(password: string) { const valid = password.trim().toUpperCase() === 'VESPER-MORROW-CINDER'; if (valid) { rescueState.drive = true; chapterChanged(); } return valid; }
export function scanPhoto(file: string) {
 if (!rescueState.drive || !PHOTO_FILES.includes(file)) return 'ACCESS DENIED: open case_drive and select an evidence image.';
 rescueState.scanned.add(file); chapterChanged();
 return file === CARRIER ? 'PNG TRAILER FOUND\nEmbedded record: original_exif\nCarrier integrity: VALID\nCamera marker: RELAY-884\nOriginal GPS record recovered. Open this same image in Metadata Inspector.' : file === 'IMG_0212.png' ? 'PNG TRAILER FOUND\nRecord checksum: INVALID\nRepacked thumbnail / copied metadata. Do not use this coordinate source.' : 'No recoverable original metadata capsule. This is a stripped derivative image.';
}
export function inspectPhoto(file: string) {
 if (!rescueState.drive || !PHOTO_FILES.includes(file)) return 'ACCESS DENIED: select an image from case_drive.';
 if (file !== CARRIER) return 'EXIF: absent or unverified\nGPS: NOT TRUSTWORTHY\nThis derivative cannot establish the location.';
 if (!rescueState.scanned.has(CARRIER)) return 'Embedded record not mounted. Analyze the image in StegoSuite first.';
 rescueState.metadata = true; chapterChanged();
 return `SOURCE: ${CARRIER}\nRecord: original_exif / verified carrier\nCamera: RELAY-884\nGPSLatitude: 12.34567 N\nGPSLongitude: 45.67890 W\nDecimal GPS: ${TRAINING_GPS}\nLocation label: CINDER / north service room\nTRAINING COORDINATES — fictional game evidence, not a real rescue location.\nKeep the minus sign for west. Post the decimal pair in the stream's public chat.`;
}
export function coordinatesMatch(input: string) {
 const parts = input.trim().split(/[,;\s]+/).filter(Boolean).map(Number);
 return parts.length === 2 && parts.every(Number.isFinite) && Math.abs(parts[0] - 12.34567) < .000001 && Math.abs(parts[1] + 45.67890) < .000001;
}
export function verifyStreamLocation(input: string) {
 if (!rescueState.metadata || !coordinatesMatch(input)) return false;
 rescueState.location = true; chapterChanged(); return true;
}
export function unlockFinalDrive(input: string) {
 if (!rescueState.location || !coordinatesMatch(input)) return false;
 rescueState.finalDrive = true; chapterChanged(); return true;
}
export function contactGamePolice() {
 if (!rescueState.finalDrive) return false;
 rescueState.police = true; chapterChanged(); return true;
}

