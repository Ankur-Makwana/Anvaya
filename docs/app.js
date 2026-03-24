// ===== Anvaya App Controller v2 =====
const store = new DataStore();

const app = {
    currentTab: 'today',
    currentActivity: null,
    editingActivity: null,
    modalState: {},

    // ===== Init =====
    init() {
        // Show splash, then check if onboarding needed
        setTimeout(() => {
            if (!store.hasUser()) {
                this.dismissSplash(() => this.showOnboarding());
            } else {
                this.dismissSplash(() => this.showApp());
            }
        }, 1800);
    },

    dismissSplash(callback) {
        const splash = document.getElementById('splashScreen');
        splash.classList.add('dismissing');
        setTimeout(() => {
            splash.classList.add('hidden');
            if (callback) callback();
        }, 600);
    },

    // ===== Onboarding =====
    showOnboarding() {
        const el = document.getElementById('onboarding');
        el.classList.remove('hidden');
        this.onboardingStep = 1;
        this.onboardingCadences = null;
        this.renderOnboarding();
    },

    renderOnboarding() {
        const content = document.getElementById('onboardingContent');
        if (this.onboardingStep === 1) {
            content.innerHTML = `
                <div class="onboarding-card">
                    <div class="onboarding-step">
                        <div class="onboarding-step-label">Step 1 of 2</div>
                    </div>
                    <h2>What should we call you?</h2>
                    <p>We'll personalize your experience</p>
                    <input class="onboarding-input" id="onboardingName" placeholder="Your name" autofocus>
                    <button class="onboarding-btn" onclick="app.onboardingNext()">Next</button>
                </div>
            `;
            setTimeout(() => {
                const input = document.getElementById('onboardingName');
                if (input) input.focus();
            }, 100);
        } else if (this.onboardingStep === 2) {
            // Only initialize cadences ONCE when entering step 2
            if (!this.onboardingCadences) {
                this.onboardingCadences = {};
                store.activeActivities().forEach(a => {
                    this.onboardingCadences[a.id] = a.cadence ? [...a.cadence] : ALL_DAYS.slice();
                });
            }
            this.renderOnboardingStep2();
        }
    },

    renderOnboardingStep2() {
        const content = document.getElementById('onboardingContent');
        const profile = store.getUserProfile();
        const name = profile ? profile.name.split(' ')[0] : '';
        const activities = store.activeActivities();
        const colors = ['#E8F6F1', '#FBF0E8', '#F0EBF5', '#FDE8D0', '#E8F0FB', '#F5E8E8', '#E8F5E9', '#FFF3E0', '#F3E5F5'];

        content.innerHTML = `
            <div class="onboarding-schedule">
                <div class="onboarding-schedule-header">
                    <div class="onboarding-step-label">Step 2 of 2</div>
                    <h2>Nice to meet you, ${name}!</h2>
                    <p>Let's set up when you do each activity. Tap the days or pick a preset. You can always change this later.</p>
                </div>
                <div class="onboarding-schedule-list">
                    ${activities.map((a, idx) => {
                        const bgColor = colors[idx % colors.length];
                        const cadence = this.onboardingCadences[a.id] || [];
                        const isAll = this.isCadencePreset(a.id, ALL_DAYS);
                        const isWeekdays = this.isCadencePreset(a.id, WEEKDAYS);
                        const isMWF = this.isCadencePreset(a.id, MWF);
                        return `
                            <div class="onboarding-activity" style="background:${bgColor}">
                                <div class="onboarding-activity-header">
                                    <div class="onboarding-activity-icon">${getIcon(a.icon || 'default')}</div>
                                    <div class="onboarding-activity-name">${a.name}</div>
                                </div>
                                <div class="cadence-presets">
                                    <button type="button" class="cadence-preset-btn ${isAll ? 'selected' : ''}" onclick="app.setCadencePreset('${a.id}', 'all')">Every day</button>
                                    <button type="button" class="cadence-preset-btn ${isWeekdays ? 'selected' : ''}" onclick="app.setCadencePreset('${a.id}', 'weekdays')">Weekdays</button>
                                    <button type="button" class="cadence-preset-btn ${isMWF ? 'selected' : ''}" onclick="app.setCadencePreset('${a.id}', 'mwf')">M/W/F</button>
                                </div>
                                <div class="day-bubbles">
                                    ${DAYS_SHORT.map((d, i) => `
                                        <div class="day-bubble ${cadence.includes(i) ? 'active' : ''}" onclick="app.toggleOnboardingDay('${a.id}', ${i})">${d}</div>
                                    `).join('')}
                                </div>
                            </div>
                        `;
                    }).join('')}
                </div>
                <div class="onboarding-schedule-footer">
                    <button class="onboarding-btn" onclick="app.finishOnboarding()">Let's go!</button>
                    <button class="onboarding-skip" onclick="app.finishOnboarding()">Skip for now</button>
                </div>
            </div>
        `;
    },

    isCadencePreset(activityId, preset) {
        const c = this.onboardingCadences ? this.onboardingCadences[activityId] : null;
        if (!c) return false;
        return preset.length === c.length && preset.every(d => c.includes(d));
    },

    setCadencePreset(activityId, preset) {
        if (preset === 'all') this.onboardingCadences[activityId] = ALL_DAYS.slice();
        else if (preset === 'weekdays') this.onboardingCadences[activityId] = WEEKDAYS.slice();
        else if (preset === 'mwf') this.onboardingCadences[activityId] = MWF.slice();
        this.renderOnboardingStep2();
    },

    toggleOnboardingDay(activityId, day) {
        const c = this.onboardingCadences[activityId];
        if (!c) return;
        const idx = c.indexOf(day);
        if (idx >= 0) c.splice(idx, 1); else c.push(day);
        this.renderOnboardingStep2();
    },

    onboardingNext() {
        const nameInput = document.getElementById('onboardingName');
        const name = nameInput ? nameInput.value.trim() : '';
        if (!name) { nameInput.focus(); return; }
        store.setUserProfile({ name, createdAt: new Date().toISOString() });
        this.onboardingStep = 2;
        this.renderOnboarding();
    },

    finishOnboarding() {
        // Save cadences
        if (this.onboardingCadences) {
            store.activeActivities().forEach(a => {
                if (this.onboardingCadences[a.id]) {
                    a.cadence = this.onboardingCadences[a.id];
                    store.updateActivity(a);
                }
            });
        }
        document.getElementById('onboarding').classList.add('hidden');
        this.showApp();
    },

    // ===== App Shell =====
    showApp() {
        document.getElementById('app').classList.remove('hidden');
        const profile = store.getUserProfile();
        if (profile) {
            document.getElementById('profileTabLabel').textContent = profile.name.split(' ')[0];
        }
        this.render();
    },

    // ===== Tab Navigation =====
    switchTab(tab) {
        this.currentTab = tab;
        document.querySelectorAll('.tab').forEach(t => {
            t.classList.toggle('active', t.dataset.tab === tab);
        });
        this.render();
    },

    // ===== Render =====
    render() {
        const main = document.getElementById('mainContent');
        switch (this.currentTab) {
            case 'today': main.innerHTML = this.renderToday(); break;
            case 'activities': main.innerHTML = this.renderActivitiesTab(); break;
            case 'profile': main.innerHTML = this.renderProfile(); break;
        }
    },

    // ===== Today View =====
    renderToday() {
        const profile = store.getUserProfile();
        const name = profile ? profile.name.split(' ')[0] : '';
        const tod = getTimeOfDay();
        const greetings = { morning: 'Good morning', afternoon: 'Good afternoon', evening: 'Good evening', night: 'Wind down' };
        const greeting = `${greetings[tod]}, ${name}`;
        const progress = store.todayProgress();
        const pct = progress.total > 0 ? Math.round((progress.done / progress.total) * 100) : 0;

        let sceneHtml = '';
        if (tod === 'morning' || tod === 'afternoon') {
            sceneHtml = `<div class="scene-sun"></div><div class="scene-cloud scene-cloud-1"></div><div class="scene-cloud scene-cloud-2"></div>`;
        } else if (tod === 'evening') {
            sceneHtml = `<div class="scene-sun"></div><div class="scene-cloud scene-cloud-1"></div>`;
        } else {
            sceneHtml = `<div class="scene-moon"></div>
                <div class="scene-star" style="top:12px;left:20%"></div>
                <div class="scene-star" style="top:24px;left:45%"></div>
                <div class="scene-star" style="top:8px;left:65%"></div>
                <div class="scene-star" style="top:30px;left:80%"></div>`;
        }

        const activities = store.todayScheduledActivities();
        const unscheduled = store.unscheduledActivities();

        let tilesHtml = activities.map(a => {
            const logs = store.logsForActivity(a.id);
            const prog = store.calculateProgress(a, logs);
            const status = this.getStatusText(a, logs);
            return `
                <div class="tile ${prog.isComplete ? 'complete' : ''}" onclick="app.openLog('${a.id}')">
                    <div class="tile-fill" style="height:${prog.percentage}%"></div>
                    <div class="tile-icon">${getIcon(a.icon || 'default')}</div>
                    <div class="tile-name">${a.name}</div>
                    <div class="tile-status">${status}</div>
                </div>
            `;
        }).join('');

        if (unscheduled.length > 0) {
            tilesHtml += `
                <div class="tile more-tile" onclick="app.showMore()">
                    <div class="more-tile-icon">+</div>
                    <div class="more-tile-label">More</div>
                </div>
            `;
        }

        return `
            <div class="today-header ${tod}">
                <div class="scene-elements">
                    ${sceneHtml}
                    <div class="scene-hill scene-hill-1"></div>
                    <div class="scene-hill scene-hill-2"></div>
                </div>
                <div class="header-top">
                    <img src="icons/icon-192.svg" class="header-logo" alt="">
                    <span class="greeting-date">${friendlyDate()}</span>
                </div>
                <div class="greeting-text">${greeting}</div>
                <div class="daily-progress">
                    <div class="progress-text">${progress.done} of ${progress.total} done today</div>
                    <div class="progress-bar-bg">
                        <div class="progress-bar-fill" style="width:${pct}%"></div>
                    </div>
                </div>
            </div>
            <div class="tile-grid">${tilesHtml}</div>
        `;
    },

    getStatusText(activity, logs) {
        const log = logs.length > 0 ? logs[logs.length - 1] : null;
        switch (activity.trackingType) {
            case TRACKING.YES_NO:
                return log ? '\u2713 Done' : 'Tap to log';
            case TRACKING.COUNTER: {
                const goal = (activity.goal && activity.goal.target) || activity.counterGoal || 0;
                return `${log ? log.counterValue : 0}/${goal}`;
            }
            case TRACKING.DURATION:
                return log ? `${log.durationMinutes}m` : 'Tap to log';
            case TRACKING.MULTI_SELECT:
                return log && log.selectedTags && log.selectedTags.length > 0
                    ? `${log.selectedTags.length} logged` : 'Tap to log';
            case TRACKING.SINGLE_SELECT:
                return log ? log.selectedOption : 'Tap to log';
            case TRACKING.SELECT_WITH_DURATION:
                return log && log.selectedOption
                    ? `${log.selectedOption} \u00B7 ${log.durationMinutes}m` : 'Tap to log';
            default: return '';
        }
    },

    // ===== More Activities Modal =====
    showMore() {
        const unscheduled = store.unscheduledActivities();
        const body = document.getElementById('moreBody');
        body.innerHTML = unscheduled.map(a => `
            <div class="more-activity-row">
                <div class="more-activity-icon">${getIcon(a.icon || 'default')}</div>
                <div class="more-activity-name">${a.name}</div>
                <button class="more-add-btn" onclick="app.addExtra('${a.id}')">+ Add</button>
            </div>
        `).join('') || '<p style="color:var(--text-secondary);text-align:center">All activities are scheduled for today!</p>';
        document.getElementById('moreOverlay').classList.add('open');
    },

    closeMore() {
        document.getElementById('moreOverlay').classList.remove('open');
        this.render();
    },

    addExtra(activityId) {
        store.addExtraForToday(activityId);
        this.closeMore();
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

    renderYesNo(activity, log) {
        const iconHtml = `<div class="log-icon">${getIcon(activity.icon || 'default')}</div>`;
        const body = document.getElementById('modalBody');
        if (log && log.boolValue) {
            body.innerHTML = `${iconHtml}<div class="yesno-status">\u2713 Logged today!</div><button class="save-btn danger" onclick="app.removeLog('${log.id}')">Remove Log</button>`;
        } else {
            body.innerHTML = `${iconHtml}<button class="save-btn" onclick="app.saveYesNo()">Done!</button>`;
        }
    },

    saveYesNo() {
        store.addLog({ id: uuid(), activityId: this.currentActivity.id, date: todayString(), timestamp: new Date().toISOString(), boolValue: true });
        this.closeModal();
    },

    removeLog(logId) {
        store.deleteLog(logId);
        this.closeModal();
    },

    renderCounter(activity, log) {
        this.modalState.count = log ? log.counterValue : 0;
        this.updateCounterUI(activity);
    },

    updateCounterUI(activity) {
        const count = this.modalState.count;
        const goal = (activity.goal && activity.goal.target) || activity.counterGoal || 0;
        const met = goal > 0 && count >= goal;
        document.getElementById('modalBody').innerHTML = `
            <div class="log-icon">${getIcon(activity.icon || 'default')}</div>
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
        if (log) { log.counterValue = this.modalState.count; log.timestamp = new Date().toISOString(); store.updateLog(log); }
        else { store.addLog({ id: uuid(), activityId: this.currentActivity.id, date: todayString(), timestamp: new Date().toISOString(), counterValue: this.modalState.count }); }
        this.closeModal();
    },

    renderDuration(activity, log) {
        this.modalState.selectedMinutes = log ? log.durationMinutes : null;
        this.updateDurationUI(activity);
    },

    updateDurationUI(activity) {
        const sel = this.modalState.selectedMinutes;
        document.getElementById('modalBody').innerHTML = `
            <div class="log-icon">${getIcon(activity.icon || 'default')}</div>
            ${sel ? `<div class="selected-value">${sel} min</div>` : '<div class="log-section-title">How long?</div>'}
            <div class="duration-grid">
                ${activity.durationPresets.map(m => `<button class="duration-btn ${sel === m ? 'selected' : ''}" onclick="app.selectDuration(${m})">${m}m</button>`).join('')}
            </div>
            <button class="save-btn" ${sel === null ? 'disabled' : ''} onclick="app.saveDuration()">Save</button>
        `;
    },

    selectDuration(m) { this.modalState.selectedMinutes = m; this.updateDurationUI(this.currentActivity); },

    saveDuration() {
        const log = this.modalState.existingLog;
        if (log) { log.durationMinutes = this.modalState.selectedMinutes; log.timestamp = new Date().toISOString(); store.updateLog(log); }
        else { store.addLog({ id: uuid(), activityId: this.currentActivity.id, date: todayString(), timestamp: new Date().toISOString(), durationMinutes: this.modalState.selectedMinutes }); }
        this.closeModal();
    },

    renderSingleSelect(activity, log) {
        this.modalState.selectedOption = log ? log.selectedOption : null;
        this.updateSingleSelectUI(activity);
    },

    updateSingleSelectUI(activity) {
        const sel = this.modalState.selectedOption;
        document.getElementById('modalBody').innerHTML = `
            <div class="log-icon">${getIcon(activity.icon || 'default')}</div>
            <div class="option-grid">
                ${activity.options.map(opt => `<button class="option-btn ${sel === opt ? 'selected' : ''}" onclick="app.selectOption('${opt}')">${opt}</button>`).join('')}
            </div>
            <button class="save-btn" ${sel === null ? 'disabled' : ''} onclick="app.saveSingleSelect()">Save</button>
        `;
    },

    selectOption(opt) { this.modalState.selectedOption = opt; this.updateSingleSelectUI(this.currentActivity); },

    saveSingleSelect() {
        const log = this.modalState.existingLog;
        if (log) { log.selectedOption = this.modalState.selectedOption; log.timestamp = new Date().toISOString(); store.updateLog(log); }
        else { store.addLog({ id: uuid(), activityId: this.currentActivity.id, date: todayString(), timestamp: new Date().toISOString(), selectedOption: this.modalState.selectedOption }); }
        this.closeModal();
    },

    renderMultiSelect(activity, log) {
        this.modalState.selectedTags = new Set(log ? log.selectedTags || [] : []);
        this.updateMultiSelectUI(activity);
    },

    updateMultiSelectUI(activity) {
        const sel = this.modalState.selectedTags;
        const count = sel.size;
        document.getElementById('modalBody').innerHTML = `
            <div class="log-icon">${getIcon(activity.icon || 'default')}</div>
            <div class="tag-grid">
                ${activity.tags.map(tag => `<button class="tag-btn ${sel.has(tag) ? 'selected' : ''}" onclick="app.toggleTag('${tag}')">${tag}</button>`).join('')}
                <button class="tag-btn add-tag" onclick="app.showAddTag()">+ Add</button>
            </div>
            ${count > 0 ? `<div class="log-section-title">${count} selected</div>` : ''}
            <button class="save-btn" ${count === 0 ? 'disabled' : ''} onclick="app.saveMultiSelect()">Save</button>
        `;
    },

    toggleTag(tag) {
        if (this.modalState.selectedTags.has(tag)) this.modalState.selectedTags.delete(tag);
        else this.modalState.selectedTags.add(tag);
        this.updateMultiSelectUI(this.currentActivity);
    },

    showAddTag() {
        const name = prompt('Add muscle group:');
        if (name && name.trim()) {
            const trimmed = name.trim();
            const a = this.currentActivity;
            if (!a.tags.includes(trimmed)) { a.tags.push(trimmed); store.updateActivity(a); }
            this.modalState.selectedTags.add(trimmed);
            this.updateMultiSelectUI(a);
        }
    },

    saveMultiSelect() {
        const tags = Array.from(this.modalState.selectedTags).sort();
        const log = this.modalState.existingLog;
        if (log) { log.selectedTags = tags; log.timestamp = new Date().toISOString(); store.updateLog(log); }
        else { store.addLog({ id: uuid(), activityId: this.currentActivity.id, date: todayString(), timestamp: new Date().toISOString(), selectedTags: tags }); }
        this.closeModal();
    },

    renderSelectWithDuration(activity, log) {
        this.modalState.selectedOption = log ? log.selectedOption : null;
        this.modalState.selectedMinutes = log ? log.durationMinutes : null;
        this.modalState.step = (log && log.selectedOption) ? 2 : 1;
        this.updateSelectWithDurationUI(activity);
    },

    updateSelectWithDurationUI(activity) {
        const { step, selectedOption, selectedMinutes } = this.modalState;
        let html = `<div class="log-icon">${getIcon(activity.icon || 'default')}</div>`;
        if (step === 1) {
            html += `<div class="log-section-title">What type?</div><div class="option-grid">
                ${activity.options.map(opt => `<button class="option-btn ${selectedOption === opt ? 'selected' : ''}" onclick="app.selectTypeAndNext('${opt}')">${opt}</button>`).join('')}
            </div>`;
        } else {
            html += `<div style="text-align:center"><span class="step-badge">${selectedOption} <button class="change-btn" onclick="app.backToStep1()">change</button></span></div>
                <div class="log-section-title">How long?</div>
                ${selectedMinutes ? `<div class="selected-value">${selectedMinutes} min</div>` : ''}
                <div class="duration-grid">${activity.durationPresets.map(m => `<button class="duration-btn ${selectedMinutes === m ? 'selected' : ''}" onclick="app.selectDurationStep2(${m})">${m}m</button>`).join('')}</div>
                <button class="save-btn" ${selectedMinutes === null ? 'disabled' : ''} onclick="app.saveSelectWithDuration()">Save</button>`;
        }
        document.getElementById('modalBody').innerHTML = html;
    },

    selectTypeAndNext(opt) { this.modalState.selectedOption = opt; this.modalState.step = 2; this.updateSelectWithDurationUI(this.currentActivity); },
    backToStep1() { this.modalState.step = 1; this.updateSelectWithDurationUI(this.currentActivity); },
    selectDurationStep2(m) { this.modalState.selectedMinutes = m; this.updateSelectWithDurationUI(this.currentActivity); },

    saveSelectWithDuration() {
        const log = this.modalState.existingLog;
        if (log) { log.selectedOption = this.modalState.selectedOption; log.durationMinutes = this.modalState.selectedMinutes; log.timestamp = new Date().toISOString(); store.updateLog(log); }
        else { store.addLog({ id: uuid(), activityId: this.currentActivity.id, date: todayString(), timestamp: new Date().toISOString(), selectedOption: this.modalState.selectedOption, durationMinutes: this.modalState.selectedMinutes }); }
        this.closeModal();
    },

    // ===== Activities Tab =====
    renderActivitiesTab() {
        const active = store.activeActivities();
        const archived = store.archivedActivities();

        let html = `
            <div class="activities-header">
                <h1 class="activities-title">Activities</h1>
                <button class="add-activity-btn" onclick="app.showAddActivity()">+ New</button>
            </div>
            <div class="section-title">Active</div>
        `;

        html += active.map(a => {
            const cadenceDots = [0,1,2,3,4,5,6].map(d =>
                `<div class="activity-list-dot ${(a.cadence || []).includes(d) ? 'active' : ''}"></div>`
            ).join('');
            return `
                <div class="activity-list-item" onclick="app.editActivity('${a.id}')">
                    <div class="activity-list-icon">${getIcon(a.icon || 'default')}</div>
                    <div class="activity-list-info">
                        <div class="activity-list-name">${a.name}</div>
                        <div class="activity-list-meta">
                            <div class="activity-list-dots">${cadenceDots}</div>
                            <span>${TRACKING_LABELS[a.trackingType]}</span>
                        </div>
                    </div>
                </div>
            `;
        }).join('');

        if (archived.length > 0) {
            html += `<div class="section-title">Archived</div>`;
            html += archived.map(a => `
                <div class="activity-list-item">
                    <div class="activity-list-icon" style="opacity:0.4">${getIcon(a.icon || 'default')}</div>
                    <div class="activity-list-info">
                        <div class="activity-list-name" style="color:var(--text-secondary)">${a.name}</div>
                    </div>
                    <button class="more-add-btn" onclick="event.stopPropagation(); app.restoreActivity('${a.id}')">Restore</button>
                </div>
            `).join('');
        }

        return html;
    },

    restoreActivity(id) {
        store.restoreActivity(id);
        this.render();
    },

    // ===== Add/Edit Activity =====
    showAddActivity() {
        this.editingActivity = null;
        document.getElementById('editActivityTitle').textContent = 'New Activity';
        this.renderEditForm({
            name: '', subtitle: '', trackingType: TRACKING.YES_NO,
            counterGoal: '', options: [], tags: [],
            durationPresets: [5, 10, 15, 20, 30, 45, 60, 90, 120],
            cadence: ALL_DAYS.slice(),
            goalTarget: '',
        });
        document.getElementById('editActivityOverlay').classList.add('open');
    },

    editActivity(id) {
        const a = store.activities.find(x => x.id === id);
        if (!a) return;
        this.editingActivity = a;
        document.getElementById('editActivityTitle').textContent = 'Edit Activity';
        const goalTarget = a.goal ? (a.goal.target || a.goal.targetMinutes || a.goal.targetCount || '') : '';
        this.renderEditForm({
            name: a.name, subtitle: a.subtitle,
            trackingType: a.trackingType,
            counterGoal: a.counterGoal || '',
            options: [...a.options], tags: [...a.tags],
            durationPresets: [...a.durationPresets],
            cadence: a.cadence ? [...a.cadence] : ALL_DAYS.slice(),
            goalTarget: goalTarget,
        });
        document.getElementById('editActivityOverlay').classList.add('open');
    },

    closeEditActivity() {
        document.getElementById('editActivityOverlay').classList.remove('open');
        this.editingActivity = null;
        this.render();
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
                <input class="form-input" id="editSubtitle" value="${data.subtitle || ''}" placeholder="e.g., Goal: 3x per week">
            </div>
            <div class="form-group">
                <label class="form-label">Tracking Type</label>
                ${isNew ? `
                    <select class="form-select" id="editType" onchange="app.onTypeChange()">
                        ${Object.entries(TRACKING_LABELS).map(([k,v]) => `<option value="${k}" ${data.trackingType === k ? 'selected' : ''}>${v}</option>`).join('')}
                    </select>
                ` : `<input class="form-input" value="${TRACKING_LABELS[data.trackingType]}" disabled>`}
            </div>

            <div class="form-group">
                <label class="form-label">Schedule</label>
                <div class="cadence-presets">
                    <button class="cadence-preset-btn ${this.arraysEqual(data.cadence, ALL_DAYS) ? 'selected' : ''}" onclick="app.setEditCadence('all')">Every day</button>
                    <button class="cadence-preset-btn ${this.arraysEqual(data.cadence, WEEKDAYS) ? 'selected' : ''}" onclick="app.setEditCadence('weekdays')">Weekdays</button>
                    <button class="cadence-preset-btn ${this.arraysEqual(data.cadence, MWF) ? 'selected' : ''}" onclick="app.setEditCadence('mwf')">M/W/F</button>
                </div>
                <div class="day-bubbles">
                    ${DAYS_SHORT.map((d, i) => `<div class="day-bubble ${data.cadence.includes(i) ? 'active' : ''}" onclick="app.toggleEditDay(${i})">${d}</div>`).join('')}
                </div>
            </div>
        `;

        const type = data.trackingType;

        // Goal
        if (type === TRACKING.COUNTER) {
            html += `<div class="form-group"><label class="form-label">Daily Goal</label><input class="form-input" id="editGoal" type="number" value="${data.counterGoal || data.goalTarget}" placeholder="e.g., 4"></div>`;
        } else if (type === TRACKING.DURATION || type === TRACKING.SELECT_WITH_DURATION) {
            html += `<div class="form-group"><label class="form-label">Target Minutes</label><input class="form-input" id="editGoalMinutes" type="number" value="${data.goalTarget}" placeholder="e.g., 60"></div>`;
        } else if (type === TRACKING.MULTI_SELECT) {
            html += `<div class="form-group"><label class="form-label">Target Items</label><input class="form-input" id="editGoalCount" type="number" value="${data.goalTarget}" placeholder="e.g., 5"></div>`;
        }

        // Options
        if (type === TRACKING.SINGLE_SELECT || type === TRACKING.SELECT_WITH_DURATION) {
            html += `<div class="form-group"><label class="form-label">Options</label>
                <div class="form-chips">${data.options.map((o, i) => `<span class="form-chip">${o} <button class="form-chip-remove" onclick="app.removeOption(${i})">\u00D7</button></span>`).join('')}</div>
                <div class="form-add-row"><input class="form-input" id="newOption" placeholder="New option"><button class="form-add-btn" onclick="app.addOption()">Add</button></div>
            </div>`;
        }

        // Tags
        if (type === TRACKING.MULTI_SELECT) {
            html += `<div class="form-group"><label class="form-label">Tags</label>
                <div class="form-chips">${data.tags.map((t, i) => `<span class="form-chip">${t} <button class="form-chip-remove" onclick="app.removeTag(${i})">\u00D7</button></span>`).join('')}</div>
                <div class="form-add-row"><input class="form-input" id="newTag" placeholder="New tag"><button class="form-add-btn" onclick="app.addTag()">Add</button></div>
            </div>`;
        }

        if (!isNew) {
            html += `<button class="save-btn danger" onclick="app.archiveCurrentActivity()" style="margin-top:24px">Archive Activity</button>`;
        }

        document.getElementById('editActivityBody').innerHTML = html;
    },

    arraysEqual(a, b) {
        if (!a || !b) return false;
        const sa = [...a].sort(); const sb = [...b].sort();
        return sa.length === sb.length && sa.every((v, i) => v === sb[i]);
    },

    setEditCadence(preset) {
        const d = this.modalState.editData;
        if (preset === 'all') d.cadence = ALL_DAYS.slice();
        else if (preset === 'weekdays') d.cadence = WEEKDAYS.slice();
        else if (preset === 'mwf') d.cadence = MWF.slice();
        this.renderEditForm(d);
    },

    toggleEditDay(day) {
        const c = this.modalState.editData.cadence;
        const idx = c.indexOf(day);
        if (idx >= 0) c.splice(idx, 1); else c.push(day);
        this.renderEditForm(this.modalState.editData);
    },

    onTypeChange() {
        this.modalState.editData.trackingType = document.getElementById('editType').value;
        this.renderEditForm(this.modalState.editData);
    },

    addOption() { const v = document.getElementById('newOption').value.trim(); if (v) { this.modalState.editData.options.push(v); this.renderEditForm(this.modalState.editData); } },
    removeOption(i) { this.modalState.editData.options.splice(i, 1); this.renderEditForm(this.modalState.editData); },
    addTag() { const v = document.getElementById('newTag').value.trim(); if (v) { this.modalState.editData.tags.push(v); this.renderEditForm(this.modalState.editData); } },
    removeTag(i) { this.modalState.editData.tags.splice(i, 1); this.renderEditForm(this.modalState.editData); },

    saveActivity() {
        const name = document.getElementById('editName').value.trim();
        if (!name) return;
        const data = this.modalState.editData;
        const subtitle = document.getElementById('editSubtitle').value.trim();
        const type = this.editingActivity ? this.editingActivity.trackingType : document.getElementById('editType').value;

        // Build goal
        let goal = { type: 'completion' };
        const goalEl = document.getElementById('editGoal');
        const goalMinEl = document.getElementById('editGoalMinutes');
        const goalCountEl = document.getElementById('editGoalCount');
        if (goalEl && goalEl.value) goal = { type: 'counter', target: parseInt(goalEl.value) };
        else if (goalMinEl && goalMinEl.value) goal = { type: 'duration', targetMinutes: parseInt(goalMinEl.value) };
        else if (goalCountEl && goalCountEl.value) goal = { type: 'multiSelect', targetCount: parseInt(goalCountEl.value) };

        if (this.editingActivity) {
            const a = this.editingActivity;
            a.name = name; a.subtitle = subtitle;
            a.counterGoal = goal.target || null;
            a.goal = goal; a.cadence = data.cadence;
            a.options = data.options; a.tags = data.tags;
            a.durationPresets = data.durationPresets;
            a.icon = inferIcon(name);
            store.updateActivity(a);
        } else {
            store.addActivity({
                id: uuid(), name, subtitle, emoji: '',
                trackingType: type, sortOrder: 999,
                isArchived: false, createdAt: new Date().toISOString(),
                counterGoal: goal.target || null, goal, cadence: data.cadence,
                options: data.options, tags: data.tags,
                durationPresets: data.durationPresets,
                icon: inferIcon(name),
            });
        }
        this.closeEditActivity();
    },

    archiveCurrentActivity() {
        if (this.editingActivity) {
            store.archiveActivity(this.editingActivity.id);
            this.closeEditActivity();
        }
    },

    // ===== Profile Tab =====
    renderProfile() {
        const profile = store.getUserProfile() || { name: 'User', createdAt: new Date().toISOString() };
        const initial = profile.name.charAt(0).toUpperCase();
        const since = new Date(profile.createdAt).toLocaleDateString('en-US', { month: 'long', year: 'numeric' });

        return `
            <div class="profile-view">
                <div class="profile-avatar">${initial}</div>
                <div class="profile-name">${profile.name}</div>
                <div class="profile-since">Member since ${since}</div>
                <div class="profile-stats-placeholder">
                    <h3>Stats & Trends</h3>
                    <p>Coming soon! Track your streaks, weekly patterns, and progress over time.</p>
                </div>
                <button class="profile-action edit" onclick="app.editProfile()">Edit Name</button>
                <button class="profile-action danger" onclick="app.resetData()">Reset All Data</button>
            </div>
        `;
    },

    editProfile() {
        const profile = store.getUserProfile();
        const name = prompt('Your name:', profile ? profile.name : '');
        if (name && name.trim()) {
            const p = profile || { createdAt: new Date().toISOString() };
            p.name = name.trim();
            store.setUserProfile(p);
            document.getElementById('profileTabLabel').textContent = p.name.split(' ')[0];
            this.render();
        }
    },

    resetData() {
        if (confirm('This will delete all your data. Are you sure?')) {
            localStorage.clear();
            location.reload();
        }
    },
};

// Boot
app.init();
