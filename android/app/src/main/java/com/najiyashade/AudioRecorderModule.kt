package com.najiyashade

import android.media.MediaRecorder
import android.os.Build
import com.facebook.react.bridge.Promise
import com.facebook.react.bridge.ReactApplicationContext
import com.facebook.react.bridge.ReactContextBaseJavaModule
import com.facebook.react.bridge.ReactMethod
import java.io.File

class AudioRecorderModule(private val reactContext: ReactApplicationContext) :
    ReactContextBaseJavaModule(reactContext) {

    private var mediaRecorder: MediaRecorder? = null
    private var currentRecordingFile: File? = null

    override fun getName(): String {
        return "AudioRecorder"
    }

    @ReactMethod
    fun startRecording(promise: Promise) {
        try {
            if (mediaRecorder != null) {
                try {
                    mediaRecorder?.stop()
                    mediaRecorder?.release()
                } catch (_: Exception) {}
                mediaRecorder = null
            }

            val cacheDir = reactContext.cacheDir
            val fileName = "voice_memo_${System.currentTimeMillis()}.m4a"
            val file = File(cacheDir, fileName)
            currentRecordingFile = file

            val recorder = if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.S) {
                MediaRecorder(reactContext)
            } else {
                @Suppress("DEPRECATION")
                MediaRecorder()
            }

            recorder.apply {
                setAudioSource(MediaRecorder.AudioSource.MIC)
                setOutputFormat(MediaRecorder.OutputFormat.MPEG_4)
                setAudioEncoder(MediaRecorder.AudioEncoder.AAC)
                setAudioEncodingBitRate(128000)
                setAudioSamplingRate(44100)
                setOutputFile(file.absolutePath)
                prepare()
                start()
            }

            mediaRecorder = recorder
            promise.resolve(file.absolutePath)
        } catch (e: Exception) {
            mediaRecorder?.release()
            mediaRecorder = null
            promise.reject("RECORD_ERROR", e.message, e)
        }
    }

    @ReactMethod
    fun stopRecording(promise: Promise) {
        try {
            val recorder = mediaRecorder
            if (recorder == null) {
                promise.reject("NOT_RECORDING", "No active recording session")
                return
            }

            recorder.stop()
            recorder.release()
            mediaRecorder = null

            val path = currentRecordingFile?.absolutePath
            if (path != null && File(path).exists()) {
                promise.resolve(path)
            } else {
                promise.reject("FILE_NOT_FOUND", "Recorded audio file not found")
            }
        } catch (e: Exception) {
            mediaRecorder?.release()
            mediaRecorder = null
            promise.reject("STOP_ERROR", e.message, e)
        }
    }

    @ReactMethod
    fun cancelRecording(promise: Promise) {
        try {
            mediaRecorder?.apply {
                try {
                    stop()
                } catch (_: Exception) {}
                release()
            }
            mediaRecorder = null

            currentRecordingFile?.let {
                if (it.exists()) {
                    it.delete()
                }
            }
            currentRecordingFile = null
            promise.resolve(true)
        } catch (e: Exception) {
            mediaRecorder?.release()
            mediaRecorder = null
            promise.resolve(false)
        }
    }
}
