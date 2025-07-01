from transformers import pipeline
import spacy
import whisper
from moviepy import VideoFileClip
import os

#Models
summarizer = pipeline("summarization", model="sshleifer/distilbart-cnn-12-6")
tokenizer = summarizer.tokenizer
nlp = spacy.load("en_core_web_sm")
model = whisper.load_model("base")
#Variables
action_keywords = ["will", "should", "need to", "have to", "must", "let’s", "I'll", "we'll", "we plan", "we intend"]
decision_keywords = ["decided", "conclude", "finalize", "agreement", "resolution", "we agreed"]
action_items = []
decisions = []

def handle_format(filename: str, file):
    content_type = file.headers['content-type']
    file_location = f"./files/{file.filename}"
    # Save uploaded file temporarily
    with open(file_location, "wb+") as file_object:
        file_object.write(file.file.read())

    if content_type == 'text/plain':
        with open(file_location, 'r', encoding='utf-8') as f:
            return f.read().replace('\n', ' ').strip()

    elif content_type == 'audio/mpeg':
        print(file_location)
        result = model.transcribe(file_location)
        os.remove(file_location)
        return result['text']

    elif content_type in ['video/mpeg', 'video/mp4']:
        video_clip = VideoFileClip(file_location)
        audio_path = file_location + "_audio.mp3"
        video_clip.audio.write_audiofile(audio_path)
        result = model.transcribe(audio_path)
        os.remove(file_location)
        os.remove(audio_path)
        return result['text']

def create_doc(text: str) -> list[str]:
    """
    This function strips the text and makes it into an array of sentences
    """
    doc = nlp(text)
    sentences = [sent.text.strip() for sent in doc.sents]
    return sentences


def open_text():
    """
    This function opens the file, formats it and returns the raw text as a string
    """
    with open('transcript.txt', 'r', encoding="utf-8") as file:
        text = file.read().replace('\n', ' ').strip()
    return text

def main(filename: str, file) -> dict[str, str]:
    #ADD FILE HANDLING
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

if __name__ == "__main__":
    main()