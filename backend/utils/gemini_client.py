import google.generativeai as genai
from django.conf import settings
import os

def get_gemini_client():
    # Setup gemini client
    api_key = getattr(settings, 'GEMINI_API_KEY', os.environ.get('GEMINI_API_KEY'))
    if api_key:
        genai.configure(api_key=api_key)
    return genai

def _get_llm_model_name():
    return os.environ.get('GEMINI_MODEL', 'gemini-2.5-flash')
