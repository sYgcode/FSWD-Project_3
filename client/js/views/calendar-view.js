// calendar-view.js - Main calendar page view
export class CalendarView {
    constructor(app) {
        this.app = app;
        this.container = document.getElementById('app');
        this.template = document.getElementById('calendar-template');
        this.setupEventListeners();
    }

    render() {
        // Clear the container
        this.container.innerHTML = '';

        // Clone the template content
        const content = this.template.content.cloneNode(true);

        // Set username in the welcome message
        const user = this.app.authService.getCurrentUser();
        if (user) {
            const usernameDisplay = content.querySelector('#username-display');
            if (usernameDisplay) {
                usernameDisplay.textContent = user.username;
            }
        }

        // Append the content to the container
        this.container.appendChild(content);

        // Setup event listeners for the new elements
        this.setupCalendarEventListeners();
    }

    setupEventListeners() {
        // Global event listeners (not dependent on rendered elements)
    }

    setupCalendarEventListeners() {
        // Calendar event listeners (dependent on rendered elements)
        const logoutBtn = document.getElementById('logout-btn');
        if (logoutBtn) {
            logoutBtn.addEventListener('click', () => this.app.logout());
        }

        const addMeetingBtn = document.getElementById('add-meeting-btn');
        if (addMeetingBtn) {
            addMeetingBtn.addEventListener('click', () => this.app.showMeetingForm('add'));
        }
    }

    displayMeetings(meetings) {
        const meetingsList = document.getElementById('meetings-list');
        if (!meetingsList) return;

        // Clear the current list
        meetingsList.innerHTML = '';

        if (!meetings || meetings.length === 0) {
            meetingsList.innerHTML = '<p>No meetings found. Click "Add Meeting" to create one.</p>';
            return;
        }

        // Sort meetings by date and time
        const sortedMeetings = [...meetings].sort((a, b) => {
            const dateA = new Date(`${a.date}T${a.startTime}`);
            const dateB = new Date(`${b.date}T${b.startTime}`);
            return dateA - dateB;
        });

        // Add each meeting to the list
        sortedMeetings.forEach(meeting => {
            const listItem = document.createElement('li');
            listItem.className = 'meeting-item';
            listItem.dataset.title = meeting.title;

            const dateObj = new Date(meeting.date);
            const formattedDate = dateObj.toLocaleDateString('en-US', {
                weekday: 'short',
                month: 'short',
                day: 'numeric'
            });

            listItem.innerHTML = `
                <h4>${meeting.title}</h4>
                <p>${formattedDate}, ${meeting.startTime} - ${meeting.endTime}</p>
            `;

            listItem.addEventListener('click', () => {
                this.app.showMeetingDetails(meeting);
            });

            meetingsList.appendChild(listItem);
        });

        // Also display meetings in the calendar view
        this.renderCalendarView(sortedMeetings);
    }

    renderCalendarView(meetings) {
        const calendarView = document.getElementById('calendar-view');
        if (!calendarView) return;

        // Group meetings by date
        const meetingsByDate = {};
        meetings.forEach(meeting => {
            if (!meetingsByDate[meeting.date]) {
                meetingsByDate[meeting.date] = [];
            }
            meetingsByDate[meeting.date].push(meeting);
        });

        // Get current month calendar
        const today = new Date();
        const currentYear = today.getFullYear();
        const currentMonth = today.getMonth();

        // Generate calendar HTML
        const calendarHTML = this.generateCalendarHTML(currentYear, currentMonth, meetingsByDate);
        calendarView.innerHTML = calendarHTML;
    }

    generateCalendarHTML(year, month, meetingsByDate) {
        const firstDay = new Date(year, month, 1);
        const lastDay = new Date(year, month + 1, 0);
        const daysInMonth = lastDay.getDate();
        const startingDayOfWeek = firstDay.getDay(); // 0 (Sunday) to 6 (Saturday)

        const monthNames = [
            'January', 'February', 'March', 'April', 'May', 'June',
            'July', 'August', 'September', 'October', 'November', 'December'
        ];

        let html = `
            <div class="calendar-header">
                <h2>${monthNames[month]} ${year}</h2>
            </div>
            <table class="calendar-table">
                <thead>
                    <tr>
                        <th>Sun</th>
                        <th>Mon</th>
                        <th>Tue</th>
                        <th>Wed</th>
                        <th>Thu</th>
                        <th>Fri</th>
                        <th>Sat</th>
                    </tr>
                </thead>
                <tbody>
        `;

        // Create calendar rows
        let dayCount = 1;
        const totalCells = Math.ceil((daysInMonth + startingDayOfWeek) / 7) * 7;

        for (let i = 0; i < totalCells; i++) {
            // Start a new row at the beginning of the week
            if (i % 7 === 0) {
                html += '<tr>';
            }

            // Add empty cells for days before the first of the month
            if (i < startingDayOfWeek || dayCount > daysInMonth) {
                html += '<td class="empty-day"></td>';
            } else {
                // Format date string to match the format used in meetingsByDate
                const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(dayCount).padStart(2, '0')}`;
                const meetings = meetingsByDate[dateStr] || [];

                const isToday = (
                    new Date().getDate() === dayCount &&
                    new Date().getMonth() === month &&
                    new Date().getFullYear() === year
                );

                html += `<td class="calendar-day ${isToday ? 'today' : ''}">
                    <div class="day-number">${dayCount}</div>`;

                // Add meetings for this day
                if (meetings.length > 0) {
                    html += '<div class="day-events">';
                    meetings.forEach(meeting => {
                        html += `<div class="day-event" data-title="${meeting.title}">
                            <div class="event-time">${meeting.startTime}</div>
                            <div class="event-title">${meeting.title}</div>
                        </div>`;
                    });
                    html += '</div>';
                }

                html += '</td>';
                dayCount++;
            }

            // End the row at the end of the week
            if ((i + 1) % 7 === 0) {
                html += '</tr>';
            }
        }

        html += `
                </tbody>
            </table>
        `;

        return html;
    }
}