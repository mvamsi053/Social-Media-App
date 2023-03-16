import React, { useRef, useState, useEffect } from "react";

import Button from "./Button";

import "./ImageUpload.css";

function ImageUpload(props) {
  const [file, setFile] = useState();
  const [previewUrl, setPreviewUrl] = useState();
  const [isValid, setIsValid] = useState(false);
  const filePicerRef = useRef();
  console.log("file", file);
  console.log("prev", previewUrl);
  useEffect(() => {
    if (!file) {
      return;
    }
    const fileReader = new FileReader();
    fileReader.onload = () => {
      setPreviewUrl(fileReader.result);
    };
    fileReader.readAsDataURL(file);
  }, [file]);
  const pickedHandler = (event) => {
    let pickedFile;
    let fileIsValid = isValid;
    if (event.target.files && event.target.files.length === 1) {
      pickedFile = event.target.files[0];
      setFile(pickedFile);
      setIsValid(true);
      fileIsValid = true;
    } else {
      setIsValid(false);
      fileIsValid = false;
    }
    props.onInput(props.id, pickedFile, fileIsValid);
  };
  const pickImageHandler = () => {
    filePicerRef.current.click();
  };
  return (
    <div className="form-control">
      <input
        type="file"
        id={props.id}
        style={{ display: "none" }}
        accept=".jpg,.png,.jpeg"
        ref={filePicerRef}
        onChange={pickedHandler}
      />
      <div className={`image-upload ${props.center && "center"}`}>
        {previewUrl && (
          <div className="image-upload__preview ">
            <img src={previewUrl} alt="preview" />
          </div>
        )}
        <Button type="button" onClick={pickImageHandler}>
          PICK IMAGE
        </Button>
      </div>
      {!isValid && <p>{props.errorText}</p>}
    </div>
  );
}

export default ImageUpload;
