class GameLogger {
    // settings
    static readonly DEBUG = false;
    static readonly ERROR = true;

    // Helper function to get nice DateTime format
    static formatDateTime = (date = new Date()) => {
        const pad = (num) => String(num).padStart(2, '0');
        const [month, day, year, hour, minute, second, tz] = date.toLocaleString('en-US', {
            month: '2-digit', day: '2-digit', year: 'numeric',
            hour: '2-digit', minute: '2-digit', second: '2-digit', 
            hour12: false, timeZoneName: 'short'
        }).split(/[/,:\s]/).filter(Boolean);
        return `${year}-${pad(month)}-${pad(day)} ${pad(hour)}:${pad(minute)}:${pad(second)} ${tz}`; 
    }

    // Print Debug log message
    static debugMsg = (s) => { 
        if (this.DEBUG)
            console.log(`[${GameLogger.formatDateTime()}] ${s}`); 
    }

    // Print Error log message
    static errorMsg = (s) => { 
        if (this.ERROR)
            console.error(`[${GameLogger.formatDateTime()}] ${s}`); 
    }
}

export default GameLogger;