import React, { useState, useCallback } from 'react';
import axios from 'axios';
import { useDropzone } from 'react-dropzone';
import { Button, Paper, Typography } from '@mui/material';
import { UploadCloud } from 'react-feather'; // Importing the UploadCloud icon

const VerifyForm = () => {
  const [verificationResult, setVerificationResult] = useState(null);
  const [file, setFile] = useState(null);

  const onDrop = useCallback((acceptedFiles) => {
    setFile(acceptedFiles[0]);
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({ onDrop });

  const handleVerify = async () => {
    try {
      const formData = new FormData();
      formData.append('image', file);

      const response = await axios.post('http://localhost:8080/verify_data_matrix', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      setVerificationResult(response.data);
    } catch (error) {
      console.error('Error during verification:', error.message);
    }
  };

  return (
    <Paper elevation={3} style={{ padding: '20px', maxWidth: '400px', margin: 'auto', marginTop: '50px' }}>
      <Typography variant="h5" gutterBottom>
        2D Code Verifier
      </Typography>
      <div {...getRootProps()} style={dropzoneStyles(isDragActive)}>
        <input {...getInputProps()} />
        <p>Drag & drop an image here, or click to select one.</p>
        <UploadCloud style={{ fontSize: '48px', color: '#757575' }} />
      </div>
      {file && (
        <Typography variant="body2" color="textSecondary" style={{ marginTop: '10px' }}>
          Selected File: {file.name}
        </Typography>
      )}
      <Button variant="contained" color="primary" onClick={handleVerify} style={{ marginTop: '20px' }}>
        Verify
      </Button>
      {verificationResult && (
        <div style={{ marginTop: '20px' }}>
          <Typography variant="body1">
            Verification Result: {verificationResult.verification_result.toString()}
          </Typography>
          {verificationResult.verification_result && (
            <div>
              <Typography variant="body1">Overall Grade: {verificationResult.overall_grade}</Typography>
              <Typography variant="body1">Decoded Data: {verificationResult.decoded_data}</Typography>
            </div>
          )}
        </div>
      )}
    </Paper>
  );
};

const dropzoneStyles = (isDragActive) => ({
  border: `2px dashed ${isDragActive ? '#388e3c' : '#757575'}`,
  borderRadius: '4px',
  padding: '20px',
  textAlign: 'center',
  cursor: 'pointer',
});

export default VerifyForm;
