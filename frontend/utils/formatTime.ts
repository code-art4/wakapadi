export function formattedTime(utcString: string) {
    const date = new Date(utcString);

    let hours = date.getUTCHours();
    const minutes = date.getUTCMinutes();
    const ampm = hours >= 12 ? 'PM' : 'AM';

    hours = hours % 12 || 12; // Convert to 12-hour format
    const paddedMinutes = minutes.toString().padStart(2, '0');

    return `${hours}:${paddedMinutes} ${ampm}`;
}  