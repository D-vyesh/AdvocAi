from rest_framework.decorators import api_view, parser_classes
from rest_framework.response import Response
from django.conf import settings
import json
from rest_framework import status
from rest_framework.parsers import MultiPartParser, FormParser, JSONParser
import cloudinary.uploader

from .utils import get_gemini_response, extract_document_data # Import the utility functions


@api_view(['POST'])
@parser_classes([MultiPartParser, FormParser, JSONParser])
def chat(request):
    """
    API endpoint for the conversational legal document generator.
    """
    messages = request.data.get('messages', [])
    if not messages:
        return Response({'error': 'Messages are required'}, status=400)

    user_message = messages[-1]['text'] # Assuming the last message is the current user input
    document_context = "" # The chat view doesn't inherently have document context, it's built from messages

    try:
        signature_file = request.FILES.get('signature')
        if signature_file:
            try:
                upload_result = cloudinary.uploader.upload(signature_file)
                signature_url = upload_result['secure_url']
                # Append a system message to the user's message
                user_message += f"\n\n(System: The user has uploaded a signature. Please place it in the appropriate section of the document using the following markdown: ![Signature]({signature_url}))"
            except Exception as e:
                return Response({'error': f'Error uploading signature: {e}'}, status=500)

        response_text = get_gemini_response(user_message, document_context)

        print(f"Model response text: {response_text}")

        is_document, document_data, _ = extract_document_data(response_text)
        if is_document:
            return Response(document_data)
        else:
            return Response({'type': 'question', 'text': response_text})

    except Exception as e:
        print(f"Error in chat view: {e}")
        print(f"Type of error: {type(e)}")
        return Response({'error': str(e)}, status=500)
