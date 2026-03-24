// ===== Data Models & Persistence =====

const TRACKING = {
    YES_NO: 'yesNo',
    COUNTER: 'counter',
    DURATION: 'duration',
    MULTI_SELECT: 'multiSelect',
    SINGLE_SELECT: 'singleSelect',
    SELECT_WITH_DURATION: 'singleSelectWithDuration',
};

const TRACKING_LABELS = {
    [TRACKING.YES_NO]: 'Yes / No',
    [TRACKING.COUNTER]: 'Counter',
    [TRACKING.DURATION]: 'Duration',
    [TRACKING.MULTI_SELECT]: 'Multi-Select',
    [TRACKING.SINGLE_SELECT]: 'Single-Select',
    [TRACKING.SELECT_WITH_DURATION]: 'Select + Duration',
};

// Day-of-week constants matching JS Date.getDay()
const DAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
const DAYS_SHORT = ['S', 'M', 'T', 'W', 'T', 'F', 'S'];
const ALL_DAYS = [0, 1, 2, 3, 4, 5, 6];
const WEEKDAYS = [1, 2, 3, 4, 5];
const MWF = [1, 3, 5];

function uuid() {
    return crypto.randomUUID ? crypto.randomUUID() :
        'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, c => {
            const r = Math.random() * 16 | 0;
            return (c === 'x' ? r : (r & 0x3 | 0x8)).toString(16);
        });
}

