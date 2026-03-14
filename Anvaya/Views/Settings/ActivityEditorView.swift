import SwiftUI
import SwiftData

struct ActivityEditorView: View {
    @Environment(\.modelContext) private var modelContext
    @Environment(\.dismiss) private var dismiss

    let activity: Activity?   // nil = creating new

    @State private var name: String = ""
    @State private var subtitle: String = ""
    @State private var emoji: String = "📌"
    @State private var trackingType: TrackingType = .yesNo
    @State private var counterGoal: String = ""
    @State private var options: [String] = []
    @State private var tags: [String] = []
    @State private var durationPresets: [Int] = [5, 10, 15, 20, 30, 45, 60, 90, 120]

    @State private var newOption: String = ""
    @State private var newTag: String = ""

    var isNew: Bool { activity == nil }

    var body: some View {
        Form {
            Section("Basic Info") {
                TextField("Name", text: $name)
                TextField("Subtitle (optional)", text: $subtitle)
                TextField("Emoji", text: $emoji)
                    .onChange(of: emoji) { _, newValue in
                        // Limit to one character/emoji
                        if newValue.count > 1 {
                            emoji = String(newValue.suffix(1))
                        }
                    }
            }

            if isNew {
                Section("Tracking Type") {
                    Picker("Type", selection: $trackingType) {
                        ForEach(TrackingType.allCases) { type in
                            Text(type.rawValue).tag(type)
                        }
                    }
                    .pickerStyle(.menu)
                }
            } else {
                Section("Tracking Type") {
                    Text(trackingType.rawValue)
                        .foregroundStyle(.secondary)
                }
            }

            // Type-specific config
            switch trackingType {
            case .counter:
                Section("Counter Goal") {
                    TextField("Goal (e.g., 4)", text: $counterGoal)
                        .keyboardType(.numberPad)
                }

            case .singleSelect:
                Section("Options") {
                    ForEach(options, id: \.self) { option in
                        Text(option)
                    }
                    .onDelete { indices in
                        options.remove(atOffsets: indices)
                    }
                    HStack {
                        TextField("New option", text: $newOption)
                        Button("Add") {
                            let trimmed = newOption.trimmingCharacters(in: .whitespacesAndNewlines)
                            guard !trimmed.isEmpty else { return }
                            options.append(trimmed)
                            newOption = ""
                        }
                        .disabled(newOption.trimmingCharacters(in: .whitespacesAndNewlines).isEmpty)
                    }
                }

            case .multiSelect:
                Section("Tags") {
                    ForEach(tags, id: \.self) { tag in
                        Text(tag)
                    }
                    .onDelete { indices in
                        tags.remove(atOffsets: indices)
                    }
                    HStack {
                        TextField("New tag", text: $newTag)
                        Button("Add") {
                            let trimmed = newTag.trimmingCharacters(in: .whitespacesAndNewlines)
                            guard !trimmed.isEmpty else { return }
                            tags.append(trimmed)
                            newTag = ""
                        }
                        .disabled(newTag.trimmingCharacters(in: .whitespacesAndNewlines).isEmpty)
                    }
                }

            case .duration:
                Section("Duration Presets (minutes)") {
                    ForEach(durationPresets, id: \.self) { preset in
                        Text("\(preset) min")
                    }
                    .onDelete { indices in
                        durationPresets.remove(atOffsets: indices)
                    }
                }

            case .yesNo:
                EmptyView()
            }

            if !isNew {
                Section {
                    Button("Archive Activity", role: .destructive) {
                        activity?.isArchived = true
                        dismiss()
                    }
                }
            }
        }
        .navigationTitle(isNew ? "New Activity" : "Edit Activity")
        .navigationBarTitleDisplayMode(.inline)
        .toolbar {
            if isNew {
                ToolbarItem(placement: .topBarLeading) {
                    Button("Cancel") { dismiss() }
                }
            }
            ToolbarItem(placement: .topBarTrailing) {
                Button("Save") {
                    save()
                }
                .disabled(name.trimmingCharacters(in: .whitespacesAndNewlines).isEmpty)
            }
        }
        .onAppear {
            if let a = activity {
                name = a.name
                subtitle = a.subtitle
                emoji = a.emoji
                trackingType = a.trackingType
                counterGoal = a.counterGoal.map { String($0) } ?? ""
                options = a.options
                tags = a.tags
                durationPresets = a.durationPresets
            }
        }
    }

    private func save() {
        let trimmedName = name.trimmingCharacters(in: .whitespacesAndNewlines)
        guard !trimmedName.isEmpty else { return }

        if let a = activity {
            // Update existing
            a.name = trimmedName
            a.subtitle = subtitle
            a.emoji = emoji
            a.counterGoal = Int(counterGoal)
            a.options = options
            a.tags = tags
            a.durationPresets = durationPresets
        } else {
            // Create new
            let newActivity = Activity(
                name: trimmedName,
                subtitle: subtitle,
                emoji: emoji.isEmpty ? "📌" : emoji,
                trackingType: trackingType,
                sortOrder: 999,   // will appear at end
                counterGoal: Int(counterGoal),
                options: options,
                tags: tags,
                durationPresets: durationPresets
            )
            modelContext.insert(newActivity)
        }
        dismiss()
    }
}
