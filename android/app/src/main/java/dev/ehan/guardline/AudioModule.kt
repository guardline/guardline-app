package dev.ehan.guardline

import android.content.Context
import android.content.Intent
import android.content.pm.PackageManager
import android.graphics.Color
import android.graphics.drawable.GradientDrawable
import android.net.Uri
import android.os.Build
import android.provider.Settings
import android.view.Gravity
import android.view.View
import android.view.ViewGroup
import android.view.WindowManager
import android.widget.Button
import android.widget.FrameLayout
import android.widget.LinearLayout
import android.widget.ScrollView
import android.widget.TextView
import androidx.core.content.ContextCompat
import com.facebook.react.bridge.Promise
import com.facebook.react.bridge.ReactApplicationContext
import com.facebook.react.bridge.ReactContextBaseJavaModule
import com.facebook.react.bridge.ReactMethod
import com.facebook.react.modules.core.DeviceEventManagerModule
import org.json.JSONArray

class AudioModule(reactContext: ReactApplicationContext) :
    ReactContextBaseJavaModule(reactContext) {

    override fun getName() = "AudioModule"

    companion object {
        private var moduleContext: ReactApplicationContext? = null

        fun sendAudioChunk(base64: String) {
            moduleContext
                ?.getJSModule(DeviceEventManagerModule.RCTDeviceEventEmitter::class.java)
                ?.emit("audioChunk", base64)
        }

        fun sendListeningState(isListening: Boolean) {
            moduleContext
                ?.getJSModule(DeviceEventManagerModule.RCTDeviceEventEmitter::class.java)
                ?.emit("listeningState", isListening)
        }

        fun showDemoScamOverlay() {
            moduleContext?.let { ctx ->
                ctx.runOnUiQueueThread {
                    val wm = ctx.getSystemService(Context.WINDOW_SERVICE) as WindowManager
                    val context = ctx

                    val overlay = FrameLayout(context).apply {
                        layoutParams = ViewGroup.LayoutParams(
                            ViewGroup.LayoutParams.MATCH_PARENT,
                            ViewGroup.LayoutParams.MATCH_PARENT
                        )
                        setBackgroundColor(Color.parseColor("#99000000"))
                        setOnTouchListener { _, _ -> true }
                    }

                    val scrollView = ScrollView(context).apply {
                        layoutParams = FrameLayout.LayoutParams(
                            dpPx(context, 340),
                            FrameLayout.LayoutParams.WRAP_CONTENT
                        ).apply { gravity = Gravity.CENTER }
                        isVerticalScrollBarEnabled = false
                    }

                    val card = LinearLayout(context).apply {
                        layoutParams = LinearLayout.LayoutParams(
                            LinearLayout.LayoutParams.MATCH_PARENT,
                            LinearLayout.LayoutParams.WRAP_CONTENT
                        )
                        orientation = LinearLayout.VERTICAL
                        gravity = Gravity.CENTER_HORIZONTAL
                        setPadding(dpPx(context, 24), dpPx(context, 24), dpPx(context, 24), dpPx(context, 24))
                        background = GradientDrawable().apply {
                            setColor(Color.parseColor("#FF1a1a2e"))
                            cornerRadius = dpPx(context, 24).toFloat()
                            setStroke(dpPx(context, 2), Color.parseColor("#FFEF4444"))
                        }
                        elevation = 16f
                    }

                    card.addView(TextView(context).apply {
                        text = "\uD83D\uDEA8"
                        textSize = 48f
                        gravity = Gravity.CENTER
                        setPadding(0, 0, 0, dpPx(context, 12))
                    })

                    card.addView(TextView(context).apply {
                        text = "SCAM DETECTED"
                        setTextColor(Color.parseColor("#FFEF4444"))
                        textSize = 22f
                        typeface = android.graphics.Typeface.DEFAULT_BOLD
                        gravity = Gravity.CENTER
                        setPadding(0, 0, 0, dpPx(context, 16))
                    })

                    val scoreRow = LinearLayout(context).apply {
                        layoutParams = LinearLayout.LayoutParams(
                            LinearLayout.LayoutParams.MATCH_PARENT,
                            LinearLayout.LayoutParams.WRAP_CONTENT
                        )
                        orientation = LinearLayout.HORIZONTAL
                        gravity = Gravity.CENTER_VERTICAL
                        setPadding(dpPx(context, 16), dpPx(context, 10), dpPx(context, 16), dpPx(context, 10))
                        background = GradientDrawable().apply {
                            setColor(Color.parseColor("#1AEF4444"))
                            cornerRadius = dpPx(context, 12).toFloat()
                        }
                        layoutParams = LinearLayout.LayoutParams(
                            LinearLayout.LayoutParams.MATCH_PARENT,
                            LinearLayout.LayoutParams.WRAP_CONTENT
                        ).apply {
                            setMargins(0, 0, 0, dpPx(context, 16))
                        }
                    }
                    scoreRow.addView(TextView(context).apply {
                        text = "Risk Score"
                        setTextColor(Color.parseColor("#80FFFFFF"))
                        textSize = 14f
                        layoutParams = LinearLayout.LayoutParams(0, LinearLayout.LayoutParams.WRAP_CONTENT, 1f)
                    })
                    scoreRow.addView(TextView(context).apply {
                        text = "92%"
                        setTextColor(Color.parseColor("#FFEF4444"))
                        textSize = 20f
                        typeface = android.graphics.Typeface.DEFAULT_BOLD
                    })
                    card.addView(scoreRow)

                    val flags = listOf(
                        "Gift card payment requested",
                        "Urgency and pressure tactics",
                        "Caller impersonating a company",
                    )
                    for (flag in flags) {
                        val flagRow = LinearLayout(context).apply {
                            orientation = LinearLayout.HORIZONTAL
                            gravity = Gravity.CENTER_VERTICAL
                            setPadding(dpPx(context, 12), dpPx(context, 8), dpPx(context, 12), dpPx(context, 8))
                            background = GradientDrawable().apply {
                                setColor(Color.parseColor("#14EF4444"))
                                cornerRadius = dpPx(context, 10).toFloat()
                                setStroke(dpPx(context, 1), Color.parseColor("#33EF4444"))
                            }
                            layoutParams = LinearLayout.LayoutParams(
                                LinearLayout.LayoutParams.MATCH_PARENT,
                                LinearLayout.LayoutParams.WRAP_CONTENT
                            ).apply {
                                setMargins(0, 0, 0, dpPx(context, 6))
                            }
                        }
                        flagRow.addView(TextView(context).apply {
                            text = "\u26A0\uFE0F"
                            textSize = 14f
                            setPadding(0, 0, dpPx(context, 8), 0)
                        })
                        flagRow.addView(TextView(context).apply {
                            text = flag
                            setTextColor(Color.parseColor("#FFEF4444"))
                            textSize = 13f
                            layoutParams = LinearLayout.LayoutParams(0, LinearLayout.LayoutParams.WRAP_CONTENT, 1f)
                        })
                        card.addView(flagRow)
                    }

                    card.addView(TextView(context).apply {
                        text = "This is most likely a scam. A real company would never ask you to pay in gift cards. Hang up immediately and do not send any money."
                        setTextColor(Color.parseColor("#8CFFFFFF"))
                        textSize = 13f
                        gravity = Gravity.CENTER
                        setLineSpacing(0f, 1.3f)
                        setPadding(0, dpPx(context, 16), 0, dpPx(context, 20))
                    })

                    card.addView(Button(context).apply {
                        text = "Dismiss"
                        setTextColor(Color.WHITE)
                        textSize = 16f
                        typeface = android.graphics.Typeface.DEFAULT_BOLD
                        setBackgroundColor(Color.parseColor("#FFDC2626"))
                        setPadding(0, dpPx(context, 14), 0, dpPx(context, 14))
                        layoutParams = LinearLayout.LayoutParams(
                            LinearLayout.LayoutParams.MATCH_PARENT,
                            LinearLayout.LayoutParams.WRAP_CONTENT
                        )
                        setOnClickListener {
                            try {
                                wm.removeView(overlay)
                            } catch (_: Exception) {}
                        }
                    })

                    scrollView.addView(card)
                    overlay.addView(scrollView)

                    val type = if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O)
                        WindowManager.LayoutParams.TYPE_APPLICATION_OVERLAY
                    else
                        WindowManager.LayoutParams.TYPE_PHONE

                    val wmFlags = WindowManager.LayoutParams.FLAG_NOT_FOCUSABLE or
                            WindowManager.LayoutParams.FLAG_LAYOUT_IN_SCREEN or
                            WindowManager.LayoutParams.FLAG_KEEP_SCREEN_ON

                    val params = WindowManager.LayoutParams(
                        WindowManager.LayoutParams.MATCH_PARENT,
                        WindowManager.LayoutParams.MATCH_PARENT,
                        type,
                        wmFlags,
                        android.graphics.PixelFormat.TRANSLUCENT
                    )

                    try {
                        wm.addView(overlay, params)
                    } catch (_: Exception) {}
                }
            }
        }
    }

    private var scamOverlay: View? = null
    private var windowManager: WindowManager? = null

    init {
        moduleContext = reactContext
    }

    @ReactMethod
    fun hasAudioPermission(promise: Promise) {
        val granted = ContextCompat.checkSelfPermission(
            reactApplicationContext,
            android.Manifest.permission.RECORD_AUDIO
        ) == PackageManager.PERMISSION_GRANTED
        promise.resolve(granted)
    }

    @ReactMethod
    fun hasOverlayPermission(promise: Promise) {
        val granted = if (android.os.Build.VERSION.SDK_INT >= android.os.Build.VERSION_CODES.M) {
            android.provider.Settings.canDrawOverlays(reactApplicationContext)
        } else true
        promise.resolve(granted)
    }

    @ReactMethod
    fun hasAccessibilityEnabled(promise: Promise) {
        val enabled = reactApplicationContext
            .getSharedPreferences("guardline", 0)
            .getBoolean("accessibility_enabled", false)
        promise.resolve(enabled)
    }

    @ReactMethod
    fun openAccessibilitySettings() {
        val intent = Intent(Settings.ACTION_ACCESSIBILITY_SETTINGS).apply {
            addFlags(Intent.FLAG_ACTIVITY_NEW_TASK)
        }
        reactApplicationContext.startActivity(intent)
    }

    @ReactMethod
    fun openOverlaySettings() {
        val intent = Intent(
            Settings.ACTION_MANAGE_OVERLAY_PERMISSION,
            Uri.parse("package:${reactApplicationContext.packageName}")
        ).apply {
            addFlags(Intent.FLAG_ACTIVITY_NEW_TASK)
        }
        reactApplicationContext.startActivity(intent)
    }

    @ReactMethod
    fun showScamOverlay(verdict: String, riskScore: Int, redFlagsJson: String, explanation: String, whatToDo: String) {
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.M &&
            !Settings.canDrawOverlays(reactApplicationContext)
        ) return

        reactApplicationContext.runOnUiQueueThread {
            hideScamOverlayInternal()

            windowManager = reactApplicationContext.getSystemService(Context.WINDOW_SERVICE) as WindowManager
            val context = reactApplicationContext

            val redFlags = try {
                val arr = JSONArray(redFlagsJson)
                (0 until arr.length()).map { arr.getString(it) }
            } catch (_: Exception) {
                emptyList()
            }

            val overlay = FrameLayout(context).apply {
                layoutParams = ViewGroup.LayoutParams(
                    ViewGroup.LayoutParams.MATCH_PARENT,
                    ViewGroup.LayoutParams.MATCH_PARENT
                )
                setBackgroundColor(Color.parseColor("#99000000"))
                setOnTouchListener { _, _ -> true }
            }

            val scrollView = ScrollView(context).apply {
                layoutParams = FrameLayout.LayoutParams(
                    dpPx(context, 340),
                    FrameLayout.LayoutParams.WRAP_CONTENT
                ).apply { gravity = Gravity.CENTER }
                isVerticalScrollBarEnabled = false
            }

            val card = LinearLayout(context).apply {
                layoutParams = LinearLayout.LayoutParams(
                    LinearLayout.LayoutParams.MATCH_PARENT,
                    LinearLayout.LayoutParams.WRAP_CONTENT
                )
                orientation = LinearLayout.VERTICAL
                gravity = Gravity.CENTER_HORIZONTAL
                setPadding(dpPx(context, 24), dpPx(context, 24), dpPx(context, 24), dpPx(context, 24))
                background = GradientDrawable().apply {
                    setColor(Color.parseColor("#FF1a1a2e"))
                    cornerRadius = dpPx(context, 24).toFloat()
                    setStroke(dpPx(context, 2), Color.parseColor("#FFEF4444"))
                }
                elevation = 16f
            }

            // Emoji
            card.addView(TextView(context).apply {
                text = "\uD83D\uDEA8"
                textSize = 48f
                gravity = Gravity.CENTER
                setPadding(0, 0, 0, dpPx(context, 12))
            })

            // Title
            card.addView(TextView(context).apply {
                text = "SCAM DETECTED"
                setTextColor(Color.parseColor("#FFEF4444"))
                textSize = 22f
                typeface = android.graphics.Typeface.DEFAULT_BOLD
                gravity = Gravity.CENTER
                setPadding(0, 0, 0, dpPx(context, 16))
            })

            // Risk score row
            val scoreRow = LinearLayout(context).apply {
                layoutParams = LinearLayout.LayoutParams(
                    LinearLayout.LayoutParams.MATCH_PARENT,
                    LinearLayout.LayoutParams.WRAP_CONTENT
                )
                orientation = LinearLayout.HORIZONTAL
                gravity = Gravity.CENTER_VERTICAL
                setPadding(dpPx(context, 16), dpPx(context, 10), dpPx(context, 16), dpPx(context, 10))
                background = GradientDrawable().apply {
                    setColor(Color.parseColor("#1AEF4444"))
                    cornerRadius = dpPx(context, 12).toFloat()
                }
                layoutParams = LinearLayout.LayoutParams(
                    LinearLayout.LayoutParams.MATCH_PARENT,
                    LinearLayout.LayoutParams.WRAP_CONTENT
                ).apply {
                    setMargins(0, 0, 0, dpPx(context, 16))
                }
            }
            scoreRow.addView(TextView(context).apply {
                text = "Risk Score"
                setTextColor(Color.parseColor("#80FFFFFF"))
                textSize = 14f
                layoutParams = LinearLayout.LayoutParams(0, LinearLayout.LayoutParams.WRAP_CONTENT, 1f)
            })
            scoreRow.addView(TextView(context).apply {
                text = "$riskScore%"
                setTextColor(Color.parseColor("#FFEF4444"))
                textSize = 20f
                typeface = android.graphics.Typeface.DEFAULT_BOLD
            })
            card.addView(scoreRow)

            // Red flags
            for (flag in redFlags) {
                val flagRow = LinearLayout(context).apply {
                    orientation = LinearLayout.HORIZONTAL
                    gravity = Gravity.CENTER_VERTICAL
                    setPadding(dpPx(context, 12), dpPx(context, 8), dpPx(context, 12), dpPx(context, 8))
                    background = GradientDrawable().apply {
                        setColor(Color.parseColor("#14EF4444"))
                        cornerRadius = dpPx(context, 10).toFloat()
                        setStroke(dpPx(context, 1), Color.parseColor("#33EF4444"))
                    }
                    layoutParams = LinearLayout.LayoutParams(
                        LinearLayout.LayoutParams.MATCH_PARENT,
                        LinearLayout.LayoutParams.WRAP_CONTENT
                    ).apply {
                        setMargins(0, 0, 0, dpPx(context, 6))
                    }
                }
                flagRow.addView(TextView(context).apply {
                    text = "\u26A0\uFE0F"
                    textSize = 14f
                    setPadding(0, 0, dpPx(context, 8), 0)
                })
                flagRow.addView(TextView(context).apply {
                    text = flag
                    setTextColor(Color.parseColor("#FFEF4444"))
                    textSize = 13f
                    layoutParams = LinearLayout.LayoutParams(0, LinearLayout.LayoutParams.WRAP_CONTENT, 1f)
                })
                card.addView(flagRow)
            }

            // Explanation
            card.addView(TextView(context).apply {
                text = explanation
                setTextColor(Color.parseColor("#8CFFFFFF"))
                textSize = 13f
                gravity = Gravity.CENTER
                setLineSpacing(0f, 1.3f)
                setPadding(0, dpPx(context, 16), 0, dpPx(context, 20))
            })

            // Dismiss button
            card.addView(Button(context).apply {
                text = "Dismiss"
                setTextColor(Color.WHITE)
                textSize = 16f
                typeface = android.graphics.Typeface.DEFAULT_BOLD
                setBackgroundColor(Color.parseColor("#FFDC2626"))
                setPadding(0, dpPx(context, 14), 0, dpPx(context, 14))
                layoutParams = LinearLayout.LayoutParams(
                    LinearLayout.LayoutParams.MATCH_PARENT,
                    LinearLayout.LayoutParams.WRAP_CONTENT
                )
                setOnClickListener {
                    hideScamOverlayInternal()
                }
            })

            scrollView.addView(card)
            overlay.addView(scrollView)
            scamOverlay = overlay

            val flags = if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
                WindowManager.LayoutParams.FLAG_NOT_FOCUSABLE or
                WindowManager.LayoutParams.FLAG_LAYOUT_IN_SCREEN or
                WindowManager.LayoutParams.FLAG_KEEP_SCREEN_ON
            } else {
                WindowManager.LayoutParams.FLAG_NOT_FOCUSABLE or
                WindowManager.LayoutParams.FLAG_LAYOUT_IN_SCREEN
            }

            val type = if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O)
                WindowManager.LayoutParams.TYPE_APPLICATION_OVERLAY
            else
                WindowManager.LayoutParams.TYPE_PHONE

            val params = WindowManager.LayoutParams(
                WindowManager.LayoutParams.MATCH_PARENT,
                WindowManager.LayoutParams.MATCH_PARENT,
                type,
                flags,
                android.graphics.PixelFormat.TRANSLUCENT
            )

            try {
                windowManager?.addView(overlay, params)
            } catch (_: Exception) {}

        }
    }

    @ReactMethod
    fun hideScamOverlay() {
        reactApplicationContext.runOnUiQueueThread {
            hideScamOverlayInternal()
        }
    }

    private fun hideScamOverlayInternal() {
        scamOverlay?.let {
            try {
                windowManager?.removeView(it)
            } catch (_: Exception) {}
            scamOverlay = null
        }
    }

    @ReactMethod
    fun addListener(eventName: String) {}

    @ReactMethod
    fun removeListeners(count: Int) {}
}

private fun dpPx(context: Context, dp: Int): Int {
    return (dp * context.resources.displayMetrics.density).toInt()
}
