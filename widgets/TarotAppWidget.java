package com.tarottimer.app.widget;

import android.app.PendingIntent;
import android.appwidget.AppWidgetManager;
import android.appwidget.AppWidgetProvider;
import android.content.ComponentName;
import android.content.Context;
import android.content.Intent;
import android.content.SharedPreferences;
import android.graphics.Color;
import android.os.Bundle;
import android.widget.RemoteViews;
import android.util.Log;

import com.tarottimer.app.MainActivity;
import com.tarottimer.app.R;

import org.json.JSONException;
import org.json.JSONObject;

import java.text.SimpleDateFormat;
import java.util.Date;
import java.util.Locale;

/**
 * Android 위젯 구현
 * 타로 타이머 앱의 홈스크린 위젯
 */
public class TarotAppWidget extends AppWidgetProvider {

    private static final String TAG = "TarotAppWidget";
    private static final String WIDGET_CLICK_ACTION = "com.tarottimer.app.WIDGET_CLICK";
    private static final String REFRESH_ACTION = "com.tarottimer.app.WIDGET_REFRESH";

    @Override
    public void onUpdate(Context context, AppWidgetManager appWidgetManager, int[] appWidgetIds) {
        Log.d(TAG, "위젯 업데이트 시작 - 위젯 개수: " + appWidgetIds.length);

        // 모든 위젯 인스턴스 업데이트
        for (int appWidgetId : appWidgetIds) {
            updateAppWidget(context, appWidgetManager, appWidgetId);
        }

        super.onUpdate(context, appWidgetManager, appWidgetIds);
    }

    @Override
    public void onEnabled(Context context) {
        Log.d(TAG, "위젯 활성화됨");
        super.onEnabled(context);
    }

    @Override
    public void onDisabled(Context context) {
        Log.d(TAG, "위젯 비활성화됨");
        super.onDisabled(context);
    }

    @Override
    public void onReceive(Context context, Intent intent) {
        String action = intent.getAction();
        Log.d(TAG, "위젯 액션 수신: " + action);

        if (WIDGET_CLICK_ACTION.equals(action)) {
            // 위젯 클릭 - 앱 열기
            openMainApp(context);
        } else if (REFRESH_ACTION.equals(action)) {
            // 새로고침 버튼 클릭
            refreshAllWidgets(context);
        } else if (AppWidgetManager.ACTION_APPWIDGET_UPDATE.equals(action)) {
            // 정기 업데이트
            Bundle extras = intent.getExtras();
            if (extras != null) {
                int[] appWidgetIds = extras.getIntArray(AppWidgetManager.EXTRA_APPWIDGET_IDS);
                if (appWidgetIds != null && appWidgetIds.length > 0) {
                    onUpdate(context, AppWidgetManager.getInstance(context), appWidgetIds);
                }
            }
        }

        super.onReceive(context, intent);
    }

    /**
     * 개별 위젯 업데이트
     */
    private static void updateAppWidget(Context context, AppWidgetManager appWidgetManager, int appWidgetId) {
        Log.d(TAG, "위젯 ID " + appWidgetId + " 업데이트 중...");

        try {
            // 위젯 데이터 로드
            WidgetData widgetData = loadWidgetData(context);

            // 위젯 크기에 따른 레이아웃 결정
            Bundle options = appWidgetManager.getAppWidgetOptions(appWidgetId);
            int minWidth = options.getInt(AppWidgetManager.OPTION_APPWIDGET_MIN_WIDTH);
            int minHeight = options.getInt(AppWidgetManager.OPTION_APPWIDGET_MIN_HEIGHT);

            RemoteViews views = createWidgetViews(context, widgetData, minWidth, minHeight);

            // 클릭 이벤트 설정
            setupClickEvents(context, views, appWidgetId);

            // 위젯 업데이트
            appWidgetManager.updateAppWidget(appWidgetId, views);

            Log.d(TAG, "위젯 ID " + appWidgetId + " 업데이트 완료");

        } catch (Exception e) {
            Log.e(TAG, "위젯 업데이트 오류: " + e.getMessage(), e);

            // 오류 발생 시 기본 위젯 표시
            RemoteViews errorViews = createErrorWidget(context);
            appWidgetManager.updateAppWidget(appWidgetId, errorViews);
        }
    }

