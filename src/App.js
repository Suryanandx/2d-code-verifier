import React, { useState } from "react";
import {
  Button,
  Container,
  Paper,
  Typography,
  Table,
  TableContainer,
  TableHead,
  TableBody,
  TableRow,
  TableCell,
} from "@mui/material";
import axios from "axios";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  LineChart,
  Line,
} from "recharts";

function App() {
  const [image, setImage] = useState(null);
  const [results, setResults] = useState({});
  const [verificationGrade, setVerificationGrade] = useState(null);

  const handleFileChange = (e) => {
    setImage(e.target.files[0]);
  };

  const handleAnalysis = async () => {
    if (image) {
      const formData = new FormData();
      formData.append("file", image);

      try {
        const response = await axios.post("http://localhost:8080/upload-image", formData, {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        });
        setResults(response.data);
        setVerificationGrade(response.data.verification_grade);
      } catch (error) {
        console.error("Error analyzing image:", error);
      }
    }
  };

  const renderAnalysisResults = () => (
    <div style={{ marginTop: "20px" }}>
      <Typography variant="h5" gutterBottom>
        Analysis Results
      </Typography>
      <TableContainer>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Parameter</TableCell>
              <TableCell>Score</TableCell>
              <TableCell>Grade</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {Object.entries(results).map(([key, value]) => key !== "scan_line" && (
              <TableRow key={key}>
                <TableCell>{key}</TableCell>
                <TableCell>{value}</TableCell>
                <TableCell style={{ color: value >= 80 ? "green" : "red" }}>{getGrade(value)}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
      {verificationGrade && (
        <div style={{ marginTop: "20px" }}>
          <Typography variant="h5" gutterBottom>
            Verification Grade
          </Typography>
          <Typography variant="h4" style={{ color: verificationGrade >= 80 ? "green" : "red" }}>
            {getGrade(verificationGrade)}
          </Typography>
        </div>
      )}
    </div>
  );

  return (
    <Container component="main" maxWidth="md" style={{ textAlign: "center", marginTop: "50px" }}>
      <Paper elevation={3} style={{ padding: "20px" }}>
        <Typography variant="h4" gutterBottom>
          2D Code Analyzer Report
        </Typography>
        <Typography variant="body1" paragraph>
          Welcome to the 2D Code Analyzer! This report provides a detailed analysis of the uploaded image.
        </Typography>
        <input
          type="file"
          accept="image/*"
          style={{ display: "none" }}
          id="image-upload"
          onChange={handleFileChange}
        />
        <label htmlFor="image-upload">
          <Button variant="outlined" component="span" style={{ marginTop: "20px" }}>
            Upload Image
          </Button>
        </label>
        <Button
          variant="contained"
          color="primary"
          onClick={handleAnalysis}
          style={{ marginLeft: "10px", marginTop: "20px" }}
        >
          Analyze Image
        </Button>
        {image && (
          <div style={{ marginTop: "20px" }}>
            <Typography variant="h5" gutterBottom>
              Image Preview
            </Typography>
            <img src={URL.createObjectURL(image)} alt="Uploaded" style={{ maxWidth: "100%" }} />
          </div>
        )}
        {Object.keys(results).length > 0 && renderAnalysisResults()}
        {results.scan_line && (
          <div style={{ marginTop: "20px" }}>
            <Typography variant="h5" gutterBottom>
              Scan Line
            </Typography>
            {/* Display your scan line data here */}
            <LineChart width={400} height={200} data={results.scan_line}>
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Line type="monotone" dataKey="value" stroke="#8884d8" />
            </LineChart>
          </div>
        )}
        {(results.modulation || results.axial_non_uniformity || results.grid_non_uniformity) && (
          <div style={{ marginTop: "20px" }}>
            <Typography variant="h5" gutterBottom>
              Combined Metrics
            </Typography>
            {/* Display your combined metrics data here */}
            <BarChart width={600} height={300} data={[
              { name: "Modulation", value: results.modulation },
              { name: "Axial Non Uniformity", value: results.axial_non_uniformity },
              { name: "Grid Non Uniformity", value: results.grid_non_uniformity },
            ]}>
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar dataKey="value" fill="#8884d8" />
            </BarChart>
          </div>
        )}
        <Typography variant="body1" paragraph>
          <strong>Modulation:</strong> Measure of signal quality. Formula: (Modulation Value / Maximum Modulation) * 100
        </Typography>
        <Typography variant="body1" paragraph>
          <strong>Axial Non Uniformity:</strong> Measure of variation along the axis. Formula: (Axial Non Uniformity Value / Maximum Axial Non Uniformity) * 100
        </Typography>
        <Typography variant="body1" paragraph>
          <strong>Grid Non Uniformity:</strong> Measure of variation in the grid. Formula: (Grid Non Uniformity Value / Maximum Grid Non Uniformity) * 100
        </Typography>
        <Typography variant="body1" paragraph>
          <strong>Scan Line:</strong> Represents the scan line process over time.
        </Typography>
      </Paper>
    </Container>
  );
}

function getGrade(score) {
  if (score >= 90) return "A";
  if (score >= 80) return "B";
  if (score >= 70) return "C";
  if (score >= 60) return "D";
  return "F";
}

export default App;