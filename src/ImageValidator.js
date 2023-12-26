import React, { useRef, useState, useEffect } from "react";
import  html2canvas  from "html2canvas";
import  { jsPDF }  from "jspdf";
import {
  Button,
  Typography,
  IconButton,
  CircularProgress,
  Paper,
  TableCell,
  TableContainer,
  Table,
  TableHead,
  TableRow,
  TableBody,
  Tab,
  Tabs,
  Box,
} from "@mui/material";
import { Download, Upload } from "react-feather";
import { Bar } from "react-chartjs-2";
import { useDropzone } from "react-dropzone";
import Chart from 'chart.js/auto';

// ... (imports remain the same)

const ImageValidator = () => {
  const divToPrintRef = useRef(null);
  const chart15415Ref = useRef(null);
  const chart15416Ref = useRef(null);
  const chartCombinedRef = useRef(null);
  const [uploadedImage, setUploadedImage] = useState(null);
  const [analysisResults15415, setAnalysisResults15415] = useState([]);
  const [analysisResults15416, setAnalysisResults15416] = useState([]);
  const [combinedResults, setCombinedResults] = useState([]);
  const [activeTab, setActiveTab] = useState(0);
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  const onDrop = (acceptedFiles) => {
    const file = acceptedFiles[0];

    if (file) {
      setUploadedImage(file);
      setAnalysisResults15415([]);
      setAnalysisResults15416([]);
      setCombinedResults([]);
      setIsAnalyzing(true);

      // Simulate API requests for analysis
      Promise.all([simulateAnalysis15415(), simulateAnalysis15416()])
        .then(([results15415, results15416]) => {
          setAnalysisResults15415(results15415);
          setAnalysisResults15416(results15416);
        })
        .finally(() => setIsAnalyzing(false));
    }
  };

  const simulateAnalysis15415 = async () => {
    // Simulated analysis results for ISO/IEC 15415
    return [
      { label: "Symbol Contrast", pass: false, score: 76 },
      { label: "Modulation", pass: true, score: 85 },
      { label: "Fixed Pattern Damage", pass: false, score: 3 },
      { label: "Axial Non-uniformity", pass: false, score: 64 },
      { label: "Grid Non-uniformity", pass: true, score: 68 },
    ];
  };

  const simulateAnalysis15416 = async () => {
    // Simulated analysis results for ISO/IEC 15416
    return [
      { label: "Minimum Reflectance", pass: false, score: 88 },
      { label: "Edge Contrast", pass: true, score: 85 },
      { label: "Modulation", pass: false, score: 72 },
      { label: "Decode", pass: false, score: 65 },
      { label: "Defects", pass: true, score: 90 },
      { label: "Decodability", pass: true, score: 99 },
    ];
  };

  // const renderChart = (chartRef, data, label) => {
  //   if (chartRef.current) {
  //     const ctx = chartRef.current.chartInstance;
  //     ctx.data.labels = data.map(({ label }) => label);
  //     ctx.data.datasets[0].data = data.map(({ score }) => score);
  //     ctx.data.datasets[0].backgroundColor = data.map((score) =>
  //       score >= 80 ? "#7752FE" : "#C70039"
  //     );
  //     ctx.update();
  //   }
  // };

  useEffect(() => {
    // Combine the results for the combined tab
    const allLabels = new Set([
      ...analysisResults15415.map(({ label }) => label),
      ...analysisResults15416.map(({ label }) => label),
    ]);
  
    const combinedResults = Array.from(allLabels).map((label) => {
      const result15415 = analysisResults15415.find((result) => result.label === label);
      const result15416 = analysisResults15416.find((result) => result.label === label);
  
      return {
        label,
        pass15415: result15415?.pass || false,
        score15415: result15415?.score || 0,
        pass15416: result15416?.pass || false,
        score15416: result15416?.score || 0,
      };
    });
  
    setCombinedResults(combinedResults);
  }, [analysisResults15415, analysisResults15416]);

  const { getRootProps, getInputProps } = useDropzone({ onDrop });

  const printDocument = () => {
    const input = divToPrintRef.current;
  
    if (input) {
      html2canvas(input).then((canvas) => {
        const imgData = canvas.toDataURL('image/png');
        const pdf = new jsPDF({
          unit: 'mm',
          format: 'a4',
          orientation: 'portrait',
        });
  
        pdf.addImage(imgData, 'JPEG', 0, 0, pdf.internal.pageSize.getWidth(), pdf.internal.pageSize.getHeight());
        pdf.save('d2d_verificatyion.pdf');
      });
    }
  };

  const handleTabChange = (_, newValue) => {
    setActiveTab(newValue);
  };

  const tips = [
    "Adjust the lighting conditions for better results.",
    "Use high-quality images for analysis.",
    "Check for image distortions before analysis.",
    "Ensure a clear focus on the 2D code.",
    "Minimize background noise in the image.",
  ];

  return (
    <div
      style={{ display: "flex", flexDirection: "column", alignItems: "center" }}
    >
      <Tabs
        value={activeTab}
        onChange={handleTabChange}
        style={{ width: "80%", marginBottom: "20px" }}
      >
        <Tab label="ISO/IEC 15415" />
        <Tab label="ISO/IEC 15416" />
        <Tab label="Combined Results" />
      </Tabs>

      <div
        {...getRootProps()}
        style={{
          border: "2px dashed #ccc",
          borderRadius: "4px",
          padding: "20px",
          cursor: "pointer",
          width: "80%",
        }}
      >
        <input {...getInputProps()} />
        <Typography variant="h6" component="p">
          Drag & drop an image file here, or click to select one
        </Typography>
      </div>

      <div style={{ width: "80%", marginTop: "20px" }}>
        <TabPanel value={activeTab} index={0}>
          {uploadedImage && (
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
              }}
            >
              <Typography variant="h4" style={{ marginBottom: "10px" }}>
                2D Code Analysis : ISO/IEC 15415
              </Typography>
              <Bar
                data={{
                  labels: analysisResults15415.map(({ label }) => label),
                  datasets: [
                    {
                      label: "Scores",
                      data: analysisResults15415.map(({ score }) => score),
                      backgroundColor: analysisResults15415.map((score) =>
                        score >= 80 ? "#7752FE" : "#C70039"
                      ),
                    },
                  ],
                }}
                ref={chart15415Ref}
                options={{
    indexAxis: "x", // Use "x" for horizontal bar charts
  }}
              />
              <Typography variant="h5">Grade: B</Typography>
              <img
                src={URL.createObjectURL(uploadedImage)}
                alt="Uploaded"
                style={{
                  maxWidth: "100%",
                  maxHeight: "300px",
                  marginTop: "20px",
                }}
              />
            </div>
          )}
          {isAnalyzing && <CircularProgress style={{ marginTop: "20px" }} />}
          {analysisResults15415.length > 0 && (
            <div style={{ width: "100%", marginTop: "20px" }}>
              <Typography variant="h6">Analysis Results:</Typography>
              <TableContainer component={Paper}>
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell>Label</TableCell>
                      <TableCell>Result</TableCell>
                      <TableCell>Score</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {analysisResults15415.map(
                      ({ label, pass, score }, index) => (
                        <TableRow
                          key={index}
                          style={{ color: pass ? "green" : "red" }}
                        >
                          <TableCell>{label}</TableCell>
                          <TableCell>{pass ? "Pass" : "Fail"}</TableCell>
                          <TableCell>{score}</TableCell>
                        </TableRow>
                      )
                    )}
                  </TableBody>
                </Table>
              </TableContainer>
            </div>
          )}
        </TabPanel>

        <TabPanel value={activeTab} index={1}>
          {uploadedImage && (
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
              }}
            >
              <Typography variant="h4" style={{ marginBottom: "10px" }}>
                2D Code Analysis : ISO/IEC 15416
              </Typography>
              <Bar
  data={{
    labels: analysisResults15416.map(({ label }) => label),
    datasets: [
      {
        label: 'Scores',
        data: analysisResults15416.map(({ score }) => score),
        backgroundColor: analysisResults15416.map((score) =>
          score >= 80 ? '#3366FF' : '#FF5733'
        ), // Updated colors
      },
    ],
  }}
  ref={chart15416Ref}
  options={{
    indexAxis: 'x',
    scales: {
      x: {
        grid: {
          display: false,
        },
      },
      y: {
        grid: {
          color: 'rgba(0, 0, 0, 0.1)',
        },
      },
    },
  }}
