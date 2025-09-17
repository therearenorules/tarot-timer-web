//
//  TarotWidget.swift
//  TarotTimerWidget
//
//  iOS Widget Extension for Tarot Timer App
//

import WidgetKit
import SwiftUI
import Intents

// MARK: - Widget Provider
struct TarotTimerProvider: IntentTimelineProvider {
    typealias Entry = TarotTimerEntry
    typealias Intent = ConfigurationIntent

    func placeholder(in context: Context) -> TarotTimerEntry {
        TarotTimerEntry(
            date: Date(),
            currentCard: "The Fool",
            progress: 12,
            total: 24,
            timeRemaining: "11:48",
            streak: 7,
            configuration: ConfigurationIntent()
        )
    }

    func getSnapshot(for configuration: ConfigurationIntent, in context: Context, completion: @escaping (TarotTimerEntry) -> ()) {
        let entry = createEntry(for: configuration)
        completion(entry)
    }

    func getTimeline(for configuration: ConfigurationIntent, in context: Context, completion: @escaping (Timeline<TarotTimerEntry>) -> ()) {
        let currentDate = Date()
        let entry = createEntry(for: configuration)

        // 5분마다 업데이트
        let nextUpdate = Calendar.current.date(byAdding: .minute, value: 5, to: currentDate)!
        let timeline = Timeline(entries: [entry], policy: .after(nextUpdate))

        completion(timeline)
    }

    private func createEntry(for configuration: ConfigurationIntent) -> TarotTimerEntry {
        // App Groups을 통해 메인 앱에서 데이터 가져오기
        let widgetData = loadWidgetData()

        return TarotTimerEntry(
            date: Date(),
            currentCard: widgetData.currentCard,
            progress: widgetData.progress,
            total: widgetData.total,
            timeRemaining: widgetData.timeRemaining,
            streak: widgetData.streak,
            configuration: configuration
        )
    }

    private func loadWidgetData() -> WidgetData {
        guard let userDefaults = UserDefaults(suiteName: "group.com.tarottimer.app"),
              let data = userDefaults.data(forKey: "widget_data"),
              let widgetData = try? JSONDecoder().decode(WidgetData.self, from: data) else {
            return WidgetData.placeholder
        }
        return widgetData
    }
}

// MARK: - Widget Entry
struct TarotTimerEntry: TimelineEntry {
    let date: Date
    let currentCard: String
    let progress: Int
    let total: Int
    let timeRemaining: String
    let streak: Int
    let configuration: ConfigurationIntent
}

// MARK: - Widget Data Model
struct WidgetData: Codable {
    let currentCard: String
    let progress: Int
    let total: Int
    let timeRemaining: String
    let streak: Int
    let lastUpdate: String

    static let placeholder = WidgetData(
        currentCard: "오늘의 카드",
        progress: 0,
        total: 24,
        timeRemaining: "24:00",
        streak: 0,
        lastUpdate: ""
    )
}

// MARK: - Widget Views
struct TarotTimerWidgetEntryView: View {
    var entry: TarotTimerProvider.Entry
    @Environment(\.widgetFamily) var family

    var body: some View {
        switch family {
        case .systemSmall:
            SmallWidgetView(entry: entry)
        case .systemMedium:
            MediumWidgetView(entry: entry)
        case .systemLarge:
            LargeWidgetView(entry: entry)
        default:
            SmallWidgetView(entry: entry)
        }
    }
}

// MARK: - Small Widget View
struct SmallWidgetView: View {
    let entry: TarotTimerEntry

    var body: some View {
        ZStack {
            // 미스틱한 배경 그라데이션
            LinearGradient(
                gradient: Gradient(colors: [
                    Color(red: 0.10, green: 0.09, blue: 0.15), // #1a1625
                    Color(red: 0.18, green: 0.11, blue: 0.28)  // #2d1b47
                ]),
                startPoint: .topLeading,
                endPoint: .bottomTrailing
            )

            VStack(spacing: 8) {
                // 타로 카드 아이콘
                Image(systemName: "sparkles")
                    .font(.title2)
                    .foregroundColor(Color(red: 0.96, green: 0.82, blue: 0.25)) // #f4d03f

                // 현재 카드
                Text(entry.currentCard)
                    .font(.caption)
                    .fontWeight(.medium)
                    .foregroundColor(.white)
                    .multilineTextAlignment(.center)
                    .lineLimit(2)

                // 진행률
                Text("\(entry.progress)/\(entry.total)")
                    .font(.caption2)
                    .foregroundColor(Color(red: 0.83, green: 0.72, blue: 1.0)) // #d4b8ff

                // 연속 기록
                HStack(spacing: 2) {
                    Image(systemName: "flame.fill")
                        .font(.caption2)
                        .foregroundColor(.orange)
                    Text("\(entry.streak)")
                        .font(.caption2)
                        .foregroundColor(.orange)
                }
            }
            .padding()
        }
        .clipShape(RoundedRectangle(cornerRadius: 8))
    }
}

