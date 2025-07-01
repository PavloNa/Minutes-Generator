from transformers import pipeline
import spacy

summarizer = pipeline("summarization", model="sshleifer/distilbart-cnn-12-6")
nlp = spacy.load("en_core_web_sm")
action_keywords = ["will", "should", "need to", "have to", "must", "let’s", "I'll", "we'll", "we plan", "we intend"]
decision_keywords = ["decided", "conclude", "finalize", "agreement", "resolution", "we agreed"]
action_items = []
decisions = []

def create_doc(text):
    doc = nlp(text)
    sentences = [sent.text.strip() for sent in doc.sents]
    return sentences


def open_text():
    with open('transcript.txt', 'r', encoding="utf-8") as file:
        text = file.read().replace('\n', ' ').strip()
    return text

def main():
    text = open_text()
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