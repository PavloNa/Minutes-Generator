import React from 'react';
import './Upload.css';

const UPLOAD_ENDPOINT = "http://127.0.0.1:8000/proccess_transcript/";

const Upload = () => {
  return (
    <>
        <div className='upload-div'>
            <button id='big-upload'>Upload</button>
            <p>Or</p>
            <button id='record'>Record</button>
        </div>
    </>
);
};

export default Upload;