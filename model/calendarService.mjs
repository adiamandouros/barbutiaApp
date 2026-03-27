import { google } from 'googleapis';
import 'dotenv/config';

// Formats a Date as a local-time string for Google Calendar.
// Using toISOString() would give UTC ("Z"), causing the event to land at the
// wrong wall-clock hour when combined with a timeZone field. Instead we emit
// the local components so Google Calendar interprets them in Europe/Athens.
function toLocalDateTimeString(date) {
    const pad = n => String(n).padStart(2, '0');
    return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}` +
           `T${pad(date.getHours())}:${pad(date.getMinutes())}:00`;
}

class CalendarService {
    constructor() {
        this.calendar = null;
        this.initialized = false;
    }

    async initialize() {
        const { GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET, GOOGLE_REFRESH_TOKEN } = process.env;
        if (!GOOGLE_CLIENT_ID || !GOOGLE_CLIENT_SECRET || !GOOGLE_REFRESH_TOKEN) {
            throw new Error('Google Calendar credentials are not configured in environment variables.');
        }

        const oauth2Client = new google.auth.OAuth2(
            GOOGLE_CLIENT_ID,
            GOOGLE_CLIENT_SECRET,
            'urn:ietf:wg:oauth:2.0:oob'
        );
        oauth2Client.setCredentials({ refresh_token: GOOGLE_REFRESH_TOKEN });

        this.calendar = google.calendar({ version: 'v3', auth: oauth2Client });
        this.initialized = true;
        console.log('Calendar: service initialized.');
    }

    async ensureInitialized() {
        if (!this.initialized) await this.initialize();
    }

    buildEvent(match) {
        const ourTeam = 'Μπαρμπούτια';
        const title = match.isHome
            ? `${ourTeam} vs ${match.teamName}`
            : `${match.teamName} vs ${ourTeam}`;

        const startStr = toLocalDateTimeString(match.date);
        const endStr = toLocalDateTimeString(new Date(match.date.getTime() + 2 * 60 * 60 * 1000));

        return {
            summary: title,
            location: match.place,
            description: `${match.league}\n${match.isHome ? 'Εντός έδρας' : 'Εκτός έδρας'}\nΑντίπαλος: ${match.teamName}`,
            start: { dateTime: startStr, timeZone: 'Europe/Athens' },
            end:   { dateTime: endStr,   timeZone: 'Europe/Athens' },
            colorId: '3',
            reminders: {
                useDefault: false,
                overrides: [
                    { method: 'popup', minutes: 60 },
                    { method: 'popup', minutes: 15 }
                ]
            }
        };
    }

    async createMatchEvent(match) {
        await this.ensureInitialized();
        const response = await this.calendar.events.insert({
            calendarId: process.env.GOOGLE_CALENDAR_ID,
            resource: this.buildEvent(match)
        });
        console.log(`Calendar: created event ${response.data.id} for ${match.teamName}`);
        return response.data.id;
    }

    async updateMatchEvent(eventId, match) {
        await this.ensureInitialized();
        await this.calendar.events.update({
            calendarId: process.env.GOOGLE_CALENDAR_ID,
            eventId,
            resource: this.buildEvent(match)
        });
        console.log(`Calendar: updated event ${eventId} for ${match.teamName}`);
    }

    async deleteMatchEvent(eventId) {
        await this.ensureInitialized();
        await this.calendar.events.delete({
            calendarId: process.env.GOOGLE_CALENDAR_ID,
            eventId
        });
        console.log(`Calendar: deleted event ${eventId}`);
    }
}

export default new CalendarService();
