import google.generativeai as genai

genai.configure(api_key="Google_api_key")

model = genai.GenerativeModel("gemini-2.0-flash")  # or "gemini-1.5-flash"
response = model.generate_content("Hello Gemini")
print(response.text)
