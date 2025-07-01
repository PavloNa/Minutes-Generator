from fastapi import FastAPI
from nlp import main

app = FastAPI()

@app.get("/")
def read_root():
    return {"Hello": "World"}

@app.get("/proccess_transcript")
def process_transcript():
    result = main()
    return result