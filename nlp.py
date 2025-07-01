from transformers import pipeline
import spacy

summarizer = pipeline("summarization", model="sshleifer/distilbart-cnn-12-6")
nlp = spacy.load("en_core_web_sm")
action_keywords = ["will", "should", "need to", "have to", "must", "let’s", "I'll", "we'll", "we plan", "we intend"]
decision_keywords = ["decided", "conclude", "finalize", "agreement", "resolution", "we agreed"]
action_items = []
decisions = []

def handle_format(filname: str, file):
    ...

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
    text = open_text() #REMOVE THIS AFTER EXTRACTING TEXT
    text = " ".join(create_doc(text))
    summary = summarizer(text, max_length=int(len(text.split())/2), min_length=25, do_sample=False)[0]['summary_text']
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