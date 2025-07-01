from fastapi import FastAPI

app = FastAPI()

@app.get("/")
def read_root():
    return {"Hello": "World"}

@app.get("/proccess_transcript")
def process_transcript():
    print("hello")
    return {"test": "this works!"}
    ...