    /**
     * 위젯 데이터 로드
     */
    private static WidgetData loadWidgetData(Context context) {
        try {
            SharedPreferences prefs = context.getSharedPreferences("widget_data", Context.MODE_PRIVATE);
            String jsonData = prefs.getString("widget_android_data", null);

            if (jsonData != null) {
                JSONObject data = new JSONObject(jsonData);
                return new WidgetData(
                    data.optString("cardName", "오늘의 카드"),
                    data.optString("progressText", "0/24 완료"),
                    data.optInt("progressPercent", 0),
                    data.optString("timeRemaining", "24시간 남음"),
                    data.optString("streakText", "0일 연속"),
                    data.optString("updateTime", getCurrentTime())
                );
            }
        } catch (JSONException e) {
            Log.e(TAG, "위젯 데이터 파싱 오류: " + e.getMessage(), e);
        }

        // 기본 데이터 반환
        return new WidgetData(
            "오늘의 카드",
            "0/24 완료",
            0,
            "24시간 남음",
            "0일 연속",
            getCurrentTime()
        );
    }

    /**
     * 위젯 크기에 따른 뷰 생성
     */
    private static RemoteViews createWidgetViews(Context context, WidgetData data, int width, int height) {
        RemoteViews views;

        // 위젯 크기에 따른 레이아웃 선택
        if (width >= 250 && height >= 180) {
            // 대형 위젯 (4x2 이상)
            views = createLargeWidget(context, data);
        } else if (width >= 180) {
            // 중형 위젯 (3x1 이상)
            views = createMediumWidget(context, data);
        } else {
            // 소형 위젯 (2x1)
            views = createSmallWidget(context, data);
        }

        return views;
    }

    /**
     * 소형 위젯 생성 (2x1)
     */
    private static RemoteViews createSmallWidget(Context context, WidgetData data) {
        RemoteViews views = new RemoteViews(context.getPackageName(), R.layout.widget_small);

        // 현재 카드
        views.setTextViewText(R.id.widget_card_name, data.cardName);
        views.setTextColor(R.id.widget_card_name, Color.WHITE);

        // 진행률
        views.setTextViewText(R.id.widget_progress, data.progressText);
        views.setTextColor(R.id.widget_progress, Color.parseColor("#d4b8ff"));

        // 연속 기록
        views.setTextViewText(R.id.widget_streak, data.streakText);
        views.setTextColor(R.id.widget_streak, Color.parseColor("#f4d03f"));

        // 배경 그라데이션 색상 설정
        views.setInt(R.id.widget_background, "setBackgroundResource", R.drawable.widget_background_small);

        return views;
    }

    /**
     * 중형 위젯 생성 (3x1)
     */
    private static RemoteViews createMediumWidget(Context context, WidgetData data) {
        RemoteViews views = new RemoteViews(context.getPackageName(), R.layout.widget_medium);

        // 현재 카드
        views.setTextViewText(R.id.widget_card_name, data.cardName);
        views.setTextColor(R.id.widget_card_name, Color.WHITE);

        // 진행률 텍스트
        views.setTextViewText(R.id.widget_progress_text, data.progressText);
        views.setTextColor(R.id.widget_progress_text, Color.parseColor("#d4b8ff"));

        // 진행률 바
        views.setProgressBar(R.id.widget_progress_bar, 100, data.progressPercent, false);

        // 남은 시간
        views.setTextViewText(R.id.widget_time_remaining, data.timeRemaining);
        views.setTextColor(R.id.widget_time_remaining, Color.WHITE);

        // 연속 기록
        views.setTextViewText(R.id.widget_streak, data.streakText);
        views.setTextColor(R.id.widget_streak, Color.parseColor("#f4d03f"));

        // 배경 설정
        views.setInt(R.id.widget_background, "setBackgroundResource", R.drawable.widget_background_medium);

        return views;
    }

