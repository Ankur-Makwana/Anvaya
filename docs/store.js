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

// ===== Store =====
class DataStore {
    constructor() {
        this.activities = JSON.parse(localStorage.getItem('anvaya_activities') || '[]');
        this.logs = JSON.parse(localStorage.getItem('anvaya_logs') || '[]');
        if (this.activities.length === 0) this.seedDefaults();
    }

    save() {
        localStorage.setItem('anvaya_activities', JSON.stringify(this.activities));
        localStorage.setItem('anvaya_logs', JSON.stringify(this.logs));
    }

    // Activities
    activeActivities() {
        return this.activities
            .filter(a => !a.isArchived)
            .sort((a, b) => a.sortOrder - b.sortOrder);
    }

    archivedActivities() {
        return this.activities.filter(a => a.isArchived);
    }

    addActivity(a) {
        this.activities.push(a);
        this.save();
    }

    updateActivity(updated) {
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

    // Logs
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

    // Seed defaults
    seedDefaults() {
        this.activities = [
            {
                id: uuid(), name: 'Climbing', subtitle: '', emoji: '\u{1F9D7}',
                trackingType: TRACKING.SELECT_WITH_DURATION, sortOrder: 0,
                isArchived: false, createdAt: new Date().toISOString(),
                counterGoal: null, options: ['Boulder', 'Rope', 'Both'],
                tags: [], durationPresets: [30, 45, 60, 90, 120],
            },
            {
                id: uuid(), name: 'Water', subtitle: 'Goal: 4 bottles', emoji: '\u{1F4A7}',
                trackingType: TRACKING.COUNTER, sortOrder: 1,
                isArchived: false, createdAt: new Date().toISOString(),
                counterGoal: 4, options: [], tags: [],
                durationPresets: [],
            },
            {
                id: uuid(), name: 'Strength Training', subtitle: '', emoji: '\u{1F4AA}',
                trackingType: TRACKING.SINGLE_SELECT, sortOrder: 2,
                isArchived: false, createdAt: new Date().toISOString(),
                counterGoal: null, options: ['Strength', 'Core', 'Plyo'],
                tags: [], durationPresets: [],
            },
            {
                id: uuid(), name: 'Rolling', subtitle: '', emoji: '\u{1F535}',
                trackingType: TRACKING.MULTI_SELECT, sortOrder: 3,
                isArchived: false, createdAt: new Date().toISOString(),
                counterGoal: null, options: [],
                tags: ['Adductors', 'Hip Flexors', 'Lats', 'Serratus', 'Chest', 'Quads', 'Hamstrings', 'Calves', 'Glutes', 'Upper Back'],
                durationPresets: [],
            },
            {
                id: uuid(), name: 'Protein Drink', subtitle: '', emoji: '\u{1F964}',
                trackingType: TRACKING.YES_NO, sortOrder: 4,
                isArchived: false, createdAt: new Date().toISOString(),
                counterGoal: null, options: [], tags: [], durationPresets: [],
            },
            {
                id: uuid(), name: 'Creatine', subtitle: '', emoji: '\u{1F48A}',
                trackingType: TRACKING.YES_NO, sortOrder: 5,
                isArchived: false, createdAt: new Date().toISOString(),
                counterGoal: null, options: [], tags: [], durationPresets: [],
            },
            {
                id: uuid(), name: 'Overnight Oats', subtitle: '', emoji: '\u{1F963}',
                trackingType: TRACKING.YES_NO, sortOrder: 6,
                isArchived: false, createdAt: new Date().toISOString(),
                counterGoal: null, options: [], tags: [], durationPresets: [],
            },
            {
                id: uuid(), name: 'Diaphragmatic Breathing', subtitle: '', emoji: '\u{1F32C}\u{FE0F}',
                trackingType: TRACKING.DURATION, sortOrder: 7,
                isArchived: false, createdAt: new Date().toISOString(),
                counterGoal: null, options: [], tags: [],
                durationPresets: [5, 10, 15, 20, 30],
            },
            {
                id: uuid(), name: 'Tennis', subtitle: '', emoji: '\u{1F3BE}',
                trackingType: TRACKING.DURATION, sortOrder: 8,
                isArchived: false, createdAt: new Date().toISOString(),
                counterGoal: null, options: [], tags: [],
                durationPresets: [30, 45, 60, 90, 120],
            },
        ];
        this.save();
    }
}
