import { google } from 'googleapis';
import 'dotenv/config';

class CalendarService {
    constructor() {
        this.calendar = null;
        this.initialized = false;
        this.oauth2Client = null;
    }

    async initialize() {
        try {
            // Use OAuth 2.0 with refresh token (works around organization policies)
            this.oauth2Client = new google.auth.OAuth2(
                process.env.GOOGLE_CLIENT_ID,
                process.env.GOOGLE_CLIENT_SECRET,
                'http://localhost:3000/auth/callback'
            );

            // Set the refresh token (you'll get this from initial OAuth flow)
            this.oauth2Client.setCredentials({
                refresh_token: process.env.GOOGLE_REFRESH_TOKEN
            });

            this.calendar = google.calendar({ version: 'v3', auth: this.oauth2Client });
            this.initialized = true;
            console.log('✅ Google Calendar service initialized with OAuth 2.0');
            return true;
        } catch (error) {
            console.error('❌ Failed to initialize Google Calendar service:', error.message);
            return false;
        }
    }

    async createMatchEvent(match) {
        if (!this.initialized && !await this.initialize()) {
            throw new Error('Calendar service not initialized');
        }

        try {
            const event = this.formatMatchEvent(match);
            
            const response = await this.calendar.events.insert({
                calendarId: process.env.GOOGLE_CALENDAR_ID,
                resource: event
            });

            console.log(`✅ Created calendar event: ${response.data.id}`);
            return response.data.id;
        } catch (error) {
            console.error('❌ Failed to create calendar event:', error.message);
            throw error;
        }
    }

    async updateMatchEvent(eventId, match) {
        if (!this.initialized && !await this.initialize()) {
            throw new Error('Calendar service not initialized');
        }

        try {
            const event = this.formatMatchEvent(match);
            
            const response = await this.calendar.events.update({
                calendarId: process.env.GOOGLE_CALENDAR_ID,
                eventId: eventId,
                resource: event
            });

            console.log(`✅ Updated calendar event: ${eventId}`);
            return response.data.id;
        } catch (error) {
            console.error('❌ Failed to update calendar event:', error.message);
            throw error;
        }
    }

    async deleteMatchEvent(eventId) {
        if (!this.initialized && !await this.initialize()) {
            throw new Error('Calendar service not initialized');
        }

        try {
            await this.calendar.events.delete({
                calendarId: process.env.GOOGLE_CALENDAR_ID,
                eventId: eventId
            });

            console.log(`✅ Deleted calendar event: ${eventId}`);
            return true;
        } catch (error) {
            console.error('❌ Failed to delete calendar event:', error.message);
            throw error;
        }
    }

    formatMatchEvent(match) {
        const ourTeam = "Μπαρμπούτια";
        const opponent = match.teamName;
        
        // Determine match title based on home/away
        const title = match.isHome 
            ? `🏀 ${ourTeam} vs ${opponent}` 
            : `🏀 ${opponent} vs ${ourTeam}`;

        // Format event for Google Calendar
        const event = {
            summary: title,
            location: match.place,
            description: `
🏀 **${match.league}**
${match.isHome ? '🏠 Home Game' : '✈️ Away Game'}

**Opponent:** ${opponent}
**Venue:** ${match.place}
**League:** ${match.league}

Go Μπαρμπούτια! 💜🖤
            `.trim(),
            start: {
                dateTime: match.date.toISOString(),
                timeZone: 'Europe/Athens'
            },
            end: {
                dateTime: new Date(match.date.getTime() + 2 * 60 * 60 * 1000).toISOString(), // +2 hours
                timeZone: 'Europe/Athens'
            },
            colorId: match.isHome ? '10' : '8', // Green for home, Gray for away
            reminders: {
                useDefault: false,
                overrides: [
                    { method: 'popup', minutes: 60 }, // 1 hour before
                    { method: 'popup', minutes: 15 }  // 15 minutes before
                ]
            }
        };

        return event;
    }
}

export default new CalendarService();