    /**
     * 대형 위젯 생성 (4x2)
     */
    private static RemoteViews createLargeWidget(Context context, WidgetData data) {
        RemoteViews views = new RemoteViews(context.getPackageName(), R.layout.widget_large);

        // 앱 제목
        views.setTextViewText(R.id.widget_title, "타로 타이머");
        views.setTextColor(R.id.widget_title, Color.parseColor("#f4d03f"));

        // 현재 카드 섹션
        views.setTextViewText(R.id.widget_card_label, "오늘의 카드");
        views.setTextColor(R.id.widget_card_label, Color.parseColor("#d4b8ff"));

        views.setTextViewText(R.id.widget_card_name, data.cardName);
        views.setTextColor(R.id.widget_card_name, Color.WHITE);

        // 진행률 섹션
        views.setTextViewText(R.id.widget_progress_label, "오늘의 진행률");
        views.setTextColor(R.id.widget_progress_label, Color.parseColor("#d4b8ff"));

        views.setTextViewText(R.id.widget_progress_text, data.progressText);
        views.setTextColor(R.id.widget_progress_text, Color.WHITE);

        views.setProgressBar(R.id.widget_progress_bar, 100, data.progressPercent, false);

        // 남은 시간
        views.setTextViewText(R.id.widget_time_label, "자정까지");
        views.setTextColor(R.id.widget_time_label, Color.parseColor("#d4b8ff"));

        views.setTextViewText(R.id.widget_time_remaining, data.timeRemaining);
        views.setTextColor(R.id.widget_time_remaining, Color.WHITE);

        // 연속 기록
        views.setTextViewText(R.id.widget_streak, data.streakText);
        views.setTextColor(R.id.widget_streak, Color.parseColor("#f4d03f"));

        // 업데이트 시간
        views.setTextViewText(R.id.widget_update_time, "업데이트: " + data.updateTime);
        views.setTextColor(R.id.widget_update_time, Color.parseColor("#888888"));

        // 배경 설정
        views.setInt(R.id.widget_background, "setBackgroundResource", R.drawable.widget_background_large);

        return views;
    }

    /**
     * 오류 위젯 생성
     */
    private static RemoteViews createErrorWidget(Context context) {
        RemoteViews views = new RemoteViews(context.getPackageName(), R.layout.widget_error);

        views.setTextViewText(R.id.widget_error_text, "타로 타이머\n데이터를 불러올 수 없습니다");
        views.setTextColor(R.id.widget_error_text, Color.WHITE);

        views.setTextViewText(R.id.widget_error_action, "앱을 열어주세요");
        views.setTextColor(R.id.widget_error_action, Color.parseColor("#f4d03f"));

        return views;
    }

    /**
     * 클릭 이벤트 설정
     */
    private static void setupClickEvents(Context context, RemoteViews views, int appWidgetId) {
        // 위젯 전체 클릭 - 앱 열기
        Intent appIntent = new Intent(context, TarotAppWidget.class);
        appIntent.setAction(WIDGET_CLICK_ACTION);
        appIntent.putExtra(AppWidgetManager.EXTRA_APPWIDGET_ID, appWidgetId);

        PendingIntent appPendingIntent = PendingIntent.getBroadcast(
            context,
            appWidgetId,
            appIntent,
            PendingIntent.FLAG_UPDATE_CURRENT | PendingIntent.FLAG_IMMUTABLE
        );

        views.setOnClickPendingIntent(R.id.widget_background, appPendingIntent);

        // 새로고침 버튼 (대형 위젯에만 있는 경우)
        try {
            Intent refreshIntent = new Intent(context, TarotAppWidget.class);
            refreshIntent.setAction(REFRESH_ACTION);
            refreshIntent.putExtra(AppWidgetManager.EXTRA_APPWIDGET_ID, appWidgetId);

            PendingIntent refreshPendingIntent = PendingIntent.getBroadcast(
                context,
                appWidgetId + 1000, // 다른 ID 사용
                refreshIntent,
                PendingIntent.FLAG_UPDATE_CURRENT | PendingIntent.FLAG_IMMUTABLE
            );

            views.setOnClickPendingIntent(R.id.widget_refresh_button, refreshPendingIntent);
        } catch (Exception e) {
            // 새로고침 버튼이 없는 레이아웃인 경우 무시
            Log.d(TAG, "새로고침 버튼 설정 건너뜀: " + e.getMessage());
        }
    }

