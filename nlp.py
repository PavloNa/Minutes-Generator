import whisper
from moviepy import VideoFileClip
import os
from gpt4all import GPT4All
import time
import re
from inspect import currentframe, getframeinfo
import json

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
model = GPT4All("Llama-3.2-3B-Instruct-Q4_0.gguf")

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
    
    with model.chat_session():
        prompt = f"""
        You are an AI assistant that generates meeting minutes from a transcript.
        The minutes should be in the following JSON format:
        {{
            "Summary": "",
            "Attendees": [{{"Name": ""}}],
            "Actions": [{{"Action": "", "Person/Team": ""}}],
            "Agenda": [{{"Topic": "", "Person/Team": ""}}],
            "Decisions": [{{"Decision": "", "Person/Team": ""}}]
        }}
        Make sure not to change the format of the JSON keys only change the values. Don't make it into a list.
        Summary is a short summary of the meeting, attendees are the people who attended the meeting, actions are tasks that need to be done, agenda is the topics discussed in the meeting, and decisions are the decisions made during the meeting.
        Please generate the minutes based on the following transcript:
        {text}
        """        
        log("Generating minutes from the transcript...", get_line())
        start_time = time.time()
        response = model.generate(prompt, max_tokens=1024)
        log("--- Generation took %s seconds ---" % round(time.time() - start_time, 2), get_line())
        log("Minutes generated successfully. Returning response.", get_line())
        return response

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
    response = re.findall(r"```(.*?)```", response, re.DOTALL)
    print(response)
    print(json.loads(response))
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