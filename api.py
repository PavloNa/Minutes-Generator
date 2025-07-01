from fastapi import FastAPI, File, UploadFile
from nlp import main

app = FastAPI()

@app.get("/")
def read_root():
    return {"Hello": "World"}

@app.post("/proccess_transcript/")
async def process_transcript(file: UploadFile):
    if file.headers['content-type'] not in ['audio/mpeg', 'text/plain', 'video/mpeg', 'video/mp4']:
        return {"msg": "File format not authorised."}
    result = main(file=file)
    return result 