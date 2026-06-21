package dev.ehan.guardline

import android.accessibilityservice.AccessibilityService
import android.accessibilityservice.AccessibilityServiceInfo
import android.content.Intent
import android.view.accessibility.AccessibilityEvent

class ScamAccessibilityService : AccessibilityService() {

    override fun onServiceConnected() {
        super.onServiceConnected()
        val info = AccessibilityServiceInfo().apply {
            eventTypes = AccessibilityEvent.TYPE_WINDOW_STATE_CHANGED
            feedbackType = AccessibilityServiceInfo.FEEDBACK_GENERIC
            packageNames = arrayOf(
                "com.google.android.dialer",
                "com.android.dialer",
                "com.google.android.apps.telephony"
            )
        }
        serviceInfo = info
    }

    override fun onAccessibilityEvent(event: AccessibilityEvent?) {
        if (event?.eventType != AccessibilityEvent.TYPE_WINDOW_STATE_CHANGED) return

        val className = event.className?.toString() ?: return
        val isInCall = className.contains("InCallActivity", ignoreCase = true) ||
                       className.contains("CallActivity", ignoreCase = true)

        val intent = Intent(this, ScamForegroundService::class.java)
        if (isInCall) {
            intent.action = "START_RECORDING"
            startForegroundService(intent)
        } else {
            intent.action = "STOP_RECORDING"
            startService(intent)
        }
    }

    override fun onInterrupt() {}
}
