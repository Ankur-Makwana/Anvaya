// ===== App Controller =====
const store = new DataStore();

const app = {
    // State for current modal
    currentActivity: null,
    editingActivity: null,
    modalState: {},

    // ===== Render =====
    render() {
        document.getElementById('todayDate').textContent = friendlyDate();
        this.renderActivities();
    },

    renderActivities() {
        const list = document.getElementById('activityList');
        const activities = store.activeActivities();
        list.innerHTML = activities.map(a => {
            const logs = store.logsForActivity(a.id);
            const isLogged = logs.length > 0;
            const status = this.getStatusText(a, logs);
            return `
                <div class="activity-card ${isLogged ? 'logged' : ''}" onclick="app.openLog('${a.id}')">
                    <div class="activity-emoji">${a.emoji}</div>
                    <div class="activity-info">
                        <div class="activity-name">${a.name}</div>
                        ${a.subtitle ? `<div class="activity-subtitle">${a.subtitle}</div>` : ''}
                    </div>
                    <div class="activity-status">${status}</div>
                </div>
            `;
        }).join('');
    },

    getStatusText(activity, logs) {
        const log = logs.length > 0 ? logs[logs.length - 1] : null;
        switch (activity.trackingType) {
            case TRACKING.YES_NO:
                return log ? '\u2713' : '';
            case TRACKING.COUNTER:
                return `${log ? log.counterValue : 0}/${activity.counterGoal || 0}`;
            case TRACKING.DURATION:
                return log ? `${log.durationMinutes}m` : '\u2014';
            case TRACKING.MULTI_SELECT:
                return log && log.selectedTags && log.selectedTags.length > 0
                    ? `${log.selectedTags.length} logged` : '\u2014';
            case TRACKING.SINGLE_SELECT:
                return log ? log.selectedOption : '\u2014';
            case TRACKING.SELECT_WITH_DURATION:
                return log && log.selectedOption
                    ? `${log.selectedOption} \u00B7 ${log.durationMinutes}m` : '\u2014';
            default:
                return '';
        }
    },

    // ===== Log Entry =====
    openLog(activityId) {
        const activity = store.activities.find(a => a.id === activityId);
        if (!activity) return;
        this.currentActivity = activity;
        const logs = store.logsForActivity(activityId);
        const existingLog = logs.length > 0 ? logs[logs.length - 1] : null;
        this.modalState = { existingLog, step: 1 };

        document.getElementById('modalTitle').textContent = activity.name;

        switch (activity.trackingType) {
            case TRACKING.YES_NO: this.renderYesNo(activity, existingLog); break;
            case TRACKING.COUNTER: this.renderCounter(activity, existingLog); break;
            case TRACKING.DURATION: this.renderDuration(activity, existingLog); break;
            case TRACKING.MULTI_SELECT: this.renderMultiSelect(activity, existingLog); break;
            case TRACKING.SINGLE_SELECT: this.renderSingleSelect(activity, existingLog); break;
            case TRACKING.SELECT_WITH_DURATION: this.renderSelectWithDuration(activity, existingLog); break;
        }

        document.getElementById('modalOverlay').classList.add('open');
    },

    closeModal() {
        document.getElementById('modalOverlay').classList.remove('open');
        this.currentActivity = null;
        this.render();
    },

    // --- Yes/No ---
    renderYesNo(activity, log) {
        const body = document.getElementById('modalBody');
        if (log && log.boolValue) {
            body.innerHTML = `
                <div class="log-emoji">${activity.emoji}</div>
                <div class="yesno-status">\u2713 Logged today!</div>
                <button class="save-btn danger" onclick="app.removeLog('${log.id}')">Remove Log</button>
            `;
        } else {
            body.innerHTML = `
                <div class="log-emoji">${activity.emoji}</div>
                <button class="save-btn" onclick="app.saveYesNo()">Done!</button>
            `;
        }
    },

    saveYesNo() {
        store.addLog({
            id: uuid(), activityId: this.currentActivity.id,
            date: todayString(), timestamp: new Date().toISOString(),
            boolValue: true,
        });
        this.closeModal();
    },

    removeLog(logId) {
        store.deleteLog(logId);
        this.closeModal();
    },

    // --- Counter ---
    renderCounter(activity, log) {
        this.modalState.count = log ? log.counterValue : 0;
        this.updateCounterUI(activity);
    },

    updateCounterUI(activity) {
        const count = this.modalState.count;
        const goal = activity.counterGoal || 0;
        const met = goal > 0 && count >= goal;
        document.getElementById('modalBody').innerHTML = `
            <div class="log-emoji">${activity.emoji}</div>
            <div class="counter-display">
                <div class="counter-number ${met ? 'goal-met' : ''}">${count}</div>
                ${goal > 0 ? `<div class="counter-goal">Goal: ${goal}</div>` : ''}
            </div>
            <div class="counter-buttons">
                <button class="counter-btn minus" onclick="app.counterDec()">-</button>
                <button class="counter-btn plus" onclick="app.counterInc()">+</button>
            </div>
            <button class="save-btn" onclick="app.saveCounter()">Save</button>
        `;
    },

    counterInc() { this.modalState.count++; this.updateCounterUI(this.currentActivity); },
    counterDec() { if (this.modalState.count > 0) { this.modalState.count--; this.updateCounterUI(this.currentActivity); } },

    saveCounter() {
        const log = this.modalState.existingLog;
        if (log) {
            log.counterValue = this.modalState.count;
            log.timestamp = new Date().toISOString();
            store.updateLog(log);
        } else {
            store.addLog({
                id: uuid(), activityId: this.currentActivity.id,
                date: todayString(), timestamp: new Date().toISOString(),
                counterValue: this.modalState.count,
            });
        }
        this.closeModal();
    },

    // --- Duration ---
    renderDuration(activity, log) {
        this.modalState.selectedMinutes = log ? log.durationMinutes : null;
        this.updateDurationUI(activity);
    },

    updateDurationUI(activity) {
        const sel = this.modalState.selectedMinutes;
        document.getElementById('modalBody').innerHTML = `
            <div class="log-emoji">${activity.emoji}</div>
            ${sel ? `<div class="selected-value">${sel} min</div>` : '<div class="log-section-title">How long?</div>'}
            <div class="duration-grid">
                ${activity.durationPresets.map(m => `
                    <button class="duration-btn ${sel === m ? 'selected' : ''}" onclick="app.selectDuration(${m})">${m}m</button>
                `).join('')}
            </div>
            <button class="save-btn" ${sel === null ? 'disabled' : ''} onclick="app.saveDuration()">Save</button>
        `;
    },

    selectDuration(m) {
        this.modalState.selectedMinutes = m;
        this.updateDurationUI(this.currentActivity);
    },

    saveDuration() {
        const log = this.modalState.existingLog;
        if (log) {
            log.durationMinutes = this.modalState.selectedMinutes;
            log.timestamp = new Date().toISOString();
            store.updateLog(log);
        } else {
            store.addLog({
                id: uuid(), activityId: this.currentActivity.id,
                date: todayString(), timestamp: new Date().toISOString(),
                durationMinutes: this.modalState.selectedMinutes,
            });
        }
        this.closeModal();
    },

    // --- Single Select ---
    renderSingleSelect(activity, log) {
        this.modalState.selectedOption = log ? log.selectedOption : null;
        this.updateSingleSelectUI(activity);
    },

    updateSingleSelectUI(activity) {
        const sel = this.modalState.selectedOption;
        document.getElementById('modalBody').innerHTML = `
            <div class="log-emoji">${activity.emoji}</div>
            <div class="option-grid">
                ${activity.options.map(opt => `
                    <button class="option-btn ${sel === opt ? 'selected' : ''}" onclick="app.selectOption('${opt}')">${opt}</button>
                `).join('')}
            </div>
            <button class="save-btn" ${sel === null ? 'disabled' : ''} onclick="app.saveSingleSelect()">Save</button>
        `;
    },

    selectOption(opt) {
        this.modalState.selectedOption = opt;
        this.updateSingleSelectUI(this.currentActivity);
    },

    saveSingleSelect() {
        const log = this.modalState.existingLog;
        if (log) {
            log.selectedOption = this.modalState.selectedOption;
            log.timestamp = new Date().toISOString();
            store.updateLog(log);
        } else {
            store.addLog({
                id: uuid(), activityId: this.currentActivity.id,
                date: todayString(), timestamp: new Date().toISOString(),
                selectedOption: this.modalState.selectedOption,
            });
        }
        this.closeModal();
    },

    // --- Multi Select ---
    renderMultiSelect(activity, log) {
        this.modalState.selectedTags = new Set(log ? log.selectedTags || [] : []);
        this.updateMultiSelectUI(activity);
    },

    updateMultiSelectUI(activity) {
        const sel = this.modalState.selectedTags;
        const count = sel.size;
        document.getElementById('modalBody').innerHTML = `
            <div class="log-emoji">${activity.emoji}</div>
            <div class="tag-grid">
                ${activity.tags.map(tag => `
                    <button class="tag-btn ${sel.has(tag) ? 'selected' : ''}" onclick="app.toggleTag('${tag}')">${tag}</button>
                `).join('')}
                <button class="tag-btn add-tag" onclick="app.showAddTag()">+ Add</button>
            </div>
            ${count > 0 ? `<div class="log-section-title">${count} selected</div>` : ''}
            <button class="save-btn" ${count === 0 ? 'disabled' : ''} onclick="app.saveMultiSelect()">Save</button>
        `;
    },

    toggleTag(tag) {
        if (this.modalState.selectedTags.has(tag)) {
            this.modalState.selectedTags.delete(tag);
        } else {
            this.modalState.selectedTags.add(tag);
        }
        this.updateMultiSelectUI(this.currentActivity);
    },

    showAddTag() {
        const name = prompt('Add muscle group:');
        if (name && name.trim()) {
            const trimmed = name.trim();
            const a = this.currentActivity;
            if (!a.tags.includes(trimmed)) {
                a.tags.push(trimmed);
                store.updateActivity(a);
            }
            this.modalState.selectedTags.add(trimmed);
            this.updateMultiSelectUI(a);
        }
    },

    saveMultiSelect() {
        const tags = Array.from(this.modalState.selectedTags).sort();
        const log = this.modalState.existingLog;
        if (log) {
            log.selectedTags = tags;
            log.timestamp = new Date().toISOString();
            store.updateLog(log);
        } else {
            store.addLog({
                id: uuid(), activityId: this.currentActivity.id,
                date: todayString(), timestamp: new Date().toISOString(),
                selectedTags: tags,
            });
        }
        this.closeModal();
    },

    // --- Select with Duration (Climbing) ---
    renderSelectWithDuration(activity, log) {
        this.modalState.selectedOption = log ? log.selectedOption : null;
        this.modalState.selectedMinutes = log ? log.durationMinutes : null;
        this.modalState.step = (log && log.selectedOption) ? 2 : 1;
        this.updateSelectWithDurationUI(activity);
    },

    updateSelectWithDurationUI(activity) {
        const { step, selectedOption, selectedMinutes } = this.modalState;
        let html = `<div class="log-emoji">${activity.emoji}</div>`;

        if (step === 1) {
            html += `
                <div class="log-section-title">What type?</div>
                <div class="option-grid">
                    ${activity.options.map(opt => `
                        <button class="option-btn ${selectedOption === opt ? 'selected' : ''}" onclick="app.selectTypeAndNext('${opt}')">${opt}</button>
                    `).join('')}
                </div>
            `;
        } else {
            html += `
                <div style="text-align:center">
                    <span class="step-badge">
                        ${selectedOption}
                        <button class="change-btn" onclick="app.backToStep1()">change</button>
                    </span>
                </div>
                <div class="log-section-title">How long?</div>
                ${selectedMinutes ? `<div class="selected-value">${selectedMinutes} min</div>` : ''}
                <div class="duration-grid">
                    ${activity.durationPresets.map(m => `
                        <button class="duration-btn ${selectedMinutes === m ? 'selected' : ''}" onclick="app.selectDurationStep2(${m})">${m}m</button>
                    `).join('')}
                </div>
                <button class="save-btn" ${selectedMinutes === null ? 'disabled' : ''} onclick="app.saveSelectWithDuration()">Save</button>
            `;
        }

        document.getElementById('modalBody').innerHTML = html;
    },

    selectTypeAndNext(opt) {
        this.modalState.selectedOption = opt;
        this.modalState.step = 2;
        this.updateSelectWithDurationUI(this.currentActivity);
    },

    backToStep1() {
        this.modalState.step = 1;
        this.updateSelectWithDurationUI(this.currentActivity);
    },

    selectDurationStep2(m) {
        this.modalState.selectedMinutes = m;
        this.updateSelectWithDurationUI(this.currentActivity);
    },

    saveSelectWithDuration() {
        const log = this.modalState.existingLog;
        if (log) {
            log.selectedOption = this.modalState.selectedOption;
            log.durationMinutes = this.modalState.selectedMinutes;
            log.timestamp = new Date().toISOString();
            store.updateLog(log);
        } else {
            store.addLog({
                id: uuid(), activityId: this.currentActivity.id,
                date: todayString(), timestamp: new Date().toISOString(),
                selectedOption: this.modalState.selectedOption,
                durationMinutes: this.modalState.selectedMinutes,
            });
        }
        this.closeModal();
    },

    // ===== Settings =====
    showSettings() {
        this.renderSettings();
        document.getElementById('settingsOverlay').classList.add('open');
    },

    closeSettings() {
        document.getElementById('settingsOverlay').classList.remove('open');
        this.render();
    },

    renderSettings() {
        const active = store.activeActivities();
        const archived = store.archivedActivities();
        let html = `<div class="settings-section-title">Active Activities</div>`;
        html += `<div class="settings-list">`;
        html += active.map(a => `
            <div class="settings-item" onclick="app.editActivity('${a.id}')">
                <span class="settings-item-emoji">${a.emoji}</span>
                <span class="settings-item-name">${a.name}</span>
                <span class="settings-item-type">${TRACKING_LABELS[a.trackingType]}</span>
            </div>
        `).join('');
        html += `</div>`;

        if (archived.length > 0) {
            html += `<div class="settings-section-title">Archived</div>`;
            html += `<div class="settings-list">`;
            html += archived.map(a => `
                <div class="settings-item">
                    <span class="settings-item-emoji">${a.emoji}</span>
                    <span class="settings-item-name" style="color:var(--text-secondary)">${a.name}</span>
                    <button class="modal-action" onclick="event.stopPropagation(); app.restoreActivity('${a.id}')">Restore</button>
                </div>
            `).join('');
            html += `</div>`;
        }

        document.getElementById('settingsBody').innerHTML = html;
    },

    restoreActivity(id) {
        store.restoreActivity(id);
        this.renderSettings();
    },

    // ===== Add/Edit Activity =====
    showAddActivity() {
        this.editingActivity = null;
        document.getElementById('editActivityTitle').textContent = 'New Activity';
        this.renderEditForm({
            name: '', subtitle: '', emoji: '', trackingType: TRACKING.YES_NO,
            counterGoal: '', options: [], tags: [],
            durationPresets: [5, 10, 15, 20, 30, 45, 60, 90, 120],
        });
        document.getElementById('editActivityOverlay').classList.add('open');
    },

    editActivity(id) {
        const a = store.activities.find(x => x.id === id);
        if (!a) return;
        this.editingActivity = a;
        document.getElementById('editActivityTitle').textContent = 'Edit Activity';
        this.renderEditForm({
            name: a.name, subtitle: a.subtitle, emoji: a.emoji,
            trackingType: a.trackingType,
            counterGoal: a.counterGoal || '',
            options: [...a.options], tags: [...a.tags],
            durationPresets: [...a.durationPresets],
        });
        document.getElementById('editActivityOverlay').classList.add('open');
    },

    closeEditActivity() {
        document.getElementById('editActivityOverlay').classList.remove('open');
        this.editingActivity = null;
    },

    renderEditForm(data) {
        this.modalState.editData = data;
        const isNew = !this.editingActivity;
        let html = `
            <div class="form-group">
                <label class="form-label">Name</label>
                <input class="form-input" id="editName" value="${data.name}" placeholder="e.g., Morning Run">
            </div>
            <div class="form-group">
                <label class="form-label">Subtitle (optional)</label>
                <input class="form-input" id="editSubtitle" value="${data.subtitle}" placeholder="e.g., Goal: 3x per week">
            </div>
            <div class="form-group">
                <label class="form-label">Emoji</label>
                <input class="form-input" id="editEmoji" value="${data.emoji}" placeholder="Pick an emoji" style="width:80px">
            </div>
            <div class="form-group">
                <label class="form-label">Tracking Type</label>
                ${isNew ? `
                    <select class="form-select" id="editType" onchange="app.onTypeChange()">
                        ${Object.entries(TRACKING_LABELS).map(([k,v]) => `
                            <option value="${k}" ${data.trackingType === k ? 'selected' : ''}>${v}</option>
                        `).join('')}
                    </select>
                ` : `
                    <input class="form-input" value="${TRACKING_LABELS[data.trackingType]}" disabled>
                `}
            </div>
        `;

        // Type-specific config
        const type = data.trackingType;
        if (type === TRACKING.COUNTER) {
            html += `
                <div class="form-group">
                    <label class="form-label">Goal</label>
                    <input class="form-input" id="editGoal" type="number" value="${data.counterGoal}" placeholder="e.g., 4">
                </div>
            `;
        }
        if (type === TRACKING.SINGLE_SELECT || type === TRACKING.SELECT_WITH_DURATION) {
            html += `
                <div class="form-group">
                    <label class="form-label">Options</label>
                    <div class="form-chips" id="optionChips">
                        ${data.options.map((o, i) => `
                            <span class="form-chip">${o} <button class="form-chip-remove" onclick="app.removeOption(${i})">\u00D7</button></span>
                        `).join('')}
                    </div>
                    <div class="form-add-row">
                        <input class="form-input" id="newOption" placeholder="New option">
                        <button class="form-add-btn" onclick="app.addOption()">Add</button>
                    </div>
                </div>
            `;
        }
        if (type === TRACKING.MULTI_SELECT) {
            html += `
                <div class="form-group">
                    <label class="form-label">Tags</label>
                    <div class="form-chips" id="tagChips">
                        ${data.tags.map((t, i) => `
                            <span class="form-chip">${t} <button class="form-chip-remove" onclick="app.removeTag(${i})">\u00D7</button></span>
                        `).join('')}
                    </div>
                    <div class="form-add-row">
                        <input class="form-input" id="newTag" placeholder="New tag">
                        <button class="form-add-btn" onclick="app.addTag()">Add</button>
                    </div>
                </div>
            `;
        }

        if (!isNew) {
            html += `<button class="save-btn danger" onclick="app.archiveCurrentActivity()" style="margin-top:24px">Archive Activity</button>`;
        }

        document.getElementById('editActivityBody').innerHTML = html;
    },

    onTypeChange() {
        const type = document.getElementById('editType').value;
        this.modalState.editData.trackingType = type;
        this.renderEditForm(this.modalState.editData);
    },

    addOption() {
        const input = document.getElementById('newOption');
        const val = input.value.trim();
        if (val) {
            this.modalState.editData.options.push(val);
            this.renderEditForm(this.modalState.editData);
        }
    },

    removeOption(i) {
        this.modalState.editData.options.splice(i, 1);
        this.renderEditForm(this.modalState.editData);
    },

    addTag() {
        const input = document.getElementById('newTag');
        const val = input.value.trim();
        if (val) {
            this.modalState.editData.tags.push(val);
            this.renderEditForm(this.modalState.editData);
        }
    },

    removeTag(i) {
        this.modalState.editData.tags.splice(i, 1);
        this.renderEditForm(this.modalState.editData);
    },

    saveActivity() {
        const name = document.getElementById('editName').value.trim();
        if (!name) return;

        const data = this.modalState.editData;
        const subtitle = document.getElementById('editSubtitle').value.trim();
        const emoji = document.getElementById('editEmoji').value.trim() || '\u{1F4CC}';
        const goalEl = document.getElementById('editGoal');
        const goal = goalEl ? parseInt(goalEl.value) || null : null;

        if (this.editingActivity) {
            const a = this.editingActivity;
            a.name = name;
            a.subtitle = subtitle;
            a.emoji = emoji;
            a.counterGoal = goal;
            a.options = data.options;
            a.tags = data.tags;
            a.durationPresets = data.durationPresets;
            store.updateActivity(a);
        } else {
            const typeEl = document.getElementById('editType');
            store.addActivity({
                id: uuid(), name, subtitle, emoji,
                trackingType: typeEl.value,
                sortOrder: 999,
                isArchived: false, createdAt: new Date().toISOString(),
                counterGoal: goal,
                options: data.options, tags: data.tags,
                durationPresets: data.durationPresets,
            });
        }

        this.closeEditActivity();
        this.renderSettings();
    },

    archiveCurrentActivity() {
        if (this.editingActivity) {
            store.archiveActivity(this.editingActivity.id);
            this.closeEditActivity();
            this.renderSettings();
        }
    },
};

// Init
app.render();