    /**
     * 메인 앱 열기
     */
    private static void openMainApp(Context context) {
        try {
            Intent intent = new Intent(context, MainActivity.class);
            intent.setFlags(Intent.FLAG_ACTIVITY_NEW_TASK | Intent.FLAG_ACTIVITY_CLEAR_TOP);
            context.startActivity(intent);
            Log.d(TAG, "메인 앱 실행");
        } catch (Exception e) {
            Log.e(TAG, "메인 앱 실행 오류: " + e.getMessage(), e);
        }
    }

    /**
     * 모든 위젯 새로고침
     */
    private static void refreshAllWidgets(Context context) {
        try {
            AppWidgetManager appWidgetManager = AppWidgetManager.getInstance(context);
            ComponentName componentName = new ComponentName(context, TarotAppWidget.class);
            int[] appWidgetIds = appWidgetManager.getAppWidgetIds(componentName);

            Intent updateIntent = new Intent(context, TarotAppWidget.class);
            updateIntent.setAction(AppWidgetManager.ACTION_APPWIDGET_UPDATE);
            updateIntent.putExtra(AppWidgetManager.EXTRA_APPWIDGET_IDS, appWidgetIds);
            context.sendBroadcast(updateIntent);

            Log.d(TAG, "위젯 새로고침 요청: " + appWidgetIds.length + "개");
        } catch (Exception e) {
            Log.e(TAG, "위젯 새로고침 오류: " + e.getMessage(), e);
        }
    }

    /**
     * 현재 시간 반환
     */
    private static String getCurrentTime() {
        SimpleDateFormat sdf = new SimpleDateFormat("HH:mm", Locale.getDefault());
        return sdf.format(new Date());
    }

    /**
     * 위젯 데이터 클래스
     */
    private static class WidgetData {
        final String cardName;
        final String progressText;
        final int progressPercent;
        final String timeRemaining;
        final String streakText;
        final String updateTime;

        WidgetData(String cardName, String progressText, int progressPercent,
                  String timeRemaining, String streakText, String updateTime) {
            this.cardName = cardName;
            this.progressText = progressText;
            this.progressPercent = progressPercent;
            this.timeRemaining = timeRemaining;
            this.streakText = streakText;
            this.updateTime = updateTime;
        }
    }

    /**
     * 외부에서 위젯 업데이트 호출 (React Native에서 사용)
     */
    public static void updateFromApp(Context context) {
        try {
            AppWidgetManager appWidgetManager = AppWidgetManager.getInstance(context);
            ComponentName componentName = new ComponentName(context, TarotAppWidget.class);
            int[] appWidgetIds = appWidgetManager.getAppWidgetIds(componentName);

            for (int appWidgetId : appWidgetIds) {
                updateAppWidget(context, appWidgetManager, appWidgetId);
            }

            Log.d(TAG, "앱에서 위젯 업데이트 완료: " + appWidgetIds.length + "개");
        } catch (Exception e) {
            Log.e(TAG, "앱에서 위젯 업데이트 오류: " + e.getMessage(), e);
        }
    }
}