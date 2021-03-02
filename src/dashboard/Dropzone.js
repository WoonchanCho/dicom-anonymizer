import React, { useEffect, useMemo } from 'react';

import { useDropzone } from 'react-dropzone';

const baseStyle = {
  flex: 1,
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  padding: '20px',
  borderWidth: 2,
  borderRadius: 2,
  borderColor: '#eeeeee',
  borderStyle: 'dashed',
  backgroundColor: '#fafafa',
  color: '#bdbdbd',
  outline: 'none',
  transition: 'border .24s ease-in-out',
  margin: '5px',
  cursor: 'pointer',
};

const activeStyle = {
  borderColor: '#2196f3',
};

const acceptStyle = {
  borderColor: '#00e676',
};

const rejectStyle = {
  borderColor: '#ff1744',
};

export default function Dropzone({ onFileSelected }) {
  const {
    getRootProps,
    getInputProps,
    isDragActive,
    isDragAccept,
    isDragReject,
    acceptedFiles,
  } = useDropzone({ accept: '.dcm', maxFiles: 1 });

  const style = useMemo(
    () => ({
      ...baseStyle,
      ...(isDragActive ? activeStyle : {}),
      ...(isDragAccept ? acceptStyle : {}),
      ...(isDragReject ? rejectStyle : {}),
    }),
    [isDragActive, isDragReject, isDragAccept]
  );

  useEffect(() => {
    if (!acceptedFiles.length) {
      return;
    }
    onFileSelected(acceptedFiles[0]);
    // acceptedFiles.forEach(async (file) => {
    //   const buffer = await file.arrayBuffer();
    //   const dicomDict = dcmjs.data.DicomMessage.readFile(buffer);
    //   setDicomDict(dicomDict);
    // });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [acceptedFiles]);

  const acceptedFileItems = acceptedFiles.map((file) => {
    return (
      <div key={file.path}>
        {file.path} - {file.size} bytes
      </div>
    );
  });

  return (
    <div className="container">
      <div {...getRootProps({ style })}>
        <input {...getInputProps()} />
        <p>Drag 'n' drop a dcm file, or click to select a file</p>
        {acceptedFileItems}
      </div>
    </div>
  );
}
