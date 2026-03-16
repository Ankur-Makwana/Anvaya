import SwiftUI

struct ActivityEditorView: View {
    @EnvironmentObject var store: DataStore
    @Environment(\.presentationMode) var presentationMode

    let activity: Activity?

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
        if isNew {
            NavigationView {
                formContent
            }
        } else {
            formContent
        }
    }

    private var formContent: some View {
        Form {
            basicInfoSection
            trackingTypeSection
            configSection
            archiveSection
        }
        .navigationTitle(isNew ? "New Activity" : "Edit Activity")
        .navigationBarTitleDisplayMode(.inline)
        .navigationBarItems(
            leading: isNew ? Button("Cancel") { presentationMode.wrappedValue.dismiss() } : nil,
            trailing: Button("Save") { save() }
                .disabled(name.trimmingCharacters(in: .whitespacesAndNewlines).isEmpty)
        )
        .onAppear { loadActivity() }
    }

    private var basicInfoSection: some View {
        Section(header: Text("Basic Info")) {
            TextField("Name", text: $name)
            TextField("Subtitle (optional)", text: $subtitle)
            TextField("Emoji", text: $emoji)
        }
    }

    private var trackingTypeSection: some View {
        Section(header: Text("Tracking Type")) {
            if isNew {
                Picker("Type", selection: $trackingType) {
                    ForEach(TrackingType.allCases) { type in
                        Text(type.rawValue).tag(type)
                    }
                }
            } else {
                Text(trackingType.rawValue)
                    .foregroundColor(Color.secondary)
            }
        }
    }

    @ViewBuilder
    private var configSection: some View {
        if trackingType == .counter {
            counterSection
        } else if trackingType == .singleSelect {
            optionsSection
        } else if trackingType == .multiSelect {
            tagsSection
        } else if trackingType == .duration {
            durationSection
        }
    }

    private var counterSection: some View {
        Section(header: Text("Counter Goal")) {
            TextField("Goal (e.g., 4)", text: $counterGoal)
                .keyboardType(.numberPad)
        }
    }

    private var optionsSection: some View {
        Section(header: Text("Options")) {
            ForEach(options, id: \.self) { option in
                Text(option)
            }
            .onDelete { indices in
                options.remove(atOffsets: indices)
            }
            HStack {
                TextField("New option", text: $newOption)
                Button("Add") {
                    addOption()
                }
                .disabled(newOption.trimmingCharacters(in: .whitespacesAndNewlines).isEmpty)
            }
        }
    }

    private var tagsSection: some View {
        Section(header: Text("Tags")) {
            ForEach(tags, id: \.self) { tag in
                Text(tag)
            }
            .onDelete { indices in
                tags.remove(atOffsets: indices)
            }
            HStack {
                TextField("New tag", text: $newTag)
                Button("Add") {
                    addTag()
                }
                .disabled(newTag.trimmingCharacters(in: .whitespacesAndNewlines).isEmpty)
            }
        }
    }

    private var durationSection: some View {
        Section(header: Text("Duration Presets (minutes)")) {
            ForEach(durationPresets, id: \.self) { preset in
                Text("\(preset) min")
            }
            .onDelete { indices in
                durationPresets.remove(atOffsets: indices)
            }
        }
    }

    @ViewBuilder
    private var archiveSection: some View {
        if !isNew {
            Section {
                Button(action: {
                    if let a = activity {
                        store.archiveActivity(a)
                    }
                    presentationMode.wrappedValue.dismiss()
                }) {
                    Text("Archive Activity")
                        .foregroundColor(Color.red)
                }
            }
        }
    }

    private func addOption() {
        let trimmed = newOption.trimmingCharacters(in: .whitespacesAndNewlines)
        guard !trimmed.isEmpty else { return }
        options.append(trimmed)
        newOption = ""
    }

    private func addTag() {
        let trimmed = newTag.trimmingCharacters(in: .whitespacesAndNewlines)
        guard !trimmed.isEmpty else { return }
        tags.append(trimmed)
        newTag = ""
    }

    private func loadActivity() {
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

    private func save() {
        let trimmedName = name.trimmingCharacters(in: .whitespacesAndNewlines)
        guard !trimmedName.isEmpty else { return }

        if var a = activity {
            a.name = trimmedName
            a.subtitle = subtitle
            a.emoji = emoji
            a.counterGoal = Int(counterGoal)
            a.options = options
            a.tags = tags
            a.durationPresets = durationPresets
            store.updateActivity(a)
        } else {
            let newActivity = Activity(
                name: trimmedName,
                subtitle: subtitle,
                emoji: emoji.isEmpty ? "📌" : emoji,
                trackingType: trackingType,
                sortOrder: 999,
                counterGoal: Int(counterGoal),
                options: options,
                tags: tags,
                durationPresets: durationPresets
            )
            store.addActivity(newActivity)
        }
        presentationMode.wrappedValue.dismiss()
    }
}
