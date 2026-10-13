package com.najiyashade

import android.content.Intent
import android.os.Bundle
import android.os.Handler
import android.os.Looper
import android.speech.RecognitionListener
import android.speech.RecognizerIntent
import android.speech.SpeechRecognizer
import com.facebook.react.bridge.Arguments
import com.facebook.react.bridge.Promise
import com.facebook.react.bridge.ReactApplicationContext
import com.facebook.react.bridge.ReactContextBaseJavaModule
import com.facebook.react.bridge.ReactMethod
import com.facebook.react.bridge.WritableMap
import com.facebook.react.modules.core.DeviceEventManagerModule
import java.util.Locale

class SpeechRecognizerModule(private val reactContext: ReactApplicationContext) :
    ReactContextBaseJavaModule(reactContext) {

    private var speechRecognizer: SpeechRecognizer? = null
    private val mainHandler = Handler(Looper.getMainLooper())

    override fun getName(): String = "NativeSpeechRecognizer"

    private fun sendEvent(eventName: String, params: WritableMap) {
        if (reactContext.hasActiveReactInstance()) {
            reactContext
                .getJSModule(DeviceEventManagerModule.RCTDeviceEventEmitter::class.java)
                .emit(eventName, params)
        }
    }

    @ReactMethod
    fun startListening(promise: Promise) {
        mainHandler.post {
            try {
                if (!SpeechRecognizer.isRecognitionAvailable(reactContext)) {
                    promise.reject("UNAVAILABLE", "Speech recognition is not available on this device")
                    return@post
                }

                speechRecognizer?.destroy()
                speechRecognizer = SpeechRecognizer.createSpeechRecognizer(reactContext).apply {
                    setRecognitionListener(object : RecognitionListener {
                        override fun onReadyForSpeech(params: Bundle?) {
                            val map = Arguments.createMap().apply { putString("status", "ready") }
                            sendEvent("onSpeechReady", map)
                        }

                        override fun onBeginningOfSpeech() {
                            val map = Arguments.createMap().apply { putString("status", "started") }
                            sendEvent("onSpeechStarted", map)
                        }

                        override fun onRmsChanged(rmsdB: Float) {}
                        override fun onBufferReceived(buffer: ByteArray?) {}
                        override fun onEndOfSpeech() {
                            val map = Arguments.createMap().apply { putString("status", "ended") }
                            sendEvent("onSpeechEnded", map)
                        }

                        override fun onError(error: Int) {
                            val map = Arguments.createMap().apply {
                                putInt("error", error)
                                putString("message", "Speech recognition error code: $error")
                            }
                            sendEvent("onSpeechError", map)
                        }

                        override fun onResults(results: Bundle?) {
                            val matches = results?.getStringArrayList(SpeechRecognizer.RESULTS_RECOGNITION)
                            val recognizedText = matches?.firstOrNull() ?: ""
                            val map = Arguments.createMap().apply {
                                putString("text", recognizedText)
                            }
                            sendEvent("onSpeechResults", map)
                        }

                        override fun onPartialResults(partialResults: Bundle?) {
                            val matches = partialResults?.getStringArrayList(SpeechRecognizer.RESULTS_RECOGNITION)
                            val text = matches?.firstOrNull() ?: ""
                            val map = Arguments.createMap().apply {
                                putString("text", text)
                            }
                            sendEvent("onSpeechPartialResults", map)
                        }

                        override fun onEvent(eventType: Int, params: Bundle?) {}
                    })
                }

                val intent = Intent(RecognizerIntent.ACTION_RECOGNIZE_SPEECH).apply {
                    putExtra(RecognizerIntent.EXTRA_LANGUAGE_MODEL, RecognizerIntent.LANGUAGE_MODEL_FREE_FORM)
                    putExtra(RecognizerIntent.EXTRA_LANGUAGE, Locale.getDefault())
                    putExtra(RecognizerIntent.EXTRA_PARTIAL_RESULTS, true)
                }

                speechRecognizer?.startListening(intent)
                promise.resolve(true)
            } catch (e: Exception) {
                promise.reject("START_ERROR", e.message, e)
            }
        }
    }

    @ReactMethod
    fun stopListening(promise: Promise) {
        mainHandler.post {
            try {
                speechRecognizer?.stopListening()
                promise.resolve(true)
            } catch (e: Exception) {
                promise.reject("STOP_ERROR", e.message, e)
            }
        }
    }

    @ReactMethod
    fun cancelListening(promise: Promise) {
        mainHandler.post {
            try {
                speechRecognizer?.cancel()
                promise.resolve(true)
            } catch (e: Exception) {
                promise.resolve(false)
            }
        }
    }
}
