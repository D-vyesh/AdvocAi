import json
import logging
import os
from django.conf import settings
from utils.gemini_client import (
    get_groq_client,
    get_groq_model_name,
    get_gemini_client,
    _get_llm_model_name
)

logger = logging.getLogger(__name__)


def get_gemini_response(user_message, document_context=""):
    """
    Generates an AI response using the Groq API (with Gemini fallback)
    based on the user message and document context.
    Returns the raw text response from the AI.
    """
    system_instruction_text = """You are a helpful legal assistant. Your goal is to help the user create a legal document.
- First, ask follow-up questions to gather all the necessary details.
- When you have enough information, generate the full legal document.
- The document **must** be in well-structured **Markdown format**. This includes:
    - **Document Title:** The main title of the document (`# Document Title`) should be at the very top, centered implicitly by markdown rendering, and clearly state the document's purpose.
    - **Headings:** Use clear and hierarchical headings (`#`, `##`, `###`) for sections and sub-sections.
    - **Lists:** Use unordered (`*` or `-`) and ordered (`1.`) lists where appropriate.
    - **Emphasis:** Use bold (`**text**`) for important terms and italics (`*text*`) for emphasis.
    - **Section Separation:** Use two newlines between sections to ensure clear visual separation.
    - **Placeholders:** For any information not provided by the user, use clear, descriptive placeholders in `[CAPITALIZED_SNAKE_CASE]` format (e.g., `[PARTY 1 NAME]`, `[EFFECTIVE DATE]`, `[AMOUNT IN WORDS]`).
- When you are ready to generate the document, output it as pure JSON enclosed in a code block like this:
```json
{"type": "document", "text": "...your Markdown document here..."}
```
Do NOT include any extra notes, commentary, or text inside or after the JSON code block.
- If the user asks to update some information, you must look for the previous document you generated in the conversation history. You will use that document as the basis for your new version.
- You must then regenerate the **entire** document, incorporating the user's requested changes, and provide it again in the same JSON format. Do not just provide the updated line or a confirmation message.
- **Signature Handling:** If the user uploads a signature, you will see a system message like `(System: The user has uploaded a signature...)` with a URL. When you generate the document, you **must** include this signature at the appropriate signature lines using the provided URL in the correct markdown format: `![Signature]({signature_url})`. **Do NOT acknowledge the system message about the signature upload in your conversational response.**
"""
    
    full_user_message = user_message
    if document_context:
        full_user_message = f"Current document content:\n```markdown\n{document_context}\n```\n\nUser request: {user_message}"

    # 1. Try Groq first (Preferred: ultra-fast, high limits, no quota errors)
    groq_client = get_groq_client()
    if groq_client:
        try:
            model_name = get_groq_model_name()
            logger.info(f"Generating legal document with Groq model '{model_name}'")
            chat_completion = groq_client.chat.completions.create(
                model=model_name,
                messages=[
                    {"role": "system", "content": system_instruction_text},
                    {"role": "user", "content": full_user_message}
                ],
                temperature=0.7,
                max_tokens=3500,
            )
            response_text = chat_completion.choices[0].message.content
            if response_text:
                return response_text
        except Exception as groq_err:
            logger.warning(f"Groq generation failed ({groq_err}), falling back to Gemini if available...")

    # 2. Fallback to Gemini if Groq is not available or failed
    try:
        gemini_client_instance = get_gemini_client()
        if not gemini_client_instance:
            raise ValueError("No LLM provider available (Groq failed and Gemini not configured).")

        gemini_conversation_history = [
            {"role": "user", "parts": [{"text": system_instruction_text + "\n\n" + full_user_message}]}
        ]

        chat_completion = gemini_client_instance.GenerativeModel(_get_llm_model_name()).generate_content(
            gemini_conversation_history,
            generation_config=gemini_client_instance.types.GenerationConfig(
                temperature=0.7,
                max_output_tokens=2500,
            ),
            safety_settings=[
                {"category": "HARM_CATEGORY_HARASSMENT", "threshold": "BLOCK_NONE"},
                {"category": "HARM_CATEGORY_HATE_SPEECH", "threshold": "BLOCK_NONE"},
                {"category": "HARM_CATEGORY_SEXUALLY_EXPLICIT", "threshold": "BLOCK_NONE"},
                {"category": "HARM_CATEGORY_DANGEROUS_CONTENT", "threshold": "BLOCK_NONE"},
            ]
        )
        return chat_completion.candidates[0].content.parts[0].text

    except Exception as e:
        error_name = type(e).__name__
        logger.error(f"Error in LLM generation ({error_name}): {e}")
        if 'ResourceExhausted' in error_name or '429' in str(e):
            return json.dumps({
                "type": "error",
                "text": "The AI service is temporarily rate-limited. Please try again in a few moments."
            })
        return json.dumps({
            "type": "error",
            "text": "An unexpected error occurred while communicating with the AI. Please try again."
        })


def extract_document_data(response_text: str):
    """
    Safely extracts document JSON and markdown content from an AI response.
    Tolerates extra commentary, notes, trailing text, or unescaped characters.
    Returns: (is_document: bool, document_data: dict, text_content: str)
    """
    if not response_text:
        return False, {}, ""

    raw = response_text.strip()
    candidate = raw

    # 1. If wrapped in markdown code blocks, extract inner content
    if '```json' in raw:
        parts = raw.split('```json', 1)[1]
        candidate = parts.split('```', 1)[0].strip() if '```' in parts else parts.strip()
    elif '```' in raw:
        parts = raw.split('```', 1)[1]
        candidate = parts.split('```', 1)[0].strip() if '```' in parts else parts.strip()

    # 2. Find opening brace '{'
    start_brace = candidate.find('{')
    if start_brace != -1:
        json_candidate = candidate[start_brace:]

        # Strategy A: raw_decode (ignores extra trailing text/commentary)
        try:
            decoder = json.JSONDecoder(strict=False)
            data, _ = decoder.raw_decode(json_candidate)
            if isinstance(data, dict) and (data.get('type') == 'document' or 'text' in data):
                return True, data, data.get('text', '')
        except Exception:
            pass

        # Strategy B: standard json.loads with relaxed parsing
        try:
            data = json.loads(json_candidate, strict=False)
            if isinstance(data, dict) and (data.get('type') == 'document' or 'text' in data):
                return True, data, data.get('text', '')
        except Exception:
            pass

        # Strategy C: Slice up to matching closing brace '}'
        last_brace = json_candidate.rfind('}')
        if last_brace != -1 and last_brace > 0:
            try:
                data = json.loads(json_candidate[:last_brace + 1], strict=False)
                if isinstance(data, dict) and (data.get('type') == 'document' or 'text' in data):
                    return True, data, data.get('text', '')
            except Exception:
                pass

    # Not a document JSON: treat as conversational question or response
    return False, {'type': 'question', 'text': raw}, raw
