package com.aitzaz.copipoavatar;

import android.app.Activity;
import android.os.Bundle;
import android.webkit.WebChromeClient;
import android.webkit.WebView;
import android.webkit.WebViewClient;
import android.speech.tts.TextToSpeech;
import android.speech.RecognizerIntent;
import android.content.Intent;
import android.webkit.JavascriptInterface;
import android.widget.Toast;
import java.util.ArrayList;
import java.util.Locale;

public class MainActivity extends Activity implements TextToSpeech.OnInitListener {
    private static final int SPEECH_REQUEST = 1001;
    private WebView webView;
    private TextToSpeech tts;
    private boolean ttsReady = false;

    @Override public void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        tts = new TextToSpeech(this, this);
        webView = new WebView(this);
        webView.getSettings().setJavaScriptEnabled(true);
        webView.getSettings().setDomStorageEnabled(false);
        webView.setWebChromeClient(new WebChromeClient());
        webView.setWebViewClient(new WebViewClient());
        webView.addJavascriptInterface(this, "NativeAvatar");
        setContentView(webView);
        webView.loadUrl("file:///android_asset/index.html");
    }

    @Override public void onInit(int status) {
        if (status == TextToSpeech.SUCCESS) {
            ttsReady = true;
            tts.setLanguage(Locale.US);
            tts.setSpeechRate(0.96f);
        }
    }

    @JavascriptInterface public void speak(String text) {
        if (ttsReady && text != null && text.length() > 0) {
            runOnUiThread(() -> {
                if (android.os.Build.VERSION.SDK_INT >= 21) {
                    tts.speak(text, TextToSpeech.QUEUE_FLUSH, null, "copipo-avatar");
                } else {
                    tts.speak(text, TextToSpeech.QUEUE_FLUSH, null);
                }
            });
        }
    }

    @JavascriptInterface public void listen() {
        runOnUiThread(() -> {
            try {
                Intent intent = new Intent(RecognizerIntent.ACTION_RECOGNIZE_SPEECH);
                intent.putExtra(RecognizerIntent.EXTRA_LANGUAGE_MODEL, RecognizerIntent.LANGUAGE_MODEL_FREE_FORM);
                intent.putExtra(RecognizerIntent.EXTRA_LANGUAGE, "en-US");
                intent.putExtra(RecognizerIntent.EXTRA_PROMPT, "Speak to your AI avatar");
                startActivityForResult(intent, SPEECH_REQUEST);
            } catch (Exception e) {
                Toast.makeText(this, "Speech recognition is not available on this phone.", Toast.LENGTH_LONG).show();
            }
        });
    }

    @Override protected void onActivityResult(int requestCode, int resultCode, Intent data) {
        super.onActivityResult(requestCode, resultCode, data);
        if (requestCode == SPEECH_REQUEST && resultCode == RESULT_OK && data != null) {
            ArrayList<String> results = data.getStringArrayListExtra(RecognizerIntent.EXTRA_RESULTS);
            if (results != null && !results.isEmpty()) {
                String phrase = results.get(0).replace("\\", "\\\\").replace("'", "\\'");
                webView.evaluateJavascript("window.onNativeTranscript('" + phrase + "')", null);
            }
        }
    }

    @Override protected void onDestroy() {
        if (tts != null) { tts.stop(); tts.shutdown(); }
        if (webView != null) webView.destroy();
        super.onDestroy();
    }
}
