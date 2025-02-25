import React, { useState, useEffect } from "react";
import { Box, Button, Card, Grid, IconButton, Dialog, DialogContentText, DialogContent, DialogTitle, DialogActions, MenuItem, Paper, Select, Table, styled, TableRow, TableBody, TableCell, TableContainer, Typography } from "@mui/material";
import { jwtDecode } from "jwt-decode";
import { useLocation, useParams } from "react-router-dom";
import { useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import img1 from "../../../assets/download_file_icon.png";
import useCustomFetch from "../../../hooks/useFetchWithAuth";
import { useMediaQuery } from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';

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
  const customFetchWithAuth = useCustomFetch();
  const { title, status, activeTab } = location.state || {};
  const [openDialog, setOpenDialog] = useState(false);
  const [documentIdToDelete, setDocumentIdToDelete] = useState(null);

  // useEffect(() => {
  //   if (!location.state?.fromHandleRowClick) {
  //     navigate(-1);
  //   }
  // }, [location.state, navigate]);

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
      const response = await customFetchWithAuth(`${process.env.REACT_APP_POLICY_BACKEND}policy/${documentId}`, "GET", 1, {});
      const data = await response.json();
      setSelectedDocument(data.data);
    } catch (err) {
      setError("Failed to fetch document details.");
    } finally {
      setLoading(false);
    }
  };

  const handleBackClick = () => {
    navigate("/admin?tab=2");
  };

  const [isBtnDisabled, setIsBtnDisabled] = useState(false);

  useEffect(() => {
    if (decision === documentDecision) {
      setIsBtnDisabled(true);
    } else {
      setIsBtnDisabled(false);
    }
  }, [decision, documentDecision]);

  const handleFileDownload = async (version, type) => {
    // event.preventDefault();
    setIsBtnDisabled(true);
    if (!userToken) {
      toast.error("You are not authenticated to view or download this file");
      setIsBtnDisabled(true);
      setTimeout(() => {
        setIsBtnDisabled(false);
      }, 4000);
      return;
    }
    const url = `${process.env.REACT_APP_POLICY_BACKEND}policy/download-policy/${documentID}?v=${version}&type=${type}`;
    const requestData = {
      id: documentID
    };
    try {
      const response = await customFetchWithAuth(url, "GET", 1);
      if (response.ok) {
        const blob = await response.blob();
        const link = document.createElement("a");
        const fileURL = window.URL.createObjectURL(blob);
        link.href = fileURL;
        const documentIDDisplay = getDisplayPolicyId(documentID);
        if (selectedDocument?.status == 1 && selectedDocument?.pending_at_id == null) {
          link.download = `${documentIDDisplay}.pdf`;
        } else {
          if (type === 1) {
            link.download = version && `${documentIDDisplay}_v${version}.zip`;
          } else if (type === 2) {
            link.download = version && `${documentIDDisplay}_v${version}_Review.zip`;
          }
        }
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        setIsBtnDisabled(true);
        setTimeout(() => {
          setIsBtnDisabled(false);
        }, 15000);
      } else {
        setError("Failed to download the file. Please try again.");
      }
    } catch (err) {
      setError("Failed to fetch the requested file");
    }
  };

  const handleDeleteClick = (id) => {
    setDocumentIdToDelete(id);
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setDocumentIdToDelete(null);
  };

  const handleConfirmDelete = async () => {
    const url = `${process.env.REACT_APP_POLICY_BACKEND}policy/${documentIdToDelete}`;
    try {
      const response = await customFetchWithAuth(url, "DELETE", 4);
      if (response.ok) {
        navigate("/admin?tab=2");
        toast.success(`Document id - ${documentIdToDelete} deleted`);
      }
    } catch (e) {
      setError("Error deleting the policy: ", e);
    }
    handleCloseDialog();
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setLoading(true);
    setIsBtnDisabled(true);
    const url = documentDecision == "activate" ? `${process.env.REACT_APP_POLICY_BACKEND}admin/depricate-policy` : `${process.env.REACT_APP_POLICY_BACKEND}admin/reactivate-policy`;
    const formData = {
      id: documentID
    }
    const submitForm = customFetchWithAuth(url, "POST", 2, JSON.stringify(formData))
      .then((response) => {
        if (!response.ok) {
          throw new Error(`Error: ${response.statusText}`);
        }
        return response.json();
      })
      .then((data) => {
        if (data.status) {
          setIsBtnDisabled(true);
          setTimeout(() => {
            navigate("/admin");
          }, 1000);
        } else {
          setIsBtnDisabled(true);
          setTimeout(() => {
            setIsBtnDisabled(false);
          }, 4000);
          throw new Error("Submission failed");
        }
        setLoading(false);
      })
      .catch((error) => {
        console.error("Submission error:", error);
        setIsBtnDisabled(true);
        setTimeout(() => {
          setIsBtnDisabled(false);
        }, 4000);
        setLoading(false);
        throw error;
      });
    if (documentDecision == "activate") {
      toast.promise(submitForm, {
        loading: "Updating...",
        success: (data) => documentType == 1 ? `Policy deprecated successfully` : documentType == 2 ? `SOP deprecated successfully` : `Guidance Note deprecated successfully`, // Adjust based on your API response
        error: (err) => `Error while deprecating the policy`
      });
    } else if (documentDecision == "deprecate") {
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

  useEffect(() => {
    if (selectedDocument) {
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
  }, [selectedDocument]);

  return (
    <ContentBox className="analytics">
      <Card sx={{ px: 3, py: 3, height: "100%", width: "100%" }}>
        {!isXs && (
          <Grid container>
            <Grid item xs={12} display="flex" justifyContent="flex-end">
              <Button variant="contained" onClick={handleBackClick} sx={{ marginRight: 2, marginTop: 2, height: "28px", backgroundColor: "#ee8812", "&:hover": { backgroundColor: "rgb(249, 83, 22)" } }}>
                Back
              </Button>
            </Grid>
          </Grid>
        )}
        <Grid container spacing={2} alignItems="flex-start">
          <Grid item lg={6} md={12} sm={12} xs={12} sx={{ fontFamily: "sans-serif", fontSize: "0.875 rem", marginLeft: { lg: 2, md: 2, sm: 1, xs: 1 }, marginTop: 2, marginRight: { lg: 2, md: 2, sm: -1, xs: -2 }, paddingRight: "16px" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "stretch" }}>
              <Typography variant="h5" sx={{ fontFamily: "sans-serif", fontSize: "1.4rem", fontWeight: "bold", marginBottom: 2, marginTop: -2, marginRight: 2 }}>
                Document Details:
              </Typography>
              {selectedDocument && (
                <Button
                  variant="contained"
                  color="warning"
                  onClick={() => handleDeleteClick(selectedDocument.id)}
                  sx={{
                    height: '30px',
                    padding: '0 16px',
                    mb: 2,
                    mt: -2
                  }}
                >
                  Delete this {selectedDocument.type == 1 ? 'Policy' : selectedDocument.type == 2 ? 'SOP' : 'Guidance Note'}
                </Button>
              )}
            </div>
            {selectedDocument && (
              <>
                <TableContainer component={Paper} sx={{ marginLeft: "0" }}>
                  <Table aria-label="data table">
                    <TableBody>
                      <TableRow>
                        <TableCell sx={{ pl: 2, width: { lg: "30%", md: "28%", sm: "20%", xs: "40%" }, verticalAlign: "top" }}>
                          <b>{selectedDocument.type == 1 ? 'Policy' : selectedDocument.type == 2 ? 'SOP' : 'Guidance Note'} ID:</b>
                        </TableCell>
                        <TableCell sx={{ pl: 2, width: { lg: "70%", md: "72%", sm: "80%", xs: "60%" }, verticalAlign: "top" }}>
                          {getDisplayPolicyId(selectedDocument.id)}
                        </TableCell>
                      </TableRow>
                      <TableRow>
                        <TableCell sx={{ pl: 2, width: { lg: "30%", md: "28%", sm: "20%", xs: "40%" }, verticalAlign: "top" }}>
                          <b>Title:</b>
                        </TableCell>
                        <TableCell sx={{ pl: 2, width: { lg: "70%", md: "72%", sm: "80%", xs: "60%" }, verticalAlign: "top" }}>{selectedDocument.title}</TableCell>
                      </TableRow>
                      <TableRow>
                        <TableCell sx={{ pl: 2, width: { lg: "30%", md: "28%", sm: "20%", xs: "40%" }, verticalAlign: "top" }}>
                          <b>Description:</b>
                        </TableCell>
                        <TableCell sx={{ pl: 2, width: { lg: "70%", md: "72%", sm: "80%", xs: "60%" }, verticalAlign: "top" }}>{selectedDocument.description}</TableCell>
                      </TableRow>
                      {roleId !== 16 && (
                        <>
                          <TableRow>
                            <TableCell sx={{ pl: 2, width: { lg: "30%", md: "28%", sm: "20%", xs: "40%" }, verticalAlign: "top" }}>
                              <b>Initiator:</b>
                            </TableCell>
                            <TableCell sx={{ pl: 2, width: { lg: "70%", md: "72%", sm: "80%", xs: "60%" }, verticalAlign: "top" }}>
                              {selectedDocument.initiator_details?.emp_name}
                            </TableCell>
                          </TableRow>
                          <TableRow>
                            <TableCell sx={{ pl: 2, width: { lg: "30%", md: "28%", sm: "20%", xs: "40%" }, verticalAlign: "top" }}>
                              <b>Reviewer:</b>
                            </TableCell>
                            <TableCell sx={{ pl: 2, width: { lg: "70%", md: "72%", sm: "80%", xs: "60%" }, verticalAlign: "top" }}>
                              {selectedDocument.reviwer_details?.emp_name}
                            </TableCell>
                          </TableRow>
                          {selectedDocument.Policy_status.slice(2).map((approver, index) => (
                            <TableRow key={approver.approver_id}>
                              <TableCell sx={{ pl: 2, width: { lg: "30%", md: "28%", sm: "20%", xs: "40%" }, verticalAlign: "top" }}>
                                <b>Approver-{index + 1}:</b>
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
                              {selectedDocument.version.endsWith(".0") && selectedDocument.pending_at_id === selectedDocument.initiator_id && (
                                <>
                                  <Typography sx={{ marginBottom: 2, marginTop: 1, textDecoration: "underline" }}>
                                    <b>Files sent for review :</b>
                                  </Typography>
                                  <div style={{ overflowX: 'auto', width: '100%' }}>
                                    <table style={{ minWidth: isXs ? "200%" : "100%", borderCollapse: "collapse", marginBottom: "20px" }}>
                                      <thead>
                                        <tr>
                                          {/* <th style={{ width: "15%", borderBottom: "1px solid #ddd", padding: "8px", textAlign: "left" }}> S.no </th> */}
                                          <th style={{ width: "15%", borderBottom: "1px solid #ddd", padding: "8px", textAlign: "left" }}> Files </th>
                                          <th style={{ width: "20%", borderBottom: "1px solid #ddd", padding: "8px", textAlign: "left" }}> Version </th>
                                          <th style={{ width: "25%", borderBottom: "1px solid #ddd", padding: "8px", textAlign: "left" }}> Uploaded On </th>
                                        </tr>
                                      </thead>
                                      <tbody>
                                        {/* {selectedDocument.policy_files .filter((file) => file.version === selectedDocument.version && file.type === 2).map((file, index) => ( */}
                                        <tr>
                                          {/* <td style={{ width: "15%", padding: "8px", borderBottom: "1px solid #ddd" }}> {index + 1} </td> */}
                                          <td style={{ width: "15%", padding: "8px", borderBottom: "1px solid #ddd" }}>
                                            <a onClick={(e) => { e.preventDefault(); handleFileDownload(selectedDocument.version, 2); }} target="_blank" rel="noopener noreferrer" download style={{ cursor: "pointer" }}>
                                              <div className="img-wrapper">
                                                <Box sx={{ width: { lg: "45%", md: "45%", sm: "65%", xs: "85%" }, ml: { lg: 0, md: 0, sm: 0, xs: 0 } }}>
                                                  <img src={img1} style={{ width: "100%", height: "auto" }} alt="" />
                                                </Box>
                                                <IconButton onClick={() => handleDeleteClick(selectedDocument.policy_files[0])} size="small">
                                                  <DeleteIcon />
                                                </IconButton>
                                              </div>
                                            </a>
                                          </td>
                                          <td style={{ width: "20%", padding: "8px", borderBottom: "1px solid #ddd" }}> {selectedDocument.version} </td>
                                          {selectedDocument.policy_files.filter((file) => file.version === selectedDocument.version && file.type === 2).slice(0, 1).map((file, index) => (
                                            <td style={{ width: "25%", padding: "8px", borderBottom: "1px solid #ddd" }}> {new Date(file.createdAt).toLocaleDateString("en-GB")} </td>
                                          ))}
                                        </tr>
                                        {/* ))} */}
                                      </tbody>
                                    </table>
                                  </div>
                                </>
                              )}
                              {selectedDocument.version.endsWith(".0") && (
                                <>
                                  <Typography sx={{ marginBottom: 2, marginTop: 1, textDecoration: "underline" }}>
                                    <b>Files uploaded by initiator :</b>
                                  </Typography>
                                  <div style={{ overflowX: 'auto', width: '100%' }}>
                                    <table style={{ minWidth: isXs ? "200%" : "100%", borderCollapse: "collapse", marginBottom: "20px" }}>
                                      <thead>
                                        <tr>
                                          {/* <th style={{ width: "15%", borderBottom: "1px solid #ddd", padding: "8px", textAlign: "left" }}> S.no </th> */}
                                          <th style={{ width: "15%", borderBottom: "1px solid #ddd", padding: "8px", textAlign: "left" }}> Files </th>
                                          <th style={{ width: "20%", borderBottom: "1px solid #ddd", padding: "8px", textAlign: "left" }}> Version </th>
                                          <th style={{ width: "25%", borderBottom: "1px solid #ddd", padding: "8px", textAlign: "left" }}> Uploaded On </th>
                                        </tr>
                                      </thead>
                                      <tbody>
                                        {/* {selectedDocument.policy_files.filter((file) => file.version === selectedDocument.version && file.type === 1).map((file, index) => ( */}
                                        <tr>
                                          {/* <td style={{ width: "15%", padding: "8px", borderBottom: "1px solid #ddd" }}> {index + 1} </td> */}
                                          <td style={{ width: "15%", padding: "8px", borderBottom: "1px solid #ddd" }}>
                                            <a onClick={(e) => { e.preventDefault(); handleFileDownload(selectedDocument.version, 1); }} target="_blank" rel="noopener noreferrer" download style={{ cursor: "pointer" }}>
                                              <div className="img-wrapper">
                                                <Box sx={{ width: { lg: "45%", md: "45%", sm: "65%", xs: "85%" }, ml: { lg: 0, md: 0, sm: 0, xs: 0 } }}>
                                                  <img src={img1} style={{ width: "100%", height: "auto" }} alt="" />
                                                </Box>
                                              </div>
                                            </a>
                                          </td>
                                          <td style={{ width: "20%", padding: "8px", borderBottom: "1px solid #ddd" }}> {selectedDocument.version} </td>
                                          {selectedDocument.policy_files.filter((file) => file.version.endsWith(".0") && selectedDocument.version.endsWith(".0") && file.type === 1).slice(0, 1).map((file, index) => (
                                            <td style={{ width: "25%", padding: "8px", borderBottom: "1px solid #ddd" }}> {new Date(file.createdAt).toLocaleDateString("en-GB")} </td>
                                          ))}
                                        </tr>
                                        {/* ))} */}
                                      </tbody>
                                    </table>
                                  </div>
                                </>
                              )}
                              {!selectedDocument.version.endsWith(".0") && selectedDocument.pending_at_id === selectedDocument.initiator_id && (
                                <>
                                  <Typography sx={{ marginBottom: 2, marginTop: 1, textDecoration: "underline" }}>
                                    <b>Latest files sent for review :</b>
                                  </Typography>
                                  <Typography sx={{ marginBottom: 2 }}>
                                    <b>Remarks :</b> <em>{latest_remarks}</em>
                                  </Typography>
                                  <div style={{ overflowX: 'auto', width: '100%' }}>
                                    <table
                                      style={{ minWidth: isXs ? "200%" : "100%", borderCollapse: "collapse", marginBottom: "20px" }}>
                                      <thead>
                                        <tr>
                                          {/* <th style={{ width: "15%", borderBottom: "1px solid #ddd", padding: "8px", textAlign: "left" }}> S.no </th> */}
                                          <th style={{ width: "15%", borderBottom: "1px solid #ddd", padding: "8px", textAlign: "left" }}> Files </th>
                                          <th style={{ width: "20%", borderBottom: "1px solid #ddd", padding: "8px", textAlign: "left" }}> Version </th>
                                          <th style={{ width: "25%", borderBottom: "1px solid #ddd", padding: "8px", textAlign: "left" }}> Uploaded On </th>
                                        </tr>
                                      </thead>
                                      <tbody>
                                        {/* {selectedDocument.policy_files.filter((file) => file.version === selectedDocument.version && file.type === 2).map((file, index) => ( */}
                                        <tr>
                                          {/* <td style={{ width: "15%", padding: "8px", borderBottom: "1px solid #ddd" }}> {index + 1} </td> */}
                                          <td style={{ width: "15%", padding: "8px", borderBottom: "1px solid #ddd" }}>
                                            <a onClick={(e) => { e.preventDefault(); handleFileDownload(selectedDocument.version, 2); }} target="_blank" rel="noopener noreferrer" download style={{ cursor: "pointer" }}>
                                              <div className="img-wrapper">
                                                <Box sx={{ width: { lg: "45%", md: "45%", sm: "65%", xs: "85%" }, ml: { lg: 0, md: 0, sm: 0, xs: 0 } }}>
                                                  <img src={img1} style={{ width: "100%", height: "auto" }} alt="" />
                                                </Box>
                                              </div>
                                            </a>
                                          </td>
                                          <td style={{ width: "20%", padding: "8px", borderBottom: "1px solid #ddd" }}> {selectedDocument.version} </td>
                                          {selectedDocument.policy_files.filter((file) => file.version === selectedDocument.version && file.type === 2).slice(0, 1).map((file, index) => (
                                            <td style={{ width: "25%", padding: "8px", borderBottom: "1px solid #ddd" }}> {new Date(file.createdAt).toLocaleDateString("en-GB")} </td>
                                          ))}
                                        </tr>
                                        {/* ))} */}
                                      </tbody>
                                    </table>
                                  </div>
                                </>
                              )}
                              {!selectedDocument.version.endsWith(".0") && (
                                <>
                                  <Typography sx={{ marginBottom: 2, marginTop: 1, textDecoration: "underline" }}>
                                    <b>Latest files uploaded by the initiator :</b>
                                  </Typography>
                                  <div style={{ overflowX: 'auto', width: '100%' }}>
                                    <table style={{ minWidth: isXs ? "200%" : "100%", borderCollapse: "collapse", marginBottom: "20px" }}>
                                      <thead>
                                        <tr>
                                          {/* <th style={{ width: "15%", borderBottom: "1px solid #ddd", padding: "8px", textAlign: "left" }}> S.no </th> */}
                                          <th style={{ width: "15%", borderBottom: "1px solid #ddd", padding: "8px", textAlign: "left" }}> Files </th>
                                          <th style={{ width: "20%", borderBottom: "1px solid #ddd", padding: "8px", textAlign: "left" }}> Version </th>
                                          <th style={{ width: "25%", borderBottom: "1px solid #ddd", padding: "8px", textAlign: "left" }}> Uploaded On </th>
                                        </tr>
                                      </thead>
                                      <tbody>
                                        {/* {selectedDocument.policy_files.filter((file) => file.version === selectedDocument.version && file.type === 1).map((file, index) => ( */}
                                        <tr>
                                          {/* <td style={{ width: "15%", padding: "8px", borderBottom: "1px solid #ddd" }}> {index + 1} </td> */}
                                          <td style={{ width: "15%", padding: "8px", borderBottom: "1px solid #ddd" }}>
                                            <a onClick={(e) => { e.preventDefault(); handleFileDownload(selectedDocument.version, 1); }} target="_blank" rel="noopener noreferrer" download style={{ cursor: "pointer" }}>
                                              <div className="img-wrapper">
                                                <Box sx={{ width: { lg: "45%", md: "45%", sm: "65%", xs: "85%" }, ml: { lg: 0, md: 0, sm: 0, xs: 0 } }}>
                                                  <img src={img1} style={{ width: "100%", height: "auto" }} alt="" />
                                                </Box>
                                              </div>
                                            </a>
                                          </td>
                                          <td style={{ width: "20%", padding: "8px", borderBottom: "1px solid #ddd" }}> {selectedDocument.version} </td>
                                          {selectedDocument.policy_files.filter((file) => file.version === selectedDocument.version && file.type === 1).slice(0, 1).map((file, index) => (
                                            <td style={{ width: "25%", padding: "8px", borderBottom: "1px solid #ddd" }}> {new Date(file.createdAt).toLocaleDateString("en-GB")} </td>
                                          ))}
                                        </tr>
                                        {/* ))} */}
                                      </tbody>
                                    </table>
                                  </div>
                                </>
                              )}
                              {!selectedDocument.version.endsWith(".0") && (
                                <>
                                  <Typography sx={{ marginBottom: 2, marginTop: 1, textDecoration: "underline" }}>
                                    <b>Previous files sent for review :</b>
                                  </Typography>
                                  {Object.keys(groupedFiles).map((version, tableIndex) => (
                                    <>
                                      <Typography sx={{ marginBottom: 2 }}>
                                        <b>Remarks - Version {version}:</b> <em>{remarksArray[tableIndex]}</em>
                                      </Typography>
                                      <div style={{ overflowX: 'auto', width: '100%' }}>
                                        <table key={tableIndex} style={{ minWidth: isXs ? "200%" : "100%", borderCollapse: "collapse", marginBottom: "20px" }}>
                                          <thead>
                                            <tr>
                                              {/* <th style={{ width: "15%", borderBottom: "1px solid #ddd", padding: "8px", textAlign: "left" }}> S.no </th> */}
                                              <th style={{ width: "15%", borderBottom: "1px solid #ddd", padding: "8px", textAlign: "left" }}> Files </th>
                                              <th style={{ width: "20%", borderBottom: "1px solid #ddd", padding: "8px", textAlign: "left" }}> Version </th>
                                              <th style={{ width: "25%", borderBottom: "1px solid #ddd", padding: "8px", textAlign: "left" }}> Uploaded On </th>
                                            </tr>
                                          </thead>
                                          <tbody>
                                            {/* {groupedFiles[version].map((file, index) => ( */}
                                            <tr>
                                              {/* <td style={{ width: "15%", padding: "8px", borderBottom: "1px solid #ddd" }}> {index + 1} </td> */}
                                              <td style={{ width: "15%", padding: "8px", borderBottom: "1px solid #ddd" }}>
                                                <a onClick={(e) => { e.preventDefault(); handleFileDownload(version, 2); }} target="_blank" rel="noopener noreferrer" download style={{ cursor: "pointer" }}>
                                                  <div className="img-wrapper">
                                                    <Box sx={{ width: { lg: "45%", md: "45%", sm: "65%", xs: "85%" }, ml: { lg: 0, md: 0, sm: 0, xs: 0 } }}>
                                                      <img src={img1} style={{ width: "100%", height: "auto" }} alt="" />
                                                    </Box>
                                                  </div>
                                                </a>
                                              </td>
                                              <td style={{ width: "20%", padding: "8px", borderBottom: "1px solid #ddd" }}> {version} </td>
                                              {groupedFiles[version].slice(0, 1).map((file, index) => (
                                                <td style={{ width: "25%", padding: "8px", borderBottom: "1px solid #ddd" }}> {new Date(file.createdAt).toLocaleDateString("en-GB")} </td>
                                              ))}
                                            </tr>
                                            {/* ))} */}
                                          </tbody>
                                        </table>
                                      </div>
                                    </>
                                  ))}
                                  <Typography sx={{ marginBottom: 2, marginTop: 1, textDecoration: "underline" }}>
                                    <b>Previous files uploaded by the initiator :</b>
                                  </Typography>
                                  {Object.keys(groupedFiles1).map((version, tableIndex) => (
                                    <>
                                      <Typography sx={{ marginBottom: 2, textDecoration: "underline" }}>
                                        Version {version}:
                                      </Typography>
                                      <div style={{ overflowX: 'auto', width: '100%' }}>
                                        <table key={tableIndex} style={{ minWidth: isXs ? "200%" : "100%", borderCollapse: "collapse", marginBottom: "20px" }}>
                                          <thead>
                                            <tr>
                                              {/* <th style={{ width: "15%", borderBottom: "1px solid #ddd", padding: "8px", textAlign: "left" }}> S.no </th> */}
                                              <th style={{ width: "15%", borderBottom: "1px solid #ddd", padding: "8px", textAlign: "left" }}> Files </th>
                                              <th style={{ width: "20%", borderBottom: "1px solid #ddd", padding: "8px", textAlign: "left" }}> Version </th>
                                              <th style={{ width: "25%", borderBottom: "1px solid #ddd", padding: "8px", textAlign: "left" }}> Uploaded On </th>
                                            </tr>
                                          </thead>
                                          <tbody>
                                            {/* {groupedFiles1[version].map((file, index) => ( */}
                                            <tr>
                                              {/* <td style={{ width: "15%", padding: "8px", borderBottom: "1px solid #ddd" }}> {index + 1} </td> */}
                                              <td style={{ width: "15%", padding: "8px", borderBottom: "1px solid #ddd" }}>
                                                <a onClick={(e) => { e.preventDefault(); handleFileDownload(version, 1); }} target="_blank" rel="noopener noreferrer" download style={{ cursor: "pointer" }}>
                                                  <div className="img-wrapper">
                                                    <Box sx={{ width: { lg: "45%", md: "45%", sm: "65%", xs: "85%" }, ml: { lg: 0, md: 0, sm: 0, xs: 0 } }}>
                                                      <img src={img1} style={{ width: "100%", height: "auto" }} alt="" />
                                                    </Box>
                                                  </div>
                                                </a>
                                              </td>
                                              <td style={{ width: "20%", padding: "8px", borderBottom: "1px solid #ddd" }}> {version} </td>
                                              {groupedFiles1[version].slice(0, 1).map((file, index) => (
                                                <td style={{ width: "25%", padding: "8px", borderBottom: "1px solid #ddd" }}> {new Date(file.createdAt).toLocaleDateString("en-GB")} </td>
                                              ))}
                                            </tr>
                                            {/* ))} */}
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
                              {selectedDocument.version.endsWith(".0") && selectedDocument.pending_at_id === selectedDocument.initiator_id && (
                                <>
                                  <Typography sx={{ marginBottom: 2, marginTop: 1, textDecoration: "underline" }}>
                                    <b>Files sent for review :</b>
                                  </Typography>
                                  <div style={{ overflowX: 'auto', width: '100%' }}>
                                    <table style={{ minWidth: isXs ? "200%" : "100%", borderCollapse: "collapse", marginBottom: "20px" }}>
                                      <thead>
                                        <tr>
                                          {/* <th style={{ width: "15%", borderBottom: "1px solid #ddd", padding: "8px", textAlign: "left" }}> S.no </th> */}
                                          <th style={{ width: "15%", borderBottom: "1px solid #ddd", padding: "8px", textAlign: "left" }}> Files </th>
                                          <th style={{ width: "20%", borderBottom: "1px solid #ddd", padding: "8px", textAlign: "left" }}> Version </th>
                                          <th style={{ width: "25%", borderBottom: "1px solid #ddd", padding: "8px", textAlign: "left" }}> Uploaded On </th>
                                        </tr>
                                      </thead>
                                      <tbody>
                                        {/* {selectedDocument.policy_files.filter((file) => file.version === selectedDocument.version && file.type === 2).map((file, index) => ( */}
                                        <tr>
                                          {/* <td style={{ width: "15%", padding: "8px", borderBottom: "1px solid #ddd" }}> {index + 1} </td> */}
                                          <td style={{ width: "15%", padding: "8px", borderBottom: "1px solid #ddd" }}>
                                            <a onClick={(e) => { e.preventDefault(); handleFileDownload(selectedDocument.version, 2); }} target="_blank" rel="noopener noreferrer" download style={{ cursor: "pointer" }}>
                                              <div className="img-wrapper">
                                                <Box sx={{ width: { lg: "45%", md: "45%", sm: "65%", xs: "85%" }, ml: { lg: 0, md: 0, sm: 0, xs: 0 } }}>
                                                  <img src={img1} style={{ width: "100%", height: "auto" }} alt="" />
                                                </Box>
                                              </div>
                                            </a>
                                          </td>
                                          <td style={{ width: "20%", padding: "8px", borderBottom: "1px solid #ddd" }}> {selectedDocument.version} </td>
                                          {selectedDocument.policy_files.filter((file) => file.version === selectedDocument.version && file.type === 2).slice(0, 1).map((file, index) => (
                                            <td style={{ width: "25%", padding: "8px", borderBottom: "1px solid #ddd" }}> {new Date(file.createdAt).toLocaleDateString("en-GB")} </td>
                                          ))}
                                        </tr>
                                        {/* ))} */}
                                      </tbody>
                                    </table>
                                  </div>
                                </>
                              )}
                              {selectedDocument.version.endsWith(".0") && (
                                <>
                                  <Typography sx={{ marginBottom: 2, marginTop: 1, textDecoration: "underline" }}>
                                    <b>Files uploaded by initiator :</b>
                                  </Typography>
                                  <div style={{ overflowX: 'auto', width: '100%' }}>
                                    <table style={{ minWidth: isXs ? "200%" : "100%", borderCollapse: "collapse", marginBottom: "20px" }}>
                                      <thead>
                                        <tr>
                                          {/* <th style={{ width: "15%", borderBottom: "1px solid #ddd", padding: "8px", textAlign: "left" }}> S.no </th> */}
                                          <th style={{ width: "15%", borderBottom: "1px solid #ddd", padding: "8px", textAlign: "left" }}> Files </th>
                                          <th style={{ width: "20%", borderBottom: "1px solid #ddd", padding: "8px", textAlign: "left" }}> Version </th>
                                          <th style={{ width: "25%", borderBottom: "1px solid #ddd", padding: "8px", textAlign: "left" }}> Uploaded On </th>
                                        </tr>
                                      </thead>
                                      <tbody>
                                        {/* {selectedDocument.policy_files.filter((file) => file.version === selectedDocument.version && file.type === 1).map((file, index) => ( */}
                                        <tr>
                                          {/* <td style={{ width: "15%", padding: "8px", borderBottom: "1px solid #ddd" }}> {index + 1} </td> */}
                                          <td style={{ width: "15%", padding: "8px", borderBottom: "1px solid #ddd" }}>
                                            <a onClick={(e) => { e.preventDefault(); handleFileDownload(selectedDocument.version, 1); }} target="_blank" rel="noopener noreferrer" download style={{ cursor: "pointer" }}>
                                              <div className="img-wrapper">
                                                <Box sx={{ width: { lg: "45%", md: "45%", sm: "65%", xs: "85%" }, ml: { lg: 0, md: 0, sm: 0, xs: 0 } }}>
                                                  <img src={img1} style={{ width: "100%", height: "auto" }} alt="" />
                                                </Box>
                                              </div>
                                            </a>
                                          </td>
                                          <td style={{ width: "20%", padding: "8px", borderBottom: "1px solid #ddd" }}> {selectedDocument.version} </td>
                                          {selectedDocument.policy_files.filter((file) => file.version === selectedDocument.version && file.type === 1).slice(0, 1).map((file, index) => (
                                            <td style={{ width: "25%", padding: "8px", borderBottom: "1px solid #ddd" }}> {new Date(file.createdAt).toLocaleDateString("en-GB")} </td>
                                          ))}
                                        </tr>
                                        {/* ))} */}
                                      </tbody>
                                    </table>
                                  </div>
                                </>
                              )}
                              {!selectedDocument.version.endsWith(".0") && selectedDocument.pending_at_id === selectedDocument.initiator_id && (
                                <>
                                  <Typography sx={{ marginBottom: 2, marginTop: 1, textDecoration: "underline" }}>
                                    <b>Latest files sent for review :</b>
                                  </Typography>
                                  <div style={{ overflowX: 'auto', width: '100%' }}>
                                    <table style={{ minWidth: isXs ? "200%" : "100%", borderCollapse: "collapse", marginBottom: "20px" }}>
                                      <thead>
                                        <tr>
                                          {/* <th style={{ width: "15%", borderBottom: "1px solid #ddd", padding: "8px", textAlign: "left" }}> S.no </th> */}
                                          <th style={{ width: "15%", borderBottom: "1px solid #ddd", padding: "8px", textAlign: "left" }}> Files </th>
                                          <th style={{ width: "20%", borderBottom: "1px solid #ddd", padding: "8px", textAlign: "left" }}> Version </th>
                                          <th style={{ width: "25%", borderBottom: "1px solid #ddd", padding: "8px", textAlign: "left" }}> Uploaded On </th>
                                        </tr>
                                      </thead>
                                      <tbody>
                                        {/* {selectedDocument.policy_files.filter((file) => file.version === selectedDocument.version && file.type === 2).map((file, index) => ( */}
                                        <tr>
                                          {/* <td style={{ width: "15%", padding: "8px", borderBottom: "1px solid #ddd" }}> {index + 1} </td> */}
                                          <td style={{ width: "15%", padding: "8px", borderBottom: "1px solid #ddd" }}>
                                            <a onClick={(e) => { e.preventDefault(); handleFileDownload(selectedDocument.version, 2); }} target="_blank" rel="noopener noreferrer" download style={{ cursor: "pointer" }}>
                                              <div className="img-wrapper">
                                                <Box sx={{ width: { lg: "45%", md: "45%", sm: "65%", xs: "85%" }, ml: { lg: 0, md: 0, sm: 0, xs: 0 } }}>
                                                  <img src={img1} style={{ width: "100%", height: "auto" }} alt="" />
                                                </Box>
                                              </div>
                                            </a>
                                          </td>
                                          <td style={{ width: "20%", padding: "8px", borderBottom: "1px solid #ddd" }}> {selectedDocument.version} </td>
                                          {selectedDocument.policy_files.filter((file) => file.version === selectedDocument.version && file.type === 2).slice(0, 1).map((file, index) => (
                                            <td style={{ width: "25%", padding: "8px", borderBottom: "1px solid #ddd" }}> {new Date(file.createdAt).toLocaleDateString("en-GB")} </td>
                                          ))}
                                        </tr>
                                        {/* ))} */}
                                      </tbody>
                                    </table>
                                  </div>
                                </>
                              )}
                              {!selectedDocument.version.endsWith(".0") && (
                                <>
                                  <Typography sx={{ marginBottom: 2, marginTop: 1, textDecoration: "underline" }}>
                                    <b>Latest files uploaded by the initiator:</b>
                                  </Typography>
                                  <div style={{ overflowX: 'auto', width: '100%' }}>
                                    <table style={{ minWidth: isXs ? "200%" : "100%", borderCollapse: "collapse", marginBottom: "20px" }}>
                                      <thead>
                                        <tr>
                                          {/* <th style={{ width: "15%", borderBottom: "1px solid #ddd", padding: "8px", textAlign: "left" }}> S.no </th> */}
                                          <th style={{ width: "15%", borderBottom: "1px solid #ddd", padding: "8px", textAlign: "left" }}> Files </th>
                                          <th style={{ width: "20%", borderBottom: "1px solid #ddd", padding: "8px", textAlign: "left" }}> Version </th>
                                          <th style={{ width: "25%", borderBottom: "1px solid #ddd", padding: "8px", textAlign: "left" }}> Uploaded On </th>
                                        </tr>
                                      </thead>
                                      <tbody>
                                        {/* {selectedDocument.policy_files.filter((file) => file.version === selectedDocument.version && file.type === 1).map((file, index) => ( */}
                                        <tr>
                                          {/* <td style={{ width: "15%", padding: "8px", borderBottom: "1px solid #ddd" }}> {index + 1} </td> */}
                                          <td style={{ width: "15%", padding: "8px", borderBottom: "1px solid #ddd" }}>
                                            <a onClick={(e) => { e.preventDefault(); handleFileDownload(selectedDocument.version, 1); }} target="_blank" rel="noopener noreferrer" download style={{ cursor: "pointer" }}>
                                              <div className="img-wrapper">
                                                <Box sx={{ width: { lg: "45%", md: "45%", sm: "65%", xs: "85%" }, ml: { lg: 0, md: 0, sm: 0, xs: 0 } }}>
                                                  <img src={img1} style={{ width: "100%", height: "auto" }} alt="" />
                                                </Box>
                                              </div>
                                            </a>
                                          </td>
                                          <td style={{ width: "20%", padding: "8px", borderBottom: "1px solid #ddd" }}> {selectedDocument.version} </td>
                                          {selectedDocument.policy_files.filter((file) => file.version === selectedDocument.version && file.type === 1).slice(0, 1).map((file, index) => (
                                            <td style={{ width: "25%", padding: "8px", borderBottom: "1px solid #ddd" }}> {new Date(file.createdAt).toLocaleDateString("en-GB")} </td>
                                          ))}
                                        </tr>
                                        {/* ))} */}
                                      </tbody>
                                    </table>
                                  </div>
                                </>
                              )}
                              {!selectedDocument.version.endsWith(".0") && (
                                <>
                                  <Typography sx={{ marginBottom: 2, marginTop: 1, textDecoration: "underline" }}>
                                    <b>Previous files sent for review :</b>
                                  </Typography>
                                  {Object.keys(groupedFiles).map((version, tableIndex) => (
                                    <>
                                      <Typography sx={{ marginBottom: 2 }}>
                                        <b>Remarks - Version {version}:</b> <em>{remarksArray[tableIndex]}</em>
                                      </Typography>
                                      <div style={{ overflowX: 'auto', width: '100%' }}>
                                        <table key={tableIndex} style={{ minWidth: isXs ? "200%" : "100%", borderCollapse: "collapse", marginBottom: "20px" }}>
                                          <thead>
                                            <tr>
                                              {/* <th style={{ width: "15%", borderBottom: "1px solid #ddd", padding: "8px", textAlign: "left" }}> S.no </th> */}
                                              <th style={{ width: "15%", borderBottom: "1px solid #ddd", padding: "8px", textAlign: "left" }}> Files </th>
                                              <th style={{ width: "20%", borderBottom: "1px solid #ddd", padding: "8px", textAlign: "left" }}> Version </th>
                                              <th style={{ width: "25%", borderBottom: "1px solid #ddd", padding: "8px", textAlign: "left" }}> Uploaded On </th>
                                            </tr>
                                          </thead>
                                          <tbody>
                                            {/* {groupedFiles[version].map((file, index) => ( */}
                                            <tr>
                                              {/* <td style={{ width: "15%", padding: "8px", borderBottom: "1px solid #ddd" }}> {index + 1} </td> */}
                                              <td style={{ width: "15%", padding: "8px", borderBottom: "1px solid #ddd" }}>
                                                <a onClick={(e) => { e.preventDefault(); handleFileDownload(version, 2); }} target="_blank" rel="noopener noreferrer" download style={{ cursor: "pointer" }}>
                                                  <div className="img-wrapper">
                                                    <Box sx={{ width: { lg: "45%", md: "45%", sm: "65%", xs: "85%" }, ml: { lg: 0, md: 0, sm: 0, xs: 0 } }}>
                                                      <img src={img1} style={{ width: "100%", height: "auto" }} alt="" />
                                                    </Box>
                                                  </div>
                                                </a>
                                              </td>
                                              <td style={{ width: "20%", padding: "8px", borderBottom: "1px solid #ddd" }}> {version} </td>
                                              {groupedFiles[version].slice(0, 1).map((file, index) => (
                                                <td style={{ width: "25%", padding: "8px", borderBottom: "1px solid #ddd" }}> {new Date(file.createdAt).toLocaleDateString("en-GB")} </td>
                                              ))}
                                            </tr>
                                            {/* ))} */}
                                          </tbody>
                                        </table>
                                      </div>
                                    </>
                                  ))}
                                  <Typography sx={{ marginBottom: 2, marginTop: 1, textDecoration: "underline" }}>
                                    <b>Previous files uploaded by the initiator :</b>
                                  </Typography>
                                  {Object.keys(groupedFiles1).map((version, tableIndex) => (
                                    <>
                                      <Typography sx={{ marginBottom: 2, textDecoration: "underline" }}>
                                        Version {version}:
                                      </Typography>
                                      <div style={{ overflowX: 'auto', width: '100%' }}>
                                        <table key={tableIndex} style={{ minWidth: isXs ? "200%" : "100%", borderCollapse: "collapse", marginBottom: "20px" }}>
                                          <thead>
                                            <tr>
                                              {/* <th style={{ width: "15%", borderBottom: "1px solid #ddd", padding: "8px", textAlign: "left" }}> S.no </th> */}
                                              <th style={{ width: "15%", borderBottom: "1px solid #ddd", padding: "8px", textAlign: "left" }}> Files </th>
                                              <th style={{ width: "20%", borderBottom: "1px solid #ddd", padding: "8px", textAlign: "left" }}> Version </th>
                                              <th style={{ width: "25%", borderBottom: "1px solid #ddd", padding: "8px", textAlign: "left" }}> Uploaded On </th>
                                            </tr>
                                          </thead>
                                          <tbody>
                                            {/* {groupedFiles1[version].map((file, index) => ( */}
                                            <tr>
                                              {/* <td style={{ width: "15%", padding: "8px", borderBottom: "1px solid #ddd" }}> {index + 1} </td> */}
                                              <td style={{ width: "15%", padding: "8px", borderBottom: "1px solid #ddd" }}>
                                                <a onClick={(e) => { e.preventDefault(); handleFileDownload(version, 1); }} target="_blank" rel="noopener noreferrer" download style={{ cursor: "pointer" }}>
                                                  <div className="img-wrapper">
                                                    <Box sx={{ width: { lg: "45%", md: "45%", sm: "65%", xs: "85%" }, ml: { lg: 0, md: 0, sm: 0, xs: 0 } }}>
                                                      <img src={img1} style={{ width: "100%", height: "auto" }} alt="" />
                                                    </Box>
                                                  </div>
                                                </a>
                                              </td>
                                              <td style={{ width: "20%", padding: "8px", borderBottom: "1px solid #ddd" }}> {version} </td>
                                              {groupedFiles1[version].slice(0, 1).map((file, index) => (
                                                <td style={{ width: "25%", padding: "8px", borderBottom: "1px solid #ddd" }} > {new Date(file.createdAt).toLocaleDateString("en-GB")} </td>
                                              ))}
                                            </tr>
                                            {/* ))} */}
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
                            <TableCell sx={{ pl: 2, verticalAlign: "top" }}>
                              <div style={{ overflowX: 'auto', width: '100%' }}>
                                <table style={{ minWidth: isXs ? "200%" : "100%", borderCollapse: "collapse", marginBottom: "20px" }}>
                                  <thead>
                                    <tr>
                                      {/* <th style={{ width: "15%", borderBottom: "1px solid #ddd", padding: "8px", textAlign: "left" }}> S.no </th> */}
                                      <th style={{ width: "15%", borderBottom: "1px solid #ddd", padding: "8px", textAlign: "left" }}> File </th>
                                      <th style={{ width: "20%", borderBottom: "1px solid #ddd", padding: "8px", textAlign: "left" }}> Version </th>
                                      <th style={{ width: "25%", borderBottom: "1px solid #ddd", padding: "8px", textAlign: "left" }}> Uploaded On </th>
                                    </tr>
                                  </thead>
                                  <tbody>
                                    {/* {selectedDocument.policy_files.map((file, index) => ( */}
                                    <tr>
                                      {/* <td style={{ width: "15%", padding: "8px", borderBottom: "1px solid #ddd" }}> {index + 1} </td> */}
                                      <td style={{ width: "15%", padding: "8px", borderBottom: "1px solid #ddd" }}>
                                        <a onClick={(e) => { e.preventDefault(); handleFileDownload("", null); }} target="_blank" rel="noopener noreferrer" download style={{ cursor: "pointer" }}>
                                          <div className="img-wrapper">
                                            <Box sx={{ width: { lg: "45%", md: "45%", sm: "65%", xs: "85%" }, ml: { lg: 0, md: 0, sm: 0, xs: 0 } }}>
                                              <img src={img1} style={{ width: "100%", height: "auto" }} alt="" />
                                            </Box>
                                          </div>
                                        </a>
                                      </td>
                                      <td style={{ width: "20%", padding: "8px", borderBottom: "1px solid #ddd" }}> {selectedDocument.version} </td>
                                      {selectedDocument.policy_files.map((file, index) => (
                                        <td style={{ width: "25%", padding: "8px", borderBottom: "1px solid #ddd" }}> {new Date(file.createdAt).toLocaleDateString("en-GB")} </td>
                                      ))}
                                    </tr>
                                    {/* ))} */}
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
            <Dialog open={openDialog} onClose={handleCloseDialog}>
              <DialogTitle>Confirm Deletion</DialogTitle>
              <DialogContent>
                <DialogContentText>
                  Are you sure you want to delete this document?
                </DialogContentText>
              </DialogContent>
              <DialogActions>
                <Button onClick={handleCloseDialog} color="primary">
                  No
                </Button>
                <Button onClick={handleConfirmDelete} color="primary">
                  Yes
                </Button>
              </DialogActions>
            </Dialog>
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
                            <MenuItem value="activate">Activate</MenuItem>
                            <MenuItem value="deprecate">Deprecate</MenuItem>
                          </StyledSelect>
                        </Box>
                      )}
                      {(selectedDocument.status == 1 || selectedDocument.status == 3) && (
                        <Grid container justifyContent="center" sx={{ mt: 2, mb: 2 }}>
                          <Grid item>
                            <Button type="submit" disabled={isBtnDisabled} variant="contained" sx={{ padding: "6px 16px", fontSize: "0.875rem", minHeight: "24px", lineHeight: 1, backgroundColor: "#ee8812", "&:hover": { backgroundColor: "rgb(249, 83, 22)" } }}>
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
