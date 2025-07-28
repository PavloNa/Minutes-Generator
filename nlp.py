from sympy import content
import whisper
from moviepy import VideoFileClip
import os
import time
import re
from inspect import currentframe, getframeinfo
import json
import openai

openai.api_key = os.getenv("OPENAI_API_KEY")

class bcolors:
    HEADER = '\033[95m'
    OKBLUE = '\033[94m'
    OKCYAN = '\033[96m'
    OKGREEN = '\033[92m'
    WARNING = '\033[93m'
    FAIL = '\033[91m'
    ENDC = '\033[0m'
    BOLD = '\033[1m'
    UNDERLINE = '\033[4m'

#Models
model = whisper.load_model("tiny")

#Variables
frameinfo = getframeinfo(currentframe())
current_filename = frameinfo.filename.split('\\')[-1]

#Log functions  
def get_line():
    cf = currentframe()
    return cf.f_back.f_lineno

def log(message, line):
    """
    This function logs the message with the current filename and line number.
    :param message: The message to log.
    """
    print(f"{bcolors.OKBLUE}LOGGER: {message}    ----- File: {current_filename}, Line: {line} -----{bcolors.ENDC}")

def handle_format(file):
    """
    This function handles the file format and returns the text content.
    It supports text files, audio files, and video files.
    :param file: The uploaded file object.
    :return: The text content extracted from the file.
    """
    log("Handling file format...", get_line())
    content_type = file.headers['content-type']
    file_location = f"./files/{file.filename}"
    # Save uploaded file temporarily
    with open(file_location, "wb+") as file_object:
        # Read the file in chunks to avoid memory issues
        file_object.write(file.file.read())

    if content_type == 'text/plain':
        log("Detected text file", get_line())
        with open(file_location, 'r', encoding='utf-8') as f:
            text = f.read().replace('\n', ' ').strip()
        os.remove(file_location)
        return text

    elif content_type == 'audio/mpeg':
        log("Detected audio file", get_line())
        result = model.transcribe(file_location)
        os.remove(file_location)
        return result['text']

    elif content_type in ['video/mpeg', 'video/mp4']:
        log("Detected video file", get_line())
        video_clip = VideoFileClip(file_location)
        audio_path = file_location + "_audio.mp3"
        video_clip.audio.write_audiofile(audio_path)
        result = model.transcribe(audio_path)
        os.remove(file_location)
        os.remove(audio_path)
        return result['text']

def generate_minutes(text: str) -> dict[str, str]:
    """
    This function generates minutes from the given text using a language model.
    It returns a dictionary with summary, action items, and decisions.
    :param text: The text content from which to generate minutes.
    :return: A dictionary containing the generated minutes.
    """
    log(f"Transcript length: {len(text.split())} words", get_line())
    
    desired_format = '''
    {
    "Summary": "",
    "Attendees": [{"Name": ""}],
    "Actions": [{"Action": "", "Person/Team": ""}],
    "Agenda": [{"Topic": "", "Person/Team": ""}],
    "Decisions": [{"Decision": "", "Person/Team": ""}]
    }
    '''

    transcript = text


    prompt = f"""
    You are a meeting minutes generator. From the transcript below, extract the following fields and respond strictly in this JSON format:

    {desired_format}

    - "Attendees" must be a list of objects with a single "Name" string each.
    - "Person/Team" must always be a single string, not a list.
    - Include all keys even if values are empty.
    - Do NOT explain anything, only return the raw JSON.

    Transcript:
    \"\"\"
    {transcript}
    \"\"\"
    """
    log("Generating minutes from the transcript...", get_line())
    start_time = time.time()
    response = openai.ChatCompletion.create(
        model="gpt-4",  # or "gpt-3.5-turbo"
        messages=[{"role": "user", "content": prompt}],
        temperature=0.2,
    )
    content = response["choices"][0]["message"]["content"]
    log("--- Generation took %s seconds ---" % round(time.time() - start_time, 2), get_line())
    log("Minutes generated successfully. Returning response.", get_line())

    try:
        minutes = json.loads(content)
        print(json.dumps(minutes, indent=2))
        return minutes
    except json.JSONDecodeError:
        print("Raw output (not valid JSON):\n", content)
        return {"error": "Invalid JSON response from the model."}


def open_text():
    """
    This function opens the file, formats it and returns the raw text as a string
    :return: The formatted text from the transcript file.
    """
    with open('transcript.txt', 'r', encoding="utf-8") as file:
        text = file.read().replace('\n', ' ').strip()
    return text

def main(file) -> dict[str, str]:
    #ADD FILE HANDLING
    text = handle_format(file=file)
    response = generate_minutes(text)
    try:
        response = json.loads(response)
    except json.JSONDecodeError:
        log("Failed to decode JSON response. Returning raw response.", get_line())
        # If the response is not valid JSON, return it as is
        return {"error": "Invalid JSON response from the model."}
    return response

if __name__ == "__main__":
    main()


"""
EXTRA OLD CODE:

    text = handle_format(filename=filename, file=file)
    text = " ".join(create_doc(text))
    tokens = tokenizer(text, return_tensors="pt", truncation=True, max_length=1024)
    truncated_text = tokenizer.decode(tokens["input_ids"][0], skip_special_tokens=True)
    summary = summarizer(truncated_text, max_length=int(len(text.split())/2) if int(len(text.split())/2) < 1000 else 1000, min_length=25, do_sample=False)[0]['summary_text']
    if summary[0] == " ":
        summary=summary[1:]
    for sent in text.split("."):
        s_lower = sent.lower()
        if any(k in s_lower for k in decision_keywords):
            if sent[0] == " ":
                sent=sent[1:]
            decisions.append(sent + ".")
        elif any(k in s_lower for k in action_keywords):
            if sent[0] == " ":
                sent=sent[1:]
            action_items.append(sent + ".")
    return {
        "summary" : summary,
        "action_items" : action_items,
        "decisions" : decisions
    }
"""