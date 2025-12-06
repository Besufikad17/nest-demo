export function addDays(date: Date, days: number): Date {
	const newDate = new Date(date);
	newDate.setDate(date.getDate() + days);
	return newDate;
}

export function addHours(date: Date, hours: number): Date {
	const newDate = new Date(date);
	newDate.setHours(date.getHours() + hours);
	return newDate;
}

export function addMinutes(date: Date, minutes: number): Date {
	const newDate = new Date(date);
	newDate.setMinutes(date.getMinutes() + minutes);
	return newDate;
}