function todayString() {
    const d = new Date();
    return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`;
}

function friendlyDate() {
    return new Date().toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });
}

function getTimeOfDay() {
    const h = new Date().getHours();
    if (h >= 5 && h < 12) return 'morning';
    if (h >= 12 && h < 17) return 'afternoon';
    if (h >= 17 && h < 21) return 'evening';
    return 'night';
}

function getSeason() {
    const m = new Date().getMonth();
    if (m >= 2 && m <= 4) return 'spring';
    if (m >= 5 && m <= 7) return 'summer';
    if (m >= 8 && m <= 10) return 'autumn';
    return 'winter';
}

// ===== Icon Inference =====
const ICON_KEYWORDS = {
    water: ['water', 'hydrat', 'drink', 'bottle'],
    climbing: ['climb', 'boulder', 'rope'],
    strength: ['strength', 'weight', 'lift', 'gym', 'dumbbell'],
    rolling: ['roll', 'foam', 'massage'],
    protein: ['protein', 'shake', 'whey'],
    pill: ['creatine', 'supplement', 'vitamin', 'pill', 'medicine'],
    bowl: ['oat', 'cereal', 'breakfast', 'meal', 'food'],
    breathing: ['breath', 'diaphragm', 'lung', 'meditat'],
    tennis: ['tennis', 'racket', 'badminton', 'squash'],
    running: ['run', 'jog', 'sprint', 'marathon'],
    cycling: ['cycl', 'bike', 'bicycle'],
    yoga: ['yoga', 'stretch', 'flexibility'],
    sleep: ['sleep', 'nap', 'rest', 'bed'],
    reading: ['read', 'book', 'study'],
    swimming: ['swim', 'pool'],
    walking: ['walk', 'step', 'hike'],
    phone: ['call', 'phone', 'parent', 'family'],
    heart: ['heart', 'cardio'],
};

function inferIcon(name) {
    const lower = name.toLowerCase();
    for (const [icon, keywords] of Object.entries(ICON_KEYWORDS)) {
        if (keywords.some(kw => lower.includes(kw))) return icon;
    }
    return 'default';
}

// ===== Store =====
class DataStore {
    constructor() {
        this.activities = JSON.parse(localStorage.getItem('anvaya_activities') || '[]');
        this.logs = JSON.parse(localStorage.getItem('anvaya_logs') || '[]');
        if (this.activities.length === 0) {
            this.seedDefaults();
        } else {
            this.migrate();
        }
        this.cleanupOldExtras();
    }

    save() {
        localStorage.setItem('anvaya_activities', JSON.stringify(this.activities));
        localStorage.setItem('anvaya_logs', JSON.stringify(this.logs));
    }

    // ===== Migration for existing data =====
    migrate() {
        let changed = false;
        this.activities.forEach(a => {
            // Add cadence if missing
            if (!a.cadence) {
                a.cadence = ALL_DAYS.slice();
                changed = true;
            }
            // Convert counterGoal to goal object
            if (!a.goal) {
                if (a.counterGoal) {
                    a.goal = { type: 'counter', target: a.counterGoal };
                } else if (a.trackingType === TRACKING.DURATION) {
                    a.goal = { type: 'completion' };
                } else if (a.trackingType === TRACKING.MULTI_SELECT) {
                    a.goal = { type: 'completion' };
                } else {
                    a.goal = { type: 'completion' };
                }
                changed = true;
            }
            // Add icon if missing
            if (!a.icon) {
                a.icon = inferIcon(a.name);
                changed = true;
            }
        });
        if (changed) this.save();
    }

    // ===== User Profile =====
    getUserProfile() {
        return JSON.parse(localStorage.getItem('anvaya_user') || 'null');
    }

    setUserProfile(data) {
        localStorage.setItem('anvaya_user', JSON.stringify(data));
    }

    hasUser() {
        return this.getUserProfile() !== null;
    }

    // ===== Extras (non-scheduled activities added for today) =====
    getExtrasToday() {
        const extras = JSON.parse(localStorage.getItem('anvaya_extras') || '[]');
        const today = todayString();
        return extras.filter(e => e.date === today);
    }

    addExtraForToday(activityId) {
        const extras = JSON.parse(localStorage.getItem('anvaya_extras') || '[]');
        const today = todayString();
        if (!extras.some(e => e.activityId === activityId && e.date === today)) {
            extras.push({ activityId, date: today });
            localStorage.setItem('anvaya_extras', JSON.stringify(extras));
        }
    }

    cleanupOldExtras() {
        const extras = JSON.parse(localStorage.getItem('anvaya_extras') || '[]');
        const today = todayString();
        const recent = extras.filter(e => e.date === today);
        localStorage.setItem('anvaya_extras', JSON.stringify(recent));
    }

    // ===== Activities =====
    activeActivities() {
        return this.activities
            .filter(a => !a.isArchived)
            .sort((a, b) => a.sortOrder - b.sortOrder);
    }

    archivedActivities() {
        return this.activities.filter(a => a.isArchived);
    }

    todayScheduledActivities() {
        const dayOfWeek = new Date().getDay();
        const extraIds = this.getExtrasToday().map(e => e.activityId);
        return this.activeActivities().filter(a =>
            (a.cadence && a.cadence.includes(dayOfWeek)) || extraIds.includes(a.id)
        );
    }

    unscheduledActivities() {
        const dayOfWeek = new Date().getDay();
        const extraIds = this.getExtrasToday().map(e => e.activityId);
        return this.activeActivities().filter(a =>
            a.cadence && !a.cadence.includes(dayOfWeek) && !extraIds.includes(a.id)
        );
    }

    addActivity(a) {
        if (!a.cadence) a.cadence = ALL_DAYS.slice();
        if (!a.goal) a.goal = { type: 'completion' };
        if (!a.icon) a.icon = inferIcon(a.name);
        this.activities.push(a);
        this.save();
    }

    updateActivity(updated) {
        if (!updated.icon) updated.icon = inferIcon(updated.name);
        const idx = this.activities.findIndex(a => a.id === updated.id);
        if (idx >= 0) { this.activities[idx] = updated; this.save(); }
    }

    archiveActivity(id) {
        const a = this.activities.find(x => x.id === id);
        if (a) { a.isArchived = true; this.save(); }
    }

    restoreActivity(id) {
        const a = this.activities.find(x => x.id === id);
        if (a) { a.isArchived = false; this.save(); }
    }

    reorderActivities(orderedIds) {
        orderedIds.forEach((id, i) => {
            const a = this.activities.find(x => x.id === id);
            if (a) a.sortOrder = i;
        });
        this.save();
    }

    // ===== Logs =====
    todayLogs() {
        const today = todayString();
        return this.logs.filter(l => l.date === today);
    }

    logsForActivity(activityId) {
        const today = todayString();
        return this.logs.filter(l => l.activityId === activityId && l.date === today);
    }

    addLog(log) {
        this.logs.push(log);
        this.save();
    }

    updateLog(log) {
        const idx = this.logs.findIndex(l => l.id === log.id);
        if (idx >= 0) { this.logs[idx] = log; this.save(); }
    }

    deleteLog(logId) {
        this.logs = this.logs.filter(l => l.id !== logId);
        this.save();
    }

    // ===== Progress Calculation =====
    calculateProgress(activity, logs) {
        const log = logs.length > 0 ? logs[logs.length - 1] : null;
        const goal = activity.goal || { type: 'completion' };

        switch (goal.type) {
            case 'counter': {
                const value = log ? (log.counterValue || 0) : 0;
                const target = goal.target || 1;
                return { value, max: target, percentage: Math.min(100, Math.round((value / target) * 100)), isComplete: value >= target };
            }
            case 'duration': {
                const value = log ? (log.durationMinutes || 0) : 0;
                const target = goal.targetMinutes || 60;
                return { value, max: target, percentage: Math.min(100, Math.round((value / target) * 100)), isComplete: value >= target };
            }
            case 'multiSelect': {
                const value = log && log.selectedTags ? log.selectedTags.length : 0;
                const target = goal.targetCount || 1;
                return { value, max: target, percentage: Math.min(100, Math.round((value / target) * 100)), isComplete: value >= target };
            }
            case 'completion':
            default: {
                const done = log !== null && (
                    log.boolValue === true ||
                    log.selectedOption !== undefined ||
                    log.durationMinutes !== undefined ||
                    (log.selectedTags && log.selectedTags.length > 0)
                );
                return { value: done ? 1 : 0, max: 1, percentage: done ? 100 : 0, isComplete: done };
            }
        }
    }

    todayProgress() {
        const scheduled = this.todayScheduledActivities();
        let done = 0;
        scheduled.forEach(a => {
            const logs = this.logsForActivity(a.id);
            const progress = this.calculateProgress(a, logs);
            if (progress.isComplete) done++;
        });
        return { done, total: scheduled.length };
    }

    // ===== Seed Defaults =====
    seedDefaults() {
        this.activities = [
            {
                id: uuid(), name: 'Climbing', subtitle: '', emoji: '\u{1F9D7}',
                trackingType: TRACKING.SELECT_WITH_DURATION, sortOrder: 0,
                isArchived: false, createdAt: new Date().toISOString(),
                counterGoal: null, options: ['Boulder', 'Rope', 'Both'],
                tags: [], durationPresets: [30, 45, 60, 90, 120],
                cadence: [2, 4, 6], // Tue, Thu, Sat
                goal: { type: 'completion' },
                icon: 'climbing',
            },
            {
                id: uuid(), name: 'Water', subtitle: 'Goal: 4 bottles', emoji: '\u{1F4A7}',
                trackingType: TRACKING.COUNTER, sortOrder: 1,
                isArchived: false, createdAt: new Date().toISOString(),
                counterGoal: 4, options: [], tags: [], durationPresets: [],
                cadence: ALL_DAYS.slice(),
                goal: { type: 'counter', target: 4 },
                icon: 'water',
            },
            {
                id: uuid(), name: 'Strength Training', subtitle: '', emoji: '\u{1F4AA}',
                trackingType: TRACKING.SINGLE_SELECT, sortOrder: 2,
                isArchived: false, createdAt: new Date().toISOString(),
                counterGoal: null, options: ['Strength', 'Core', 'Plyo'],
                tags: [], durationPresets: [],
                cadence: MWF.slice(),
                goal: { type: 'completion' },
                icon: 'strength',
            },
            {
                id: uuid(), name: 'Rolling', subtitle: '', emoji: '\u{1F535}',
                trackingType: TRACKING.MULTI_SELECT, sortOrder: 3,
                isArchived: false, createdAt: new Date().toISOString(),
                counterGoal: null, options: [],
                tags: ['Adductors', 'Hip Flexors', 'Lats', 'Serratus', 'Chest', 'Quads', 'Hamstrings', 'Calves', 'Glutes', 'Upper Back'],
                durationPresets: [],
                cadence: ALL_DAYS.slice(),
                goal: { type: 'completion' },
                icon: 'rolling',
            },
            {
                id: uuid(), name: 'Protein Drink', subtitle: '', emoji: '\u{1F964}',
                trackingType: TRACKING.YES_NO, sortOrder: 4,
                isArchived: false, createdAt: new Date().toISOString(),
                counterGoal: null, options: [], tags: [], durationPresets: [],
                cadence: ALL_DAYS.slice(),
                goal: { type: 'completion' },
                icon: 'protein',
            },
            {
                id: uuid(), name: 'Creatine', subtitle: '', emoji: '\u{1F48A}',
                trackingType: TRACKING.YES_NO, sortOrder: 5,
                isArchived: false, createdAt: new Date().toISOString(),
                counterGoal: null, options: [], tags: [], durationPresets: [],
                cadence: ALL_DAYS.slice(),
                goal: { type: 'completion' },
                icon: 'pill',
            },
            {
                id: uuid(), name: 'Overnight Oats', subtitle: '', emoji: '\u{1F963}',
                trackingType: TRACKING.YES_NO, sortOrder: 6,
                isArchived: false, createdAt: new Date().toISOString(),
                counterGoal: null, options: [], tags: [], durationPresets: [],
                cadence: ALL_DAYS.slice(),
                goal: { type: 'completion' },
                icon: 'bowl',
            },
            {
                id: uuid(), name: 'Diaphragmatic Breathing', subtitle: '', emoji: '\u{1F32C}\u{FE0F}',
                trackingType: TRACKING.DURATION, sortOrder: 7,
                isArchived: false, createdAt: new Date().toISOString(),
                counterGoal: null, options: [], tags: [],
                durationPresets: [5, 10, 15, 20, 30],
                cadence: ALL_DAYS.slice(),
                goal: { type: 'duration', targetMinutes: 15 },
                icon: 'breathing',
            },
            {
                id: uuid(), name: 'Tennis', subtitle: '', emoji: '\u{1F3BE}',
                trackingType: TRACKING.DURATION, sortOrder: 8,
                isArchived: false, createdAt: new Date().toISOString(),
                counterGoal: null, options: [], tags: [],
                durationPresets: [30, 45, 60, 90, 120],
                cadence: [0, 6], // Weekends
                goal: { type: 'duration', targetMinutes: 60 },
                icon: 'tennis',
            },
        ];
        this.save();
    }
}
