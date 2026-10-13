package com.najiyashade

import android.speech.tts.TextToSpeech
import android.speech.tts.UtteranceProgressListener
import com.facebook.react.bridge.Arguments
import com.facebook.react.bridge.Promise
import com.facebook.react.bridge.ReactApplicationContext
import com.facebook.react.bridge.ReactContextBaseJavaModule
import com.facebook.react.bridge.ReactMethod
import com.facebook.react.modules.core.DeviceEventManagerModule
import java.util.Locale

class TextToSpeechModule(private val reactContext: ReactApplicationContext) :
    ReactContextBaseJavaModule(reactContext), TextToSpeech.OnInitListener {

    private var tts: TextToSpeech? = null
    private var isInitialized = false

    override fun getName(): String = "NativeTextToSpeech"

    init {
        tts = TextToSpeech(reactContext, this)
    }

    override fun onInit(status: Int) {
        if (status == TextToSpeech.SUCCESS) {
            tts?.language = Locale.US
            tts?.setOnUtteranceProgressListener(object : UtteranceProgressListener() {
                override fun onStart(utteranceId: String?) {
                    sendEvent("onTtsStart", utteranceId)
                }

                override fun onDone(utteranceId: String?) {
                    sendEvent("onTtsDone", utteranceId)
                }

                @Deprecated("Deprecated in Java")
                override fun onError(utteranceId: String?) {
                    sendEvent("onTtsError", utteranceId)
                }
            })
            isInitialized = true
        }
    }

    private fun sendEvent(eventName: String, utteranceId: String?) {
        val params = Arguments.createMap().apply {
            putString("utteranceId", utteranceId ?: "")
        }
        if (reactContext.hasActiveReactInstance()) {
            reactContext
                .getJSModule(DeviceEventManagerModule.RCTDeviceEventEmitter::class.java)
                .emit(eventName, params)
        }
    }

    @ReactMethod
    fun speak(text: String, utteranceId: String, promise: Promise) {
        if (!isInitialized || tts == null) {
            promise.reject("NOT_INITIALIZED", "Text to Speech engine not ready")
            return
        }
        try {
            val result = tts?.speak(text, TextToSpeech.QUEUE_FLUSH, null, utteranceId)
            if (result == TextToSpeech.SUCCESS) {
                promise.resolve(true)
            } else {
                promise.reject("SPEAK_ERROR", "Failed to synthesize speech")
            }
        } catch (e: Exception) {
            promise.reject("SPEAK_ERROR", e.message, e)
        }
    }

    @ReactMethod
    fun stop(promise: Promise) {
        try {
            tts?.stop()
            promise.resolve(true)
        } catch (e: Exception) {
            promise.reject("STOP_ERROR", e.message, e)
        }
    }

    @ReactMethod
    fun isSpeaking(promise: Promise) {
        promise.resolve(tts?.isSpeaking ?: false)
    }
}
