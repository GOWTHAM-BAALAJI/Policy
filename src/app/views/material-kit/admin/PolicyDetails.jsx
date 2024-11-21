import React, { useState, useEffect } from "react";
import { Box, Button, Card, Grid, MenuItem, Paper, Select, Table, styled, TableRow, TableBody, TableCell, TableContainer, Typography } from "@mui/material";
import { jwtDecode } from "jwt-decode";
import { useLocation, useParams } from "react-router-dom";
import { useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import img1 from "../../../assets/download_file_icon.png";
import useCustomFetch from "../../../hooks/useFetchWithAuth";
import { useMediaQuery } from '@mui/material';

const ContentBox = styled("div")(({ theme }) => ({
  margin: "15px",
  [theme.breakpoints.down("sm")]: { margin: "16px" }
}));

const StyledSelect = styled(Select)(() => ({
  width: "100%",
  height: "30px",
  fontFamily: "sans-serif",
  fontSize: "0.875rem",
  "& .MuiInputBase-root": {
    height: "30px",
    alignItems: "center",
    fontFamily: "sans-serif",
    fontSize: "1.10rem"
  },
  "& .MuiInputLabel-root": {
    lineHeight: "30px",
    top: "40",
    transform: "none",
    left: "20px",
    fontFamily: "sans-serif",
    fontSize: "0.875rem"
  },
  "& .MuiInputLabel-shrink": {
    top: "-6px"
  }
}));

export default function PolicyDetails() {
  const navigate = useNavigate();
  const { id } = useParams();
  const location = useLocation();
  const customFetchWithAuth=useCustomFetch();
  const { title, status, activeTab } = location.state || {};

  const getDisplayPolicyId = (policy_id) => {
    return "PL" + String(policy_id).padStart(7, "0");
  };

  const isXs = useMediaQuery((theme) => theme.breakpoints.down('sm'));
  const isMd = useMediaQuery((theme) => theme.breakpoints.down('md'));

  const [userId, setUserId] = useState(null);
  const [roleId, setRoleId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedDocument, setSelectedDocument] = useState(null);
  const [documentID, setDocumentID] = useState(selectedDocument?.id || "");
  const [documentStatus, setDocumentStatus] = useState(null);
  const [documentType, setDocumentType] = useState(null);

  const userToken = useSelector((state) => {
    return state.token;
  });

  useEffect(() => {
    if (selectedDocument) {
      setDocumentID(selectedDocument.id || "");
      setDocumentType(selectedDocument.type || null);
    }
  }, [selectedDocument]);

  const [decision, setDecision] = useState("");
  const [documentDecision, setDocumentDecision] = useState("");

  const latestPolicyStatus = selectedDocument?.Policy_status?.filter(
    (status) => status.decision !== 0
  ).sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt))[0];

  const latestPolicyLogEntry = selectedDocument?.Policy_status_log?.find(
    (log) =>
      log.approver_id === latestPolicyStatus?.approver_id &&
      log.activity === latestPolicyStatus?.decision
  );

  const latest_remarks = latestPolicyLogEntry && latestPolicyLogEntry.approver_id === latestPolicyStatus?.approver_id ? latestPolicyLogEntry.remarks.split(":")[1] : null;
  const rejected_by = latestPolicyLogEntry && (latestPolicyLogEntry.approver_id == latestPolicyStatus?.approver_id) ? latestPolicyStatus.approver_details.emp_name : null;

  useEffect(() => {
    if (selectedDocument && selectedDocument?.status !== undefined) {
      setDocumentStatus(selectedDocument?.status);
    }
  }, [selectedDocument?.status]);

  useEffect(() => {
      if (documentStatus === 1) {
          setDecision("activate");
          setDocumentDecision("activate");
      } else if (documentStatus === 3) {
          setDecision("deprecate");
          setDocumentDecision("deprecate");
      }
  }, [documentStatus]);

  const handleDecisionChange = (event) => {
    setDecision(event.target.value);
  };

  useEffect(() => {
    fetchDocumentDetails(id);
  }, [id]);

  useEffect(() => {
    if (userToken) {
      const decodedToken = jwtDecode(userToken);
      if (decodedToken.role_id) {
        setRoleId(decodedToken.role_id);
      }
      if (decodedToken.user_id) {
        setUserId(decodedToken.user_id);
      }
    }
  }, [userToken, roleId, userId]);

  const fetchDocumentDetails = async (documentId) => {
    setLoading(true);
    setError(null);
    try {
      const response = await customFetchWithAuth(`https://policyuat.spandanasphoorty.com/policy_apis/policy/${documentId}`,"GET",1,{});
      const data = await response.json();
      setSelectedDocument(data.data);
    } catch (err) {
      setError("Failed to fetch document details.");
    } finally {
      setLoading(false);
    }
  };

  const handleBackClick = () => {
    navigate(-1);
  };

  const [isBtnDisabled, setIsBtnDisabled] = useState(false);

  const handleSubmit = async (event) => {
    event.preventDefault();
    setLoading(true);
    setIsBtnDisabled(true);
    const url = documentDecision == "activate" ? "https://policyuat.spandanasphoorty.com/policy_apis/admin/depricate-policy" : "https://policyuat.spandanasphoorty.com/policy_apis/admin/reactivate-policy";
    const formData = {
        id: documentID
    }
    const submitForm = customFetchWithAuth(url,"POST",2,JSON.stringify(formData))
      .then((response) => {
        if (!response.ok) {
          throw new Error(`Error: ${response.statusText}`);
        }
        return response.json();
      })
      .then((data) => {
        if (data.status) {
          setTimeout(() => {
            navigate("/admin");
          }, 1000);
        } else {
          throw new Error("Submission failed");
        }
        setLoading(false);
      })
      .catch((error) => {
        console.error("Submission error:", error);
        setIsBtnDisabled(false);
        setLoading(false);
        throw error;
      });
      if(documentDecision == "activate"){
        toast.promise(submitForm, {
        loading: "Updating...",
        success: (data) => documentType == 1 ? `Policy deprecated successfully` : documentType == 2 ? `SOP deprecated successfully` : `Guidance Note deprecated successfully`, // Adjust based on your API response
        error: (err) => `Error while deprecating the policy`
        });
      } else if(documentDecision == "deprecate"){
        toast.promise(submitForm, {
        loading: "Updating...",
        success: (data) => documentType == 1 ? `Policy activated successfully` : documentType == 2 ? `SOP activated successfully` : `Guidance Note activated successfully`, // Adjust based on your API response
        error: (err) => `Error while activating the policy`
        });
      }
  };

  const [remarksArray, setRemarksArray] = useState([]);
  const [groupedFiles, setGroupedFiles] = useState([]);
  const [groupedFiles1, setGroupedFiles1] = useState([]);
  useEffect(() => {
    let tempArray = []
    if (selectedDocument) {
      selectedDocument.Policy_status_log.forEach((item) => {
        if (item.version != selectedDocument.version && item.activity == 2) {
          tempArray.push(`${item.remarks.split(":")[1]}`)
        }
      })
    }
    setRemarksArray(tempArray);
  }, [selectedDocument]);

  useEffect(()=>{
    if(selectedDocument){
      const files_arranged = selectedDocument.policy_files
        .filter(file => file.version !== selectedDocument.version && file.type === 2)
        .reduce((acc, file) => {
          if (!acc[file.version]) {
            acc[file.version] = [];
          }
          acc[file.version].push(file);
          return acc;
      }, {});
      setGroupedFiles(files_arranged);
      const files_arranged1 = selectedDocument.policy_files
        .filter(file => file.version !== selectedDocument.version && file.type === 1)
        .reduce((acc, file) => {
          if (!acc[file.version]) {
            acc[file.version] = [];
          }
          acc[file.version].push(file);
          return acc;
      }, {});
      setGroupedFiles1(files_arranged1);
    }
  },[selectedDocument]);

  return (
    <ContentBox className="analytics">
      <Card sx={{ px: 3, py: 3, height: "100%", width: "100%" }}>
        <Grid container>
          <Grid item xs={12} display="flex" justifyContent="flex-end">
            <Button variant="contained" onClick={handleBackClick} sx={{ marginRight: 2, marginTop: 2, height: "28px", backgroundColor: "#ee8812", "&:hover": { backgroundColor: "rgb(249, 83, 22)" } }}>
              Back
            </Button>
          </Grid>
        </Grid>
        <Grid container spacing={2} alignItems="flex-start">
          <Grid item lg={6} md={12} sm={12} xs={12} sx={{ fontFamily: "sans-serif", fontSize: "0.875 rem", marginLeft: {lg:2, md: 2, sm: 1, xs: 1}, marginTop: 2, marginRight: {lg:2, md: 2, sm: -1, xs: -2}, paddingRight: "16px" }}>
            <Typography variant="h5" sx={{ fontFamily: "sans-serif", fontSize: "1.4rem", fontWeight: "bold", marginBottom: 2, marginTop: -2, marginRight: 2 }}>
              Document Details:
            </Typography>
            {selectedDocument && (
              <>
                <TableContainer component={Paper} sx={{ marginLeft: "0" }}>
                  <Table aria-label="data table">
                    <TableBody>
                      <TableRow>
                        <TableCell sx={{ pl: 2, width: { lg: "30%", md: "28%", sm: "20%", xs: "40%" }, verticalAlign: "top" }}>
                          <b>Document ID:</b>
                        </TableCell>
                        <TableCell sx={{ pl: 2, width: { lg: "70%", md: "72%", sm: "80%", xs: "60%" }, verticalAlign: "top" }}>
                          {getDisplayPolicyId(selectedDocument.id)}
                        </TableCell>
                      </TableRow>
                      <TableRow>
                        <TableCell sx={{ pl: 2, width: { lg: "30%", md: "28%", sm: "20%", xs: "40%" }, verticalAlign: "top" }}>
                          <b>Document Title:</b>
                        </TableCell>
                        <TableCell sx={{ pl: 2, width: { lg: "70%", md: "72%", sm: "80%", xs: "60%" }, verticalAlign: "top" }}>{selectedDocument.title}</TableCell>
                      </TableRow>
                      <TableRow>
                        <TableCell sx={{ pl: 2, width: { lg: "30%", md: "28%", sm: "20%", xs: "40%" }, verticalAlign: "top" }}>
                          <b>Document Description:</b>
                        </TableCell>
                        <TableCell sx={{ pl: 2, width: { lg: "70%", md: "72%", sm: "80%", xs: "60%" }, verticalAlign: "top" }}>{selectedDocument.description}</TableCell>
                      </TableRow>
                      {roleId !== 16 && (
                        <>
                          <TableRow>
                            <TableCell sx={{ pl: 2, width: { lg: "30%", md: "28%", sm: "20%", xs: "40%" }, verticalAlign: "top" }}>
                              <b>Initiator Name:</b>
                            </TableCell>
                            <TableCell sx={{ pl: 2, width: { lg: "70%", md: "72%", sm: "80%", xs: "60%" }, verticalAlign: "top" }}>
                              {selectedDocument.initiator_details?.emp_name}
                            </TableCell>
                          </TableRow>
                          <TableRow>
                            <TableCell sx={{ pl: 2, width: { lg: "30%", md: "28%", sm: "20%", xs: "40%" }, verticalAlign: "top" }}>
                              <b>Reviewer Name:</b>
                            </TableCell>
                            <TableCell sx={{ pl: 2, width: { lg: "70%", md: "72%", sm: "80%", xs: "60%" }, verticalAlign: "top" }}>
                              {selectedDocument.reviwer_details?.emp_name}
                            </TableCell>
                          </TableRow>
                          {selectedDocument.Policy_status.slice(2).map((approver, index) => (
                            <TableRow key={approver.approver_id}>
                              <TableCell sx={{ pl: 2, width: { lg: "30%", md: "28%", sm: "20%", xs: "40%" }, verticalAlign: "top" }}>
                                <b>Approver-{index + 1} Name:</b>
                              </TableCell>
                              <TableCell sx={{ pl: 2, width: { lg: "70%", md: "72%", sm: "80%", xs: "60%" }, verticalAlign: "top" }}>
                                {approver.approver_details?.emp_name}
                              </TableCell>
                            </TableRow>
                          ))}
                          <TableRow>
                            <TableCell sx={{ pl: 2, width: { lg: "30%", md: "28%", sm: "20%", xs: "40%" }, verticalAlign: "top" }}>
                              <b>Current Version:</b>
                            </TableCell>
                            <TableCell sx={{ pl: 2, width: { lg: "70%", md: "72%", sm: "80%", xs: "60%" }, verticalAlign: "top" }}>{selectedDocument.version}</TableCell>
                          </TableRow>
                        </>
                      )}
                      <TableRow>
                        <TableCell sx={{ pl: 2, width: { lg: "30%", md: "28%", sm: "20%", xs: "40%" }, verticalAlign: "top" }}>
                          <b>Status: </b>
                        </TableCell>
                        <TableCell sx={{ pl: 2, width: { lg: "70%", md: "72%", sm: "80%", xs: "60%" }, verticalAlign: "top" }}>
                          {{ 0: "In Review", 1: "Approved", 2: "Rejected", 3: "Deprecated" }[selectedDocument.status] || "Unknown"}
                        </TableCell>
                      </TableRow>
                      {selectedDocument.status == 2 && (
                      <TableRow>
                        <TableCell sx={{ pl: 2, width: { lg: "30%", md: "28%", sm: "20%", xs: "40%" }, verticalAlign: "top" }}>
                          <b>Rejected by: </b>
                        </TableCell>
                        <TableCell sx={{ pl: 2, width: { lg: "70%", md: "72%", sm: "80%", xs: "60%" }, verticalAlign: "top" }}>
                          {rejected_by}
                        </TableCell>
                      </TableRow>
                      )}
                      {selectedDocument.status == 0 ? (
                        <>
                          <TableRow>
                            <TableCell sx={{ pt: 3, pl: 2, verticalAlign: "top" }}>
                              <b>Files</b>
                            </TableCell>
                            <TableCell sx={{ pl: 2, verticalAlign: "top" }}>
                              {selectedDocument.version === "1.0" && selectedDocument.pending_at_id === selectedDocument.initiator_id && (
                                <>
                                  <Typography sx={{ marginBottom: 2, textDecoration: "underline" }}>
                                    <b>Files sent for review :</b>
                                  </Typography>
                                  <div style={{ overflowX: 'auto', width: '100%' }}>
                                  <table style={{ minWidth: isXs ? "200%" : isMd ? "150%" : "100%", borderCollapse: "collapse", marginBottom: "20px" }}>
                                    <thead>
                                      <tr>
                                        <th style={{ width: "15%", borderBottom: "1px solid #ddd", padding: "8px", textAlign: "left" }}> S.no </th>
                                        <th style={{ width: "20%", borderBottom: "1px solid #ddd", padding: "8px", textAlign: "left" }}> File </th>
                                        <th style={{ width: "20%", borderBottom: "1px solid #ddd", padding: "8px", textAlign: "left" }}> Version </th>
                                        <th style={{ width: "25%", borderBottom: "1px solid #ddd", padding: "8px", textAlign: "left" }}> Uploaded On </th>
                                      </tr>
                                    </thead>
                                    <tbody>
                                      {selectedDocument.policy_files .filter((file) => file.version === selectedDocument.version && file.type === 2).map((file, index) => (
                                          <tr key={index}>
                                            <td style={{ width: "15%", padding: "8px", borderBottom: "1px solid #ddd" }}> {index + 1} </td>
                                            <td style={{ width: "20%", padding: "8px", borderBottom: "1px solid #ddd" }}>
                                              <a href={`https://policyuat.spandanasphoorty.com/policy_apis/policy_document/${file.file_name}`} target="_blank" rel="noopener noreferrer" download style={{ cursor: "pointer" }}>
                                                <div className="img-wrapper">
                                                  <Box sx={{ width: {lg:"45%", md:"65%", sm:"45%", xs:"65%"}, ml:{sm:-1, xs:-1} }}>
                                                    <img src={img1} style={{ width: "100%", height: "auto" }} alt="" />
                                                  </Box>
                                                </div>
                                              </a>
                                            </td>
                                            <td style={{ width: "20%", padding: "8px", borderBottom: "1px solid #ddd" }}> {file.version} </td>
                                            <td style={{ width: "25%", padding: "8px", borderBottom: "1px solid #ddd" }}> {new Date(file.createdAt).toLocaleDateString( "en-GB" )} </td>
                                          </tr>
                                        ))}
                                    </tbody>
                                  </table>
                                  </div>
                                </>
                              )}
                              {selectedDocument.version === "1.0" && (
                                <>
                                  <Typography sx={{ marginBottom: 2, textDecoration: "underline" }}>
                                    <b>Files uploaded by initiator :</b>
                                  </Typography>
                                  <div style={{ overflowX: 'auto', width: '100%' }}>
                                  <table style={{ minWidth: isXs ? "200%" : isMd ? "150%" : "100%", borderCollapse: "collapse", marginBottom: "20px" }}>
                                    <thead>
                                      <tr>
                                        <th style={{ width: "15%", borderBottom: "1px solid #ddd", padding: "8px", textAlign: "left" }}> S.no </th>
                                        <th style={{ width: "20%", borderBottom: "1px solid #ddd", padding: "8px", textAlign: "left" }}> File </th>
                                        <th style={{ width: "20%", borderBottom: "1px solid #ddd", padding: "8px", textAlign: "left" }}> Version </th>
                                        <th style={{ width: "25%", borderBottom: "1px solid #ddd", padding: "8px", textAlign: "left" }}> Uploaded On </th>
                                      </tr>
                                    </thead>
                                    <tbody>
                                      {selectedDocument.policy_files.filter((file) => file.version === selectedDocument.version && file.type === 1).map((file, index) => (
                                          <tr key={index}>
                                            <td style={{ width: "15%", padding: "8px", borderBottom: "1px solid #ddd" }}> {index + 1} </td>
                                            <td style={{ width: "20%", padding: "8px", borderBottom: "1px solid #ddd" }}>
                                              <a href={`https://policyuat.spandanasphoorty.com/policy_apis/policy_document/${file.file_name}`} target="_blank" rel="noopener noreferrer" download style={{ cursor: "pointer" }}>
                                                <div className="img-wrapper">
                                                  <Box sx={{ width: {lg:"45%", md:"65%", sm:"45%", xs:"65%"}, ml:{sm:-1, xs:-1} }}>
                                                    <img src={img1} style={{ width: "100%", height: "auto" }} alt="" />
                                                  </Box>
                                                </div>
                                              </a>
                                            </td>
                                            <td style={{ width: "20%", padding: "8px", borderBottom: "1px solid #ddd" }}> {file.version} </td>
                                            <td style={{ width: "25%", padding: "8px", borderBottom: "1px solid #ddd" }}> {new Date(file.createdAt).toLocaleDateString("en-GB")} </td>
                                          </tr>
                                        ))}
                                    </tbody>
                                  </table>
                                  </div>
                                </>
                              )}
                              {selectedDocument.version !== "1.0" && selectedDocument.pending_at_id === selectedDocument.initiator_id && (
                                <>
                                  <Typography sx={{ marginBottom: 2, textDecoration: "underline" }}>
                                    <b>Latest files sent for review :</b>
                                  </Typography>
                                  <Typography sx={{ marginBottom: 2 }}>
                                    <b>Remarks :</b> <em>{latest_remarks}</em>
                                  </Typography>
                                  <div style={{ overflowX: 'auto', width: '100%' }}>
                                  <table
                                    style={{ minWidth: isXs ? "200%" : isMd ? "150%" : "100%", borderCollapse: "collapse", marginBottom: "20px" }}>
                                    <thead>
                                      <tr>
                                        <th style={{ width: "15%", borderBottom: "1px solid #ddd", padding: "8px", textAlign: "left" }}> S.no </th>
                                        <th style={{ width: "20%", borderBottom: "1px solid #ddd", padding: "8px", textAlign: "left" }}> File </th>
                                        <th style={{ width: "20%", borderBottom: "1px solid #ddd", padding: "8px", textAlign: "left" }}> Version </th>
                                        <th style={{ width: "25%", borderBottom: "1px solid #ddd", padding: "8px", textAlign: "left" }}> Uploaded On </th>
                                      </tr>
                                    </thead>
                                    <tbody>
                                      {selectedDocument.policy_files.filter((file) => file.version === selectedDocument.version && file.type === 2).map((file, index) => (
                                          <tr key={index}>
                                            <td style={{ width: "15%", padding: "8px", borderBottom: "1px solid #ddd" }}> {index + 1} </td>
                                            <td style={{ width: "20%", padding: "8px", borderBottom: "1px solid #ddd" }}>
                                              <a href={`https://policyuat.spandanasphoorty.com/policy_apis/policy_document/${file.file_name}`} target="_blank" rel="noopener noreferrer" download style={{ cursor: "pointer" }}>
                                                <div className="img-wrapper">
                                                  <Box sx={{ width: {lg:"45%", md:"65%", sm:"45%", xs:"65%"}, ml:{sm:-1, xs:-1} }}>
                                                    <img src={img1} style={{ width: "100%", height: "auto" }} alt="" />
                                                  </Box>
                                                </div>
                                              </a>
                                            </td>
                                            <td style={{ width: "20%", padding: "8px", borderBottom: "1px solid #ddd" }}> {file.version} </td>
                                            <td style={{ width: "25%", padding: "8px", borderBottom: "1px solid #ddd" }}> {new Date(file.createdAt).toLocaleDateString( "en-GB" )} </td>
                                          </tr>
                                        ))}
                                    </tbody>
                                  </table>
                                  </div>
                                </>
                              )}
                              {selectedDocument.version !== "1.0" && (
                                <>
                                  <Typography sx={{ marginBottom: 2, marginTop: 2, textDecoration: "underline" }}>
                                    <b>Latest files uploaded by the initiator :</b>
                                  </Typography>
                                  <div style={{ overflowX: 'auto', width: '100%' }}>
                                  <table style={{ minWidth: isXs ? "200%" : isMd ? "150%" : "100%", borderCollapse: "collapse", marginBottom: "20px" }}>
                                    <thead>
                                      <tr>
                                        <th style={{ width: "15%", borderBottom: "1px solid #ddd", padding: "8px", textAlign: "left" }}> S.no </th>
                                        <th style={{ width: "20%", borderBottom: "1px solid #ddd", padding: "8px", textAlign: "left" }}> File </th>
                                        <th style={{ width: "20%", borderBottom: "1px solid #ddd", padding: "8px", textAlign: "left" }}> Version </th>
                                        <th style={{ width: "25%", borderBottom: "1px solid #ddd", padding: "8px", textAlign: "left" }}> Uploaded On </th>
                                      </tr>
                                    </thead>
                                    <tbody>
                                      {selectedDocument.policy_files.filter((file) => file.version === selectedDocument.version && file.type === 1).map((file, index) => (
                                          <tr key={index}>
                                            <td style={{ width: "15%", padding: "8px", borderBottom: "1px solid #ddd" }}> {index + 1} </td>
                                            <td style={{ width: "20%", padding: "8px", borderBottom: "1px solid #ddd" }}>
                                              <a href={`https://policyuat.spandanasphoorty.com/policy_apis/policy_document/${file.file_name}`} target="_blank" rel="noopener noreferrer" download style={{ cursor: "pointer" }}>
                                                <div className="img-wrapper">
                                                  <Box sx={{ width: {lg:"45%", md:"65%", sm:"45%", xs:"65%"}, ml:{sm:-1, xs:-1} }}>
                                                    <img src={img1} style={{ width: "100%", height: "auto" }} alt="" />
                                                  </Box>
                                                </div>
                                              </a>
                                            </td>
                                            <td style={{ width: "20%", padding: "8px", borderBottom: "1px solid #ddd" }}> {file.version} </td>
                                            <td style={{ width: "25%", padding: "8px", borderBottom: "1px solid #ddd" }}> {new Date(file.createdAt).toLocaleDateString("en-GB")} </td>
                                          </tr>
                                        ))}
                                    </tbody>
                                  </table>
                                  </div>
                                </>
                              )}
                              {selectedDocument.version !== "1.0" && (
                                <>
                                  <Typography sx={{ marginBottom: 2, textDecoration: "underline" }}>
                                    <b>Previous files sent for review :</b>
                                  </Typography>
                                  {Object.keys(groupedFiles).map((version, tableIndex) => (
                                    <>
                                    <Typography sx={{ marginBottom: 2 }}>
                                      <b>Remarks - Version {version}:</b> <em>{remarksArray[tableIndex]}</em>
                                    </Typography>
                                    <div style={{ overflowX: 'auto', width: '100%' }}>
                                    <table key={tableIndex} style={{ minWidth: isXs ? "200%" : isMd ? "150%" : "100%", borderCollapse: "collapse", marginBottom: "20px" }}>
                                      <thead>
                                        <tr>
                                          <th style={{ width: "15%", borderBottom: "1px solid #ddd", padding: "8px", textAlign: "left" }}> S.no </th>
                                          <th style={{ width: "20%", borderBottom: "1px solid #ddd", padding: "8px", textAlign: "left" }}> File </th>
                                          <th style={{ width: "20%", borderBottom: "1px solid #ddd", padding: "8px", textAlign: "left" }}> Version </th>
                                          <th style={{ width: "25%", borderBottom: "1px solid #ddd", padding: "8px", textAlign: "left" }}> Uploaded On </th>
                                        </tr>
                                      </thead>
                                      <tbody>
                                        {groupedFiles[version].map((file, index) => (
                                          <tr key={index}>
                                            <td style={{ width: "15%", padding: "8px", borderBottom: "1px solid #ddd" }}> {index + 1} </td>
                                            <td style={{ width: "20%", padding: "8px", borderBottom: "1px solid #ddd" }}>
                                              <a href={`https://policyuat.spandanasphoorty.com/policy_apis/policy_document/${file.file_name}`} target="_blank" rel="noopener noreferrer" download style={{ cursor: "pointer" }}>
                                                <div className="img-wrapper">
                                                  <Box sx={{ width: {lg:"45%", md:"65%", sm:"45%", xs:"65%"}, ml:{sm:-1, xs:-1} }}>
                                                    <img src={img1} style={{ width: "100%", height: "auto" }} alt="" />
                                                  </Box>
                                                </div>
                                              </a>
                                            </td>
                                            <td style={{ width: "20%", padding: "8px", borderBottom: "1px solid #ddd" }}> {file.version} </td>
                                            <td style={{ width: "25%", padding: "8px", borderBottom: "1px solid #ddd" }}> {new Date(file.createdAt).toLocaleDateString("en-GB")} </td>
                                          </tr>
                                        ))}
                                      </tbody>
                                    </table>
                                    </div>
                                    </>
                                  ))}
                                  <Typography sx={{ marginBottom: 2, marginTop: 2, textDecoration: "underline" }}>
                                    <b>Previous files uploaded by the initiator :</b>
                                  </Typography>
                                  {Object.keys(groupedFiles1).map((version, tableIndex) => (
                                    <>
                                    <Typography sx={{ marginBottom: 2, textDecoration: "underline" }}>
                                      Version {version}:
                                    </Typography>
                                    <div style={{ overflowX: 'auto', width: '100%' }}>
                                    <table key={tableIndex} style={{ minWidth: isXs ? "200%" : isMd ? "150%" : "100%", borderCollapse: "collapse", marginBottom: "20px" }}>
                                      <thead>
                                        <tr>
                                          <th style={{ width: "15%", borderBottom: "1px solid #ddd", padding: "8px", textAlign: "left" }} > S.no </th>
                                          <th style={{ width: "20%", borderBottom: "1px solid #ddd", padding: "8px", textAlign: "left" }}> File </th>
                                          <th style={{ width: "20%", borderBottom: "1px solid #ddd", padding: "8px", textAlign: "left" }}> Version </th>
                                          <th style={{ width: "25%", borderBottom: "1px solid #ddd", padding: "8px", textAlign: "left" }}> Uploaded On </th>
                                        </tr>
                                      </thead>
                                      <tbody>
                                        {groupedFiles1[version].map((file, index) => (
                                          <tr key={index}>
                                            <td style={{ width: "15%", padding: "8px", borderBottom: "1px solid #ddd" }} > {index + 1} </td>
                                            <td style={{ width: "20%", padding: "8px", borderBottom: "1px solid #ddd" }}>
                                              <a href={`https://policyuat.spandanasphoorty.com/policy_apis/policy_document/${file.file_name}`} target="_blank" rel="noopener noreferrer" download style={{ cursor: "pointer" }}>
                                                <div className="img-wrapper">
                                                  <Box sx={{ width: {lg:"45%", md:"65%", sm:"45%", xs:"65%"}, ml:{sm:-1, xs:-1} }}>
                                                    <img src={img1} style={{ width: "100%", height: "auto" }} alt="" />
                                                  </Box>
                                                </div>
                                              </a>
                                            </td>
                                            <td style={{ width: "20%", padding: "8px", borderBottom: "1px solid #ddd" }}> {file.version} </td>
                                            <td style={{ width: "25%", padding: "8px", borderBottom: "1px solid #ddd" }}> {new Date(file.createdAt).toLocaleDateString("en-GB")} </td>
                                          </tr>
                                        ))}
                                      </tbody>
                                    </table>
                                    </div>
                                    </>
                                  ))}
                                </>
                              )}
                            </TableCell>
                          </TableRow>
                        </>
                      ) : selectedDocument.status == 2 || selectedDocument.status == 3 ? (
                        <>
                          <TableRow>
                            <TableCell sx={{ pt: 3, pl: 2, verticalAlign: "top" }}>
                              <b>Files</b>
                            </TableCell>
                            <TableCell sx={{ pl: 2, verticalAlign: "top" }}>
                              {selectedDocument.version === "1.0" && selectedDocument.pending_at_id === selectedDocument.initiator_id && (
                                <>
                                  <Typography sx={{ marginBottom: 2, textDecoration: "underline" }}>
                                    <b>Files sent for review :</b>
                                  </Typography>
                                  <div style={{ overflowX: 'auto', width: '100%' }}>
                                  <table style={{ minWidth: isXs ? "200%" : isMd ? "150%" : "100%", borderCollapse: "collapse", marginBottom: "20px" }}>
                                    <thead>
                                      <tr>
                                        <th style={{ width: "15%", borderBottom: "1px solid #ddd", padding: "8px", textAlign: "left" }}> S.no </th>
                                        <th style={{ width: "20%", borderBottom: "1px solid #ddd", padding: "8px", textAlign: "left" }}> File </th>
                                        <th style={{ width: "20%", borderBottom: "1px solid #ddd", padding: "8px", textAlign: "left" }}> Version </th>
                                        <th style={{ width: "25%", borderBottom: "1px solid #ddd", padding: "8px", textAlign: "left" }}> Uploaded On </th>
                                      </tr>
                                    </thead>
                                    <tbody>
                                      {selectedDocument.policy_files.filter((file) => file.version === selectedDocument.version && file.type === 2).map((file, index) => (
                                          <tr key={index}>
                                            <td style={{ width: "15%", padding: "8px", borderBottom: "1px solid #ddd" }}> {index + 1} </td>
                                            <td style={{ width: "20%", padding: "8px", borderBottom: "1px solid #ddd" }}>
                                              <a href={`https://policyuat.spandanasphoorty.com/policy_apis/policy_document/${file.file_name}`} target="_blank" rel="noopener noreferrer" download style={{ cursor: "pointer" }}>
                                                <div className="img-wrapper">
                                                  <Box sx={{ width: {lg:"45%", md:"65%", sm:"45%", xs:"65%"}, ml:{sm:-1, xs:-1} }}>
                                                    <img src={img1} style={{ width: "100%", height: "auto" }} alt="" />
                                                  </Box>
                                                </div>
                                              </a>
                                            </td>
                                            <td style={{ width: "20%", padding: "8px", borderBottom: "1px solid #ddd" }}> {file.version} </td>
                                            <td style={{ width: "25%", padding: "8px", borderBottom: "1px solid #ddd" }}> {new Date(file.createdAt).toLocaleDateString( "en-GB" )} </td>
                                          </tr>
                                        ))}
                                    </tbody>
                                  </table>
                                  </div>
                                </>
                              )}
                              {selectedDocument.version === "1.0" && (
                                <>
                                  <Typography sx={{ marginBottom: 2, textDecoration: "underline" }}>
                                    <b>Files uploaded by initiator :</b>
                                  </Typography>
                                  <div style={{ overflowX: 'auto', width: '100%' }}>
                                  <table style={{ minWidth: isXs ? "200%" : isMd ? "150%" : "100%", borderCollapse: "collapse", marginBottom: "20px" }}>
                                    <thead>
                                      <tr>
                                        <th style={{ width: "15%", borderBottom: "1px solid #ddd", padding: "8px", textAlign: "left" }}> S.no </th>
                                        <th style={{ width: "20%", borderBottom: "1px solid #ddd", padding: "8px", textAlign: "left" }}> File </th>
                                        <th style={{ width: "20%", borderBottom: "1px solid #ddd", padding: "8px", textAlign: "left" }}> Version </th>
                                        <th style={{ width: "25%", borderBottom: "1px solid #ddd", padding: "8px", textAlign: "left" }}> Uploaded On </th>
                                      </tr>
                                    </thead>
                                    <tbody>
                                      {selectedDocument.policy_files.filter((file) => file.version === selectedDocument.version && file.type === 1).map((file, index) => (
                                          <tr key={index}>
                                            <td style={{ width: "15%", padding: "8px", borderBottom: "1px solid #ddd" }}> {index + 1} </td>
                                            <td style={{ width: "20%", padding: "8px", borderBottom: "1px solid #ddd" }}>
                                              <a href={`https://policyuat.spandanasphoorty.com/policy_apis/policy_document/${file.file_name}`} target="_blank" rel="noopener noreferrer" download style={{ cursor: "pointer" }}>
                                                <div className="img-wrapper">
                                                  <Box sx={{ width: {lg:"45%", md:"65%", sm:"45%", xs:"65%"}, ml:{sm:-1, xs:-1} }}>
                                                    <img src={img1} style={{ width: "100%", height: "auto" }} alt="" />
                                                  </Box>
                                                </div>
                                              </a>
                                            </td>
                                            <td style={{ width: "20%", padding: "8px", borderBottom: "1px solid #ddd" }}> {file.version} </td>
                                            <td style={{ width: "25%", padding: "8px", borderBottom: "1px solid #ddd" }}> {new Date(file.createdAt).toLocaleDateString("en-GB")} </td>
                                          </tr>
                                        ))}
                                    </tbody>
                                  </table>
                                  </div>
                                </>
                              )}
                              {selectedDocument.version !== "1.0" && selectedDocument.pending_at_id === selectedDocument.initiator_id && (
                                <>
                                  <Typography sx={{ marginBottom: 2, textDecoration: "underline" }}>
                                    <b>Latest files sent for review :</b>
                                  </Typography>
                                  <div style={{ overflowX: 'auto', width: '100%' }}>
                                  <table style={{ minWidth: isXs ? "200%" : isMd ? "150%" : "100%", borderCollapse: "collapse", marginBottom: "20px" }}>
                                    <thead>
                                      <tr>
                                        <th style={{ width: "15%", borderBottom: "1px solid #ddd", padding: "8px", textAlign: "left" }}> S.no </th>
                                        <th style={{ width: "20%", borderBottom: "1px solid #ddd", padding: "8px", textAlign: "left" }}> File </th>
                                        <th style={{ width: "20%", borderBottom: "1px solid #ddd", padding: "8px", textAlign: "left" }}> Version </th>
                                        <th style={{ width: "25%", borderBottom: "1px solid #ddd", padding: "8px", textAlign: "left" }}> Uploaded On </th>
                                      </tr>
                                    </thead>
                                    <tbody>
                                      {selectedDocument.policy_files.filter((file) => file.version === selectedDocument.version && file.type === 2).map((file, index) => (
                                        <tr key={index}>
                                          <td style={{ width: "15%", padding: "8px", borderBottom: "1px solid #ddd" }}> {index + 1} </td>
                                          <td style={{ width: "20%", padding: "8px", borderBottom: "1px solid #ddd" }}>
                                            <a href={`https://policyuat.spandanasphoorty.com/policy_apis/policy_document/${file.file_name}`} target="_blank" rel="noopener noreferrer" download style={{ cursor: "pointer" }}>
                                              <div className="img-wrapper">
                                                <Box sx={{ width: {lg:"45%", md:"65%", sm:"45%", xs:"65%"}, ml:{sm:-1, xs:-1} }}>
                                                  <img src={img1} style={{ width: "100%", height: "auto" }} alt="" />
                                                </Box>
                                              </div>
                                            </a>
                                          </td>
                                          <td style={{ width: "20%", padding: "8px", borderBottom: "1px solid #ddd" }}> {file.version} </td>
                                          <td style={{ width: "25%", padding: "8px", borderBottom: "1px solid #ddd" }}> {new Date(file.createdAt).toLocaleDateString( "en-GB" )} </td>
                                        </tr>
                                      ))}
                                    </tbody>
                                  </table>
                                  </div>
                                </>
                              )}
                              {selectedDocument.version !== "1.0" && (
                                <>
                                  <Typography sx={{ marginBottom: 2, marginTop: 2, textDecoration: "underline" }}>
                                    <b>Latest files uploaded by the initiator:</b>
                                  </Typography>
                                  <div style={{ overflowX: 'auto', width: '100%' }}>
                                  <table style={{ minWidth: isXs ? "200%" : isMd ? "150%" : "100%", borderCollapse: "collapse", marginBottom: "20px" }}>
                                    <thead>
                                      <tr>
                                        <th style={{ width: "15%", borderBottom: "1px solid #ddd", padding: "8px", textAlign: "left" }}> S.no </th>
                                        <th style={{ width: "20%", borderBottom: "1px solid #ddd", padding: "8px", textAlign: "left" }}> File </th>
                                        <th style={{ width: "20%", borderBottom: "1px solid #ddd", padding: "8px", textAlign: "left" }}> Version </th>
                                        <th style={{ width: "25%", borderBottom: "1px solid #ddd", padding: "8px", textAlign: "left" }}> Uploaded On </th>
                                      </tr>
                                    </thead>
                                    <tbody>
                                      {selectedDocument.policy_files.filter((file) => file.version === selectedDocument.version && file.type === 1).map((file, index) => (
                                        <tr key={index}>
                                          <td style={{ width: "15%", padding: "8px", borderBottom: "1px solid #ddd" }}> {index + 1} </td>
                                          <td style={{ width: "20%", padding: "8px", borderBottom: "1px solid #ddd" }}>
                                            <a href={`https://policyuat.spandanasphoorty.com/policy_apis/policy_document/${file.file_name}`} target="_blank" rel="noopener noreferrer" download style={{ cursor: "pointer" }}>
                                              <div className="img-wrapper">
                                                <Box sx={{ width: {lg:"45%", md:"65%", sm:"45%", xs:"65%"}, ml:{sm:-1, xs:-1} }}>
                                                  <img src={img1} style={{ width: "100%", height: "auto" }} alt="" />
                                                </Box>
                                              </div>
                                            </a>
                                          </td>
                                          <td style={{ width: "20%", padding: "8px", borderBottom: "1px solid #ddd" }}> {file.version} </td>
                                          <td style={{ width: "25%", padding: "8px", borderBottom: "1px solid #ddd" }}> {new Date(file.createdAt).toLocaleDateString("en-GB")} </td>
                                        </tr>
                                      ))}
                                    </tbody>
                                  </table>
                                  </div>
                                </>
                              )}
                              {selectedDocument.version !== "1.0" && (
                                <>
                                  <Typography sx={{ marginBottom: 2, textDecoration: "underline" }}>
                                    <b>Previous files sent for review :</b>
                                  </Typography>
                                  {Object.keys(groupedFiles).map((version, tableIndex) => (
                                    <>
                                    <Typography sx={{ marginBottom: 2 }}>
                                      <b>Remarks - Version {version}:</b> <em>{remarksArray[tableIndex]}</em>
                                    </Typography>
                                    <div style={{ overflowX: 'auto', width: '100%' }}>
                                    <table key={tableIndex} style={{ minWidth: isXs ? "200%" : isMd ? "150%" : "100%", borderCollapse: "collapse", marginBottom: "20px" }}>
                                      <thead>
                                        <tr>
                                          <th style={{ width: "15%", borderBottom: "1px solid #ddd", padding: "8px", textAlign: "left" }}> S.no </th>
                                          <th style={{ width: "20%", borderBottom: "1px solid #ddd", padding: "8px", textAlign: "left" }}> File </th>
                                          <th style={{ width: "20%", borderBottom: "1px solid #ddd", padding: "8px", textAlign: "left" }}> Version </th>
                                          <th style={{ width: "25%", borderBottom: "1px solid #ddd", padding: "8px", textAlign: "left" }}> Uploaded On </th>
                                        </tr>
                                      </thead>
                                      <tbody>
                                        {groupedFiles[version].map((file, index) => (
                                          <tr key={index}>
                                            <td style={{ width: "15%", padding: "8px", borderBottom: "1px solid #ddd" }}> {index + 1} </td>
                                            <td style={{ width: "20%", padding: "8px", borderBottom: "1px solid #ddd" }}>
                                              <a href={`https://policyuat.spandanasphoorty.com/policy_apis/policy_document/${file.file_name}`} target="_blank" rel="noopener noreferrer" download style={{ cursor: "pointer" }}>
                                                <div className="img-wrapper">
                                                  <Box sx={{ width: {lg:"45%", md:"65%", sm:"45%", xs:"65%"}, ml:{sm:-1, xs:-1} }}>
                                                    <img src={img1} style={{ width: "100%", height: "auto" }} alt="" />
                                                  </Box>
                                                </div>
                                              </a>
                                            </td>
                                            <td style={{ width: "20%", padding: "8px", borderBottom: "1px solid #ddd" }}> {file.version} </td>
                                            <td style={{ width: "25%", padding: "8px", borderBottom: "1px solid #ddd" }}> {new Date(file.createdAt).toLocaleDateString("en-GB")} </td>
                                          </tr>
                                        ))}
                                      </tbody>
                                    </table>
                                    </div>
                                    </>
                                  ))}
                                  <Typography sx={{ marginBottom: 2, marginTop: 2, textDecoration: "underline" }}>
                                    <b>Previous files uploaded by the initiator :</b>
                                  </Typography>
                                  {Object.keys(groupedFiles1).map((version, tableIndex) => (
                                    <>
                                    <Typography sx={{ marginBottom: 2, textDecoration: "underline" }}>
                                      Version {version}:
                                    </Typography>
                                    <div style={{ overflowX: 'auto', width: '100%' }}>
                                    <table key={tableIndex} style={{ minWidth: isXs ? "200%" : isMd ? "150%" : "100%", borderCollapse: "collapse", marginBottom: "20px" }}>
                                      <thead>
                                        <tr>
                                          <th style={{ width: "15%", borderBottom: "1px solid #ddd", padding: "8px", textAlign: "left" }}> S.no </th>
                                          <th style={{ width: "20%", borderBottom: "1px solid #ddd", padding: "8px", textAlign: "left" }}> File </th>
                                          <th style={{ width: "20%", borderBottom: "1px solid #ddd", padding: "8px", textAlign: "left" }}> Version </th>
                                          <th style={{ width: "25%", borderBottom: "1px solid #ddd", padding: "8px", textAlign: "left" }}> Uploaded On </th>
                                        </tr>
                                      </thead>
                                      <tbody>
                                        {groupedFiles1[version].map((file, index) => (
                                          <tr key={index}>
                                            <td style={{ width: "15%", padding: "8px", borderBottom: "1px solid #ddd" }}> {index + 1} </td>
                                            <td style={{ width: "20%", padding: "8px", borderBottom: "1px solid #ddd" }}>
                                              <a href={`https://policyuat.spandanasphoorty.com/policy_apis/policy_document/${file.file_name}`} target="_blank" rel="noopener noreferrer" download style={{ cursor: "pointer" }}>
                                                <div className="img-wrapper">
                                                  <Box sx={{ width: {lg:"45%", md:"65%", sm:"45%", xs:"65%"}, ml:{sm:-1, xs:-1} }}>
                                                    <img src={img1} style={{ width: "100%", height: "auto" }} alt="" />
                                                  </Box>
                                                </div>
                                              </a>
                                            </td>
                                            <td style={{ width: "20%", padding: "8px", borderBottom: "1px solid #ddd" }}> {file.version} </td>
                                            <td style={{ width: "25%", padding: "8px", borderBottom: "1px solid #ddd" }} > {new Date(file.createdAt).toLocaleDateString("en-GB")} </td>
                                          </tr>
                                        ))}
                                      </tbody>
                                    </table>
                                    </div>
                                    </>
                                  ))}
                                </>
                              )}
                            </TableCell>
                          </TableRow>
                        </>
                      ) : (
                        <>
                          <TableRow>
                            <TableCell sx={{ pl: 2, verticalAlign: "top" }}>
                              <b>Final files</b>
                            </TableCell>
                            <TableCell sx={{ pl: 2, verticalAlign: "top"}}>
                            <div style={{ overflowX: 'auto', width: '100%' }}>
                              <table style={{ minWidth: isXs ? "200%" : isMd ? "150%" : "100%", borderCollapse: "collapse", marginBottom: "20px" }}>
                                <thead>
                                  <tr>
                                    <th style={{ width: "15%", borderBottom: "1px solid #ddd", padding: "8px", textAlign: "left" }}> S.no </th>
                                    <th style={{ width: "20%", borderBottom: "1px solid #ddd", padding: "8px", textAlign: "left" }}> File </th>
                                    <th style={{ width: "20%", borderBottom: "1px solid #ddd", padding: "8px", textAlign: "left" }}> Version </th>
                                    <th style={{ width: "25%", borderBottom: "1px solid #ddd", padding: "8px", textAlign: "left" }}> Uploaded On </th>
                                  </tr>
                                </thead>
                                <tbody>
                                  {selectedDocument.policy_files.map((file, index) => (
                                    <tr key={index}>
                                      <td style={{ width: "15%", padding: "8px", borderBottom: "1px solid #ddd" }}> {index + 1} </td>
                                      <td style={{ width: "20%", padding: "8px", borderBottom: "1px solid #ddd" }}>
                                        <a href={`https://policyuat.spandanasphoorty.com/policy_apis/policy_document/${file.file_name}`} target="_blank" rel="noopener noreferrer" download style={{ cursor: "pointer" }}>
                                          <div className="img-wrapper">
                                            <Box sx={{ width: {lg:"45%", md:"65%", sm:"45%", xs:"65%"}, ml:{sm:-1, xs:-1} }}>
                                              <img src={img1} style={{ width: "100%", height: "auto" }} alt="" />
                                            </Box>
                                          </div>
                                        </a>
                                      </td>
                                      <td style={{ width: "20%", padding: "8px", borderBottom: "1px solid #ddd" }}> {file.version} </td>
                                      <td style={{ width: "25%", padding: "8px", borderBottom: "1px solid #ddd" }}> {new Date(file.createdAt).toLocaleDateString("en-GB")} </td>
                                    </tr>
                                  ))}
                                </tbody>
                              </table>
                            </div>
                            </TableCell>
                          </TableRow>
                        </>
                      )}
                    </TableBody>
                  </Table>
                </TableContainer>
              </>
            )}
          </Grid>
          <Grid item lg={5} md={12} sm={12} xs={12} sx={{ fontFamily: "sans-serif", fontSize: "0.875 rem", marginLeft: 2, marginTop: 2, marginRight: 2 }}>
          {selectedDocument && (selectedDocument.status == 1 || selectedDocument.status == 3) && (
            <>
            <div style={{ marginBottom: "16px" }}>
              <Typography variant="h5" sx={{ fontFamily: "sans-serif", fontSize: "1.4rem", fontWeight: "bold", marginTop: -2, marginRight: 2 }}>
                Action:
              </Typography>
              <span style={{ fontSize: "0.7rem" }}>
                Fields marked with (<span style={{ color: "red" }}>*</span>) are mandatory
              </span>
            </div>
            <Typography sx={{ fontFamily: "sans-serif" }}>
              <strong>Current Status: </strong>{" "}
              <Box component="span" sx={{ fontSize: '22px', fontWeight: "bold", color: documentStatus === 1 ? "green" : documentStatus === 3 ? "red" : "inherit" }}>
                {documentStatus === 1 ? "Active" : documentStatus === 3 ? "Deprecated" : "Unknown"}
              </Box>
            </Typography>
            {selectedDocument ? (
              <>
                <form onSubmit={handleSubmit} encType="multipart/form-data">
                  {(selectedDocument.status == 1 || selectedDocument.status == 3) && (
                      <Box sx={{ mt: 2 }}>
                        <Typography variant="h8" sx={{ fontFamily: "sans-serif", display: "block" }}>
                          <b> Decision <span style={{ color: "red" }}>*</span> : </b>
                        </Typography>
                        <StyledSelect value={decision} onChange={handleDecisionChange} fullWidth variant="outlined" sx={{ mt: 1 }}>
                          <MenuItem value=""><em>None</em></MenuItem>
                          <MenuItem value="activate" disabled={documentDecision === "activate"}>Activate</MenuItem>
                          <MenuItem value="deprecate" disabled={documentDecision === "deprecate"}>Deprecate</MenuItem>
                        </StyledSelect>
                      </Box>
                    )}
                  {(selectedDocument.status == 1 || selectedDocument.status == 3) && (
                    <Grid container justifyContent="center" sx={{ mt: 2, mb: 2 }}>
                      <Grid item>
                        <Button type="submit" disabled={isBtnDisabled} variant="contained" sx={{ padding: "6px 16px", fontSize: "0.875rem", minHeight: "24px", lineHeight: 1, backgroundColor: "#ee8812", "&:hover": { backgroundColor: "rgb(249, 83, 22)" }}}>
                          Submit
                        </Button>
                      </Grid>
                    </Grid>
                  )}
                </form>
              </>
            ) : (
              <Typography>Loading...</Typography>
            )}
            </>
          )}
          </Grid>
        </Grid>
      </Card>
    </ContentBox>
  );
}
