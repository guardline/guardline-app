package dev.ehan.guardline

import android.app.Notification
import android.app.NotificationChannel
import android.app.NotificationManager
import android.app.Service
import android.content.Intent
import android.media.AudioFormat
import android.media.AudioRecord
import android.media.MediaRecorder
import android.os.Build
import android.os.IBinder
import android.util.Base64
import androidx.core.app.NotificationCompat
import kotlin.concurrent.thread

class ScamForegroundService : Service() {

    private var isRecording = false
    private var recorder: AudioRecord? = null
    private var recordingThread: Thread? = null

    override fun onCreate() {
        super.onCreate()
        createNotificationChannel()
    }

    override fun onStartCommand(intent: Intent?, flags: Int, startId: Int): Int {
        when (intent?.action) {
            "START_RECORDING" -> {
                val notification = buildNotification()
                startForeground(1, notification)
                startRecording()
            }
            "STOP_RECORDING" -> {
                stopRecording()
                stopSelf()
            }
        }
        return START_STICKY
    }

    private fun startRecording() {
        if (isRecording) return
        isRecording = true

        val sampleRate = 16000
        val bufferSize = AudioRecord.getMinBufferSize(
            sampleRate,
            AudioFormat.CHANNEL_IN_MONO,
            AudioFormat.ENCODING_PCM_16BIT
        )

        recorder = AudioRecord(
            MediaRecorder.AudioSource.MIC,
            sampleRate,
            AudioFormat.CHANNEL_IN_MONO,
            AudioFormat.ENCODING_PCM_16BIT,
            bufferSize
        )

        recorder?.startRecording()

        recordingThread = thread {
            val buffer = ByteArray(bufferSize)
            while (isRecording && recorder?.recordingState == AudioRecord.RECORDSTATE_RECORDING) {
                val bytesRead = recorder?.read(buffer, 0, buffer.size) ?: 0
                if (bytesRead > 0) {
                    val chunk = ByteArray(bytesRead)
                    System.arraycopy(buffer, 0, chunk, 0, bytesRead)
                    val base64Chunk = Base64.encodeToString(chunk, Base64.NO_WRAP)
                    AudioModule.sendAudioChunk(base64Chunk)
                }
            }
        }
    }

    private fun stopRecording() {
        isRecording = false
        try {
            recorder?.stop()
            recorder?.release()
        } catch (_: Exception) {}
        recorder = null
        recordingThread = null
    }

    private fun createNotificationChannel() {
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
            val channel = NotificationChannel(
                CHANNEL_ID,
                "Call Recording",
                NotificationManager.IMPORTANCE_LOW
            )
            val manager = getSystemService(NotificationManager::class.java)
            manager.createNotificationChannel(channel)
        }
    }

    private fun buildNotification(): Notification {
        return NotificationCompat.Builder(this, CHANNEL_ID)
            .setContentTitle("GuardLine")
            .setContentText("Monitoring call for scams...")
            .setSmallIcon(android.R.drawable.ic_media_play)
            .setPriority(NotificationCompat.PRIORITY_LOW)
            .build()
    }

    override fun onBind(intent: Intent?): IBinder? = null

    override fun onDestroy() {
        stopRecording()
        super.onDestroy()
    }

    companion object {
        private const val CHANNEL_ID = "scam_call_recording"
    }
}