/>
              <Typography variant="h5">Grade: B</Typography>
              <img
                src={URL.createObjectURL(uploadedImage)}
                alt="Uploaded"
                style={{
                  maxWidth: "100%",
                  maxHeight: "300px",
                  marginTop: "20px",
                }}
              />
            </div>
          )}
          {isAnalyzing && <CircularProgress style={{ marginTop: "20px" }} />}
          {analysisResults15416.length > 0 && (
            <div style={{ width: "100%", marginTop: "20px" }}>
              <Typography variant="h6">Analysis Results:</Typography>
              <TableContainer component={Paper}>
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell>Label</TableCell>
                      <TableCell>Result</TableCell>
                      <TableCell>Score</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {analysisResults15416.map(
                      ({ label, pass, score }, index) => (
                        <TableRow
                          key={index}
                          style={{ color: pass ? "green" : "red" }}
                        >
                          <TableCell>{label}</TableCell>
                          <TableCell>{pass ? "Pass" : "Fail"}</TableCell>
                          <TableCell>{score}</TableCell>
                        </TableRow>
                      )
                    )}
                  </TableBody>
                </Table>
              </TableContainer>
            </div>
          )}
        </TabPanel>

        <TabPanel value={activeTab} index={2}>
          {combinedResults.length > 0 && (
            <div refr={divToPrintRef} style={{ width: "100%", marginTop: "20px" }}>
              <Typography variant="h6">Combined Results:</Typography>
              {/* <img
                src={URL.createObjectURL(uploadedImage)}
                alt="Uploaded"
                style={{
                  maxWidth: "100%",
                  maxHeight: "300px",
                  marginTop: "20px",
                }}
              /> */}
              <Bar
            data={{
              labels: combinedResults.map(({ label }) => label),
              datasets: [
                {
                  label: "Scores",
                  data: combinedResults.map(({ score15415, score15416 }) =>
                    Math.max(score15415, score15416)
                  ),
                  backgroundColor: combinedResults.map(({ score15415, score15416}) => (score15415 >= 80 || score15416 >= 80 ? "#7752FE" : "#C70039")),
                }],
            }}
            ref={chartCombinedRef}
            options={{
    indexAxis: "x", // Use "x" for horizontal bar charts
  }}
          />
          <br/>
              <TableContainer component={Paper}>
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell>Label</TableCell>
                      <TableCell>Result ISO/IEC 15415</TableCell>
                      <TableCell>Score ISO/IEC 15415</TableCell>
                      <TableCell>Result ISO/IEC 15416</TableCell>
                      <TableCell>Score ISO/IEC 15416</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {combinedResults.map(
                      (
                        { label, pass15415, score15415, pass15416, score15416 },
                        index
                      ) => (
                        <TableRow key={index}>
                          <TableCell>{label}</TableCell>
                          <TableCell
                            style={{ color: pass15415 ? "green" : "red" }}
                          >
                            {pass15415 ? "Pass" : "Fail"}
                          </TableCell>
                          <TableCell>{score15415}</TableCell>
                          <TableCell
                            style={{ color: pass15416 ? "green" : "red" }}
                          >
                            {pass15416 ? "Pass" : "Fail"}
                          </TableCell>
                          <TableCell>{score15416}</TableCell>
                        </TableRow>
                      )
                    )}
                  </TableBody>
                </Table>
              </TableContainer>
            </div>
          )}
       
        </TabPanel>
      </div>

      <div
        style={{
          marginTop: "20px",
          width: "80%",
          display: "flex",
          justifyContent: "flex-end",
        }}
      >
        <Button
          variant="outlined"
          endIcon={<Download />}
          onClick={printDocument}
        >
          Download Report
        </Button>
      </div>

      <div
        ref={divToPrintRef}
        style={{ display: "none", flexDirection: "column", alignItems: "center" }}
      >
        {uploadedImage && (
          <div style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
            <Typography variant="h4">2D Code Analysis: ISO/IEC 15415</Typography>
            <Bar
              data={{
                labels: analysisResults15415.map(({ label }) => label),
                datasets: [
                  {
                    label: "Scores",
                    data: analysisResults15415.map(({ score }) => score),
                    backgroundColor: analysisResults15415.map((score) =>
                      score >= 80 ? "#7752FE" : "#C70039"
                    ),
                  },
                ],
              }}
              ref={chart15415Ref}
              options={{
    indexAxis: "x", // Use "x" for horizontal bar charts
  }}
            />
            <Typography variant="h5">Grade: B</Typography>
            <img
              src={URL.createObjectURL(uploadedImage)}
              alt="Uploaded"
              style={{ maxWidth: "100%", maxHeight: "300px", marginTop: "20px" }}
            />
          </div>
        )}

        {uploadedImage && (
          <div style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
            <Typography variant="h4">2D Code Analysis: ISO/IEC 15416</Typography>
            <Bar
              data={{
                labels: analysisResults15416.map(({ label }) => label),
                datasets: [
                  {
                    label: "Scores",
                    data: analysisResults15416.map(({ score }) => score),
                    backgroundColor: analysisResults15416.map((score) =>
                      score >= 80 ? "#7752FE" : "#C70039"
                    ),
                  },
                ],
              }}
              ref={chart15416Ref}
              options={{
    indexAxis: "x", // Use "x" for horizontal bar charts
  }}
            />
            <Typography variant="h5">Grade: B</Typography>
            <img
              src={URL.createObjectURL(uploadedImage)}
              alt="Uploaded"
              style={{ maxWidth: "100%", maxHeight: "300px", marginTop: "20px" }}
            />
          </div>
        )}

        {combinedResults.length > 0 && (
          <div style={{ width: "100%", marginTop: "20px" }}>
            <Typography variant="h4">Combined Results</Typography>
            <TableContainer component={Paper}>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Label</TableCell>
                    <TableCell>Result ISO/IEC 15415</TableCell>
                    <TableCell>Score ISO/IEC 15415</TableCell>
                    <TableCell>Result ISO/IEC 15416</TableCell>
                    <TableCell>Score ISO/IEC 15416</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {combinedResults.map(
                    ({ label, pass15415, score15415, pass15416, score15416 }, index) => (
                      <TableRow key={index}>
                        <TableCell>{label}</TableCell>
                        <TableCell style={{ color: pass15415 ? "green" : "red" }}>
                          {pass15415 ? "Pass" : "Fail"}
                        </TableCell>
                        <TableCell>{score15415}</TableCell>
                        <TableCell style={{ color: pass15416 ? "green" : "red" }}>
                          {pass15416 ? "Pass" : "Fail"}
                        </TableCell>
                        <TableCell>{score15416}</TableCell>
                      </TableRow>
                    )
                  )}
                </TableBody>
              </Table>
            </TableContainer>
          </div>
        )}
      </div>
    </div>
  );
};

export default ImageValidator;

function TabPanel(props) {
  const { children, value, index, ...other } = props;

  return (
    <div role="tabpanel" hidden={value !== index} {...other}>
      {value === index && <Box p={3}>{children}</Box>}
    </div>
  );
}


