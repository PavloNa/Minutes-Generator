from fastapi import FastAPI, File, UploadFile
from nlp import main

app = FastAPI()

@app.get("/")
def read_root():
    return {"Hello": "World"}

@app.post("/proccess_transcript/")
async def process_transcript(file: UploadFile):
    result = main()
    return result