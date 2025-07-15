import sounddevice as sd
import soundfile as sf
import tempfile
import os
import base64
import requests
import json

# ========== CONFIG ========== #

SAMPLE_RATE = 16000
RECORD_SECONDS = 4

INFERENCE_API_KEY = "c5YeiDoFMvVx08ZGTBEYggcCFUCAz3fpZL71VBLDX6vAVdHci5ZpsKvLVy0BHY8M"
PIPELINE_ID = "64392f96daac500b55c543cd"
TTS_SERVICE_ID = "ai4bharat/indic-tts-coqui-misc-gpu--t4"  # English supported
STT_SERVICE_ID = "ai4bharat/whisper-medium-en--gpu--t4"     # English whisper model

# ========== AUDIO UTILS ========== #

def speak_text(text, skip_play=False):
    print(f"[AGENT]: {text}")
    if skip_play:
        return
    try:
        payload = {
            "pipelineTasks": [
                {
                    "taskType": "tts",
                    "config": {
                        "language": {"sourceLanguage": "en"},
                        "serviceId": TTS_SERVICE_ID,
                        "gender": "female"
                    }
                }
            ],
            "inputData": {"input": [{"source": text}]},
            "pipelineRequestConfig": {"pipelineId": PIPELINE_ID}
        }
        headers = {"Authorization": INFERENCE_API_KEY, "Content-Type": "application/json"}
        response = requests.post(
            "https://dhruva-api.bhashini.gov.in/services/inference/pipeline",
            headers=headers, json=payload
        )
        audio_b64 = response.json()["pipelineResponse"][0]["audio"][0]["audioContent"]
        audio_data = base64.b64decode(audio_b64)
        with tempfile.NamedTemporaryFile(delete=False, suffix=".wav") as tmp:
            tmp.write(audio_data)
            audio_path = tmp.name
        data, sr = sf.read(audio_path, dtype='float32')
        sd.play(data, sr)
        sd.wait()
        os.remove(audio_path)
    except Exception as e:
        print(f"[TTS ERROR]: {e}")

def record_audio(filename="mic_input.wav", duration=RECORD_SECONDS, fs=SAMPLE_RATE):
    print("🎙️ Listening...")
    try:
        recording = sd.rec(int(duration * fs), samplerate=fs, channels=1, dtype='int16')
        sd.wait()
        sf.write(filename, recording, fs)
    except Exception as e:
        print(f"[Recording Error]: {e}")

def stt_bhashini(audio_path):
    try:
        with open(audio_path, "rb") as f:
            audio_b64 = base64.b64encode(f.read()).decode("utf-8")
        payload = {
            "pipelineTasks": [
                {
                    "taskType": "asr",
                    "config": {
                        "language": {"sourceLanguage": "en"},
                        "serviceId": STT_SERVICE_ID
                    }
                }
            ],
            "inputData": {"audio": [{"audioContent": audio_b64}]},
            "pipelineRequestConfig": {"pipelineId": PIPELINE_ID}
        }
        headers = {"Authorization": INFERENCE_API_KEY, "Content-Type": "application/json"}
        response = requests.post(
            "https://dhruva-api.bhashini.gov.in/services/inference/pipeline",
            headers=headers, json=payload
        )
        data = response.json()
        #print("[DEBUG STT Response]:", json.dumps(data, indent=2))

        if "pipelineResponse" in data:
            output = data["pipelineResponse"][0].get("output", [])
            if output and "source" in output[0]:
                text = output[0]["source"]
                print(f"[USER]: {text}")
                return text

        print("[STT] No valid output from pipeline.")
        speak_text("Sorry, I didn't catch that. Please say it again clearly in English.")
        return ""
    except Exception as e:
        print(f"[STT ERROR]: {e}")
        return ""

# ========== MAIN FUNCTION ========== #

def ask_user(prompt: str):
    speak_text(prompt)
    with tempfile.NamedTemporaryFile(delete=False, suffix=".wav") as tmpfile:
        audio_path = tmpfile.name
    record_audio(audio_path)
    text = stt_bhashini(audio_path)
    try:
        os.remove(audio_path)
    except Exception:
        pass
    return text

# ========== TEST ========== #

if __name__ == "__main__":
    response = ask_user("What would you like to do?")
    print("Recognized:", response)
