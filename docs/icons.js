// ===== Minimalist SVG Icon Library =====
// All icons: 24x24 viewBox, thin stroke, currentColor

const ICONS = {
    water: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
        <path d="M12 2.5 C12 2.5 5 10 5 14.5 C5 18.5 8 21.5 12 21.5 C16 21.5 19 18.5 19 14.5 C19 10 12 2.5 12 2.5Z"/>
        <path d="M8.5 15.5 C8.5 17.5 10 19 12 19" opacity="0.5"/>
    </svg>`,

    climbing: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
        <path d="M4 20 L10 10 L14 14 L20 4"/>
        <circle cx="20" cy="4" r="1.5" fill="currentColor"/>
        <path d="M7 22 L4 20 L7 18" opacity="0.5"/>
    </svg>`,

    strength: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
        <path d="M6 9 L6 15"/>
        <path d="M18 9 L18 15"/>
        <path d="M3 10 L3 14"/>
        <path d="M21 10 L21 14"/>
        <path d="M6 12 L18 12"/>
        <path d="M3 12 L6 12"/>
        <path d="M18 12 L21 12"/>
    </svg>`,

    rolling: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
        <circle cx="12" cy="12" r="8"/>
        <circle cx="12" cy="12" r="3"/>
        <path d="M12 4 L12 9" opacity="0.4"/>
        <path d="M12 15 L12 20" opacity="0.4"/>
    </svg>`,

    protein: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
        <path d="M8 2 L16 2 L16 6 L17 6 L17 8 L7 8 L7 6 L8 6 Z"/>
        <path d="M7 8 L8 22 L16 22 L17 8"/>
        <path d="M7 14 L17 14" opacity="0.4"/>
    </svg>`,

    pill: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
        <rect x="6" y="3" width="12" height="18" rx="6"/>
        <path d="M6 12 L18 12"/>
    </svg>`,

    bowl: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
        <path d="M3 10 C3 10 3 18 12 18 C21 18 21 10 21 10"/>
        <path d="M3 10 L21 10"/>
        <path d="M10 20 L14 20"/>
        <path d="M12 18 L12 20"/>
        <path d="M8 7 Q9 5 10 7" opacity="0.5"/>
        <path d="M12 6 Q13 4 14 6" opacity="0.5"/>
    </svg>`,

    breathing: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
        <path d="M4 12 Q4 4 12 4 Q20 4 20 12"/>
        <path d="M6 12 Q6 6 12 6 Q18 6 18 12" opacity="0.5"/>
        <path d="M4 12 L20 12"/>
        <path d="M8 15 Q12 20 16 15" opacity="0.5"/>
    </svg>`,

    tennis: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
        <circle cx="11" cy="11" r="7"/>
        <path d="M6 5 Q11 11 6 17"/>
        <path d="M16 5 Q11 11 16 17"/>
        <path d="M16 16 L21 21"/>
    </svg>`,

    running: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
        <circle cx="14" cy="4" r="2"/>
        <path d="M8 22 L11 16 L7 12 L10 8 L15 9 L18 6"/>
        <path d="M11 16 L17 16 L20 20"/>
    </svg>`,

    cycling: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
        <circle cx="6" cy="17" r="4"/>
        <circle cx="18" cy="17" r="4"/>
        <path d="M6 17 L10 7 L14 7"/>
        <path d="M18 17 L14 7 L10 7"/>
    </svg>`,

    yoga: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
        <circle cx="12" cy="5" r="2"/>
        <path d="M12 7 L12 14"/>
        <path d="M8 10 L12 8 L16 10"/>
        <path d="M7 20 L12 14 L17 20"/>
    </svg>`,

    sleep: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
        <path d="M20 14 Q14 14 14 8 Q14 4 18 2 Q10 2 6 8 Q4 12 6 16 Q8 20 14 20 Q18 20 20 14Z"/>
        <path d="M16 6 L19 6 L16 9 L19 9" opacity="0.5"/>
    </svg>`,

    reading: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
        <path d="M2 4 Q7 2 12 5 Q17 2 22 4 L22 19 Q17 17 12 19 Q7 17 2 19 Z"/>
        <path d="M12 5 L12 19"/>
    </svg>`,

    swimming: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
        <circle cx="8" cy="6" r="2"/>
        <path d="M6 12 L10 8 L16 12"/>
        <path d="M2 16 Q5 14 8 16 Q11 18 14 16 Q17 14 20 16 Q22 17 22 17"/>
        <path d="M2 20 Q5 18 8 20 Q11 22 14 20 Q17 18 20 20" opacity="0.5"/>
    </svg>`,

    walking: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
        <circle cx="12" cy="4" r="2"/>
        <path d="M12 6 L12 14"/>
        <path d="M9 10 L15 10"/>
        <path d="M12 14 L8 22"/>
        <path d="M12 14 L16 22"/>
    </svg>`,

    phone: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
        <path d="M5 3 L9 3 L11 8 L8.5 9.5 Q10 13 14.5 15.5 L16 13 L21 15 L21 19 Q21 21 19 21 Q5 20 3 5 Q3 3 5 3Z"/>
    </svg>`,

    heart: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
        <path d="M12 21 C12 21 3 14 3 8.5 Q3 4 7.5 4 Q10 4 12 6.5 Q14 4 16.5 4 Q21 4 21 8.5 C21 14 12 21 12 21Z"/>
    </svg>`,

    default: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
        <circle cx="12" cy="12" r="9"/>
        <circle cx="12" cy="12" r="2" fill="currentColor"/>
    </svg>`,
};

function getIcon(name) {
    return ICONS[name] || ICONS.default;
}