// MARK: - Medium Widget View
struct MediumWidgetView: View {
    let entry: TarotTimerEntry

    var body: some View {
        ZStack {
            // 미스틱한 배경 그라데이션
            LinearGradient(
                gradient: Gradient(colors: [
                    Color(red: 0.10, green: 0.09, blue: 0.15), // #1a1625
                    Color(red: 0.18, green: 0.11, blue: 0.28)  // #2d1b47
                ]),
                startPoint: .topLeading,
                endPoint: .bottomTrailing
            )

            HStack(spacing: 16) {
                // 왼쪽: 현재 카드 정보
                VStack(alignment: .leading, spacing: 6) {
                    HStack(spacing: 4) {
                        Image(systemName: "sparkles")
                            .font(.caption)
                            .foregroundColor(Color(red: 0.96, green: 0.82, blue: 0.25)) // #f4d03f
                        Text("오늘의 카드")
                            .font(.caption)
                            .foregroundColor(Color(red: 0.83, green: 0.72, blue: 1.0)) // #d4b8ff
                    }

                    Text(entry.currentCard)
                        .font(.headline)
                        .fontWeight(.bold)
                        .foregroundColor(.white)
                        .lineLimit(2)

                    // 연속 기록
                    HStack(spacing: 4) {
                        Image(systemName: "flame.fill")
                            .font(.caption)
                            .foregroundColor(.orange)
                        Text("\(entry.streak)일 연속")
                            .font(.caption)
                            .foregroundColor(.orange)
                    }
                }

                Spacer()

                // 오른쪽: 진행률과 시간
                VStack(alignment: .trailing, spacing: 8) {
                    // 진행률 원형 차트
                    ZStack {
                        Circle()
                            .stroke(Color.white.opacity(0.2), lineWidth: 4)

                        Circle()
                            .trim(from: 0, to: CGFloat(entry.progress) / CGFloat(entry.total))
                            .stroke(
                                Color(red: 0.96, green: 0.82, blue: 0.25), // #f4d03f
                                style: StrokeStyle(lineWidth: 4, lineCap: .round)
                            )
                            .rotationEffect(.degrees(-90))

                        VStack(spacing: 2) {
                            Text("\(entry.progress)")
                                .font(.title3)
                                .fontWeight(.bold)
                                .foregroundColor(.white)
                            Text("/\(entry.total)")
                                .font(.caption2)
                                .foregroundColor(Color(red: 0.83, green: 0.72, blue: 1.0)) // #d4b8ff
                        }
                    }
                    .frame(width: 50, height: 50)

                    // 남은 시간
                    VStack(alignment: .trailing, spacing: 2) {
                        Text("남은 시간")
                            .font(.caption2)
                            .foregroundColor(Color(red: 0.83, green: 0.72, blue: 1.0)) // #d4b8ff
                        Text(entry.timeRemaining)
                            .font(.caption)
                            .fontWeight(.medium)
                            .foregroundColor(.white)
                    }
                }
            }
            .padding()
        }
        .clipShape(RoundedRectangle(cornerRadius: 8))
    }
}

// MARK: - Large Widget View
struct LargeWidgetView: View {
    let entry: TarotTimerEntry

    var body: some View {
        ZStack {
            // 미스틱한 배경 그라데이션
            LinearGradient(
                gradient: Gradient(colors: [
                    Color(red: 0.10, green: 0.09, blue: 0.15), // #1a1625
                    Color(red: 0.18, green: 0.11, blue: 0.28)  // #2d1b47
                ]),
                startPoint: .topLeading,
                endPoint: .bottomTrailing
            )

            VStack(spacing: 16) {
                // 헤더
                HStack {
                    HStack(spacing: 6) {
                        Image(systemName: "sparkles")
                            .font(.title3)
                            .foregroundColor(Color(red: 0.96, green: 0.82, blue: 0.25)) // #f4d03f
                        Text("타로 타이머")
                            .font(.headline)
                            .fontWeight(.bold)
                            .foregroundColor(.white)
                    }

                    Spacer()

                    // 연속 기록
                    HStack(spacing: 4) {
                        Image(systemName: "flame.fill")
                            .font(.caption)
                            .foregroundColor(.orange)
                        Text("\(entry.streak)일")
                            .font(.caption)
                            .fontWeight(.medium)
                            .foregroundColor(.orange)
                    }
                }

                // 현재 카드 섹션
                VStack(spacing: 8) {
                    Text("오늘의 카드")
                        .font(.subheadline)
                        .foregroundColor(Color(red: 0.83, green: 0.72, blue: 1.0)) // #d4b8ff

                    Text(entry.currentCard)
                        .font(.title2)
                        .fontWeight(.bold)
                        .foregroundColor(.white)
                        .multilineTextAlignment(.center)

                    // 가상의 카드 이미지 (실제로는 앱에서 제공된 이미지 사용)
                    RoundedRectangle(cornerRadius: 8)
                        .fill(Color(red: 0.48, green: 0.17, blue: 0.75)) // #7b2cbf
                        .frame(width: 60, height: 40)
                        .overlay(
                            Image(systemName: "sparkles")
                                .foregroundColor(.white)
                                .font(.title3)
                        )
                }

                // 진행률 섹션
                VStack(spacing: 8) {
                    HStack {
                        Text("오늘의 진행률")
                            .font(.subheadline)
                            .foregroundColor(Color(red: 0.83, green: 0.72, blue: 1.0)) // #d4b8ff

                        Spacer()

                        Text("\(entry.progress)/\(entry.total)")
                            .font(.subheadline)
                            .fontWeight(.medium)
                            .foregroundColor(.white)
                    }

                    // 진행률 바
                    GeometryReader { geometry in
                        ZStack(alignment: .leading) {
                            RoundedRectangle(cornerRadius: 4)
                                .fill(Color.white.opacity(0.2))
                                .frame(height: 8)

                            RoundedRectangle(cornerRadius: 4)
                                .fill(Color(red: 0.96, green: 0.82, blue: 0.25)) // #f4d03f
                                .frame(
                                    width: geometry.size.width * CGFloat(entry.progress) / CGFloat(entry.total),
                                    height: 8
                                )
                        }
                    }
                    .frame(height: 8)

                    // 남은 시간
                    HStack {
                        Text("자정까지")
                            .font(.caption)
                            .foregroundColor(Color(red: 0.83, green: 0.72, blue: 1.0)) // #d4b8ff

                        Spacer()

                        Text(entry.timeRemaining)
                            .font(.caption)
                            .fontWeight(.medium)
                            .foregroundColor(.white)
                    }
                }
            }
            .padding()
        }
        .clipShape(RoundedRectangle(cornerRadius: 8))
    }
}

// MARK: - Widget Configuration
struct TarotTimerWidget: Widget {
    let kind: String = "TarotTimerWidget"

    var body: some WidgetConfiguration {
        IntentConfiguration(kind: kind, intent: ConfigurationIntent.self, provider: TarotTimerProvider()) { entry in
            TarotTimerWidgetEntryView(entry: entry)
        }
        .configurationDisplayName("타로 타이머")
        .description("오늘의 타로 카드와 진행 상황을 확인하세요.")
        .supportedFamilies([.systemSmall, .systemMedium, .systemLarge])
    }
}

// MARK: - Widget Bundle
@main
struct TarotTimerWidgetBundle: WidgetBundle {
    var body: some Widget {
        TarotTimerWidget()
    }
}

// MARK: - Previews
struct TarotTimerWidget_Previews: PreviewProvider {
    static var previews: some View {
        Group {
            TarotTimerWidgetEntryView(entry: TarotTimerEntry(
                date: Date(),
                currentCard: "The Fool",
                progress: 12,
                total: 24,
                timeRemaining: "11:48",
                streak: 7,
                configuration: ConfigurationIntent()
            ))
            .previewContext(WidgetPreviewContext(family: .systemSmall))
            .previewDisplayName("Small")

            TarotTimerWidgetEntryView(entry: TarotTimerEntry(
                date: Date(),
                currentCard: "The Magician",
                progress: 18,
                total: 24,
                timeRemaining: "05:22",
                streak: 15,
                configuration: ConfigurationIntent()
            ))
            .previewContext(WidgetPreviewContext(family: .systemMedium))
            .previewDisplayName("Medium")

            TarotTimerWidgetEntryView(entry: TarotTimerEntry(
                date: Date(),
                currentCard: "The Star",
                progress: 20,
                total: 24,
                timeRemaining: "03:45",
                streak: 30,
                configuration: ConfigurationIntent()
            ))
            .previewContext(WidgetPreviewContext(family: .systemLarge))
            .previewDisplayName("Large")
        }
    }
}