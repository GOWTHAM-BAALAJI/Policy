import React, { useState, useEffect } from "react";
import axios from "axios";
import {
  Box,
  Button,
  Card,
  CardContent,
  Checkbox,
  Divider,
  Grid,
  Icon,
  MenuItem,
  ListItemText,
  ListSubheader,
  Paper,
  Select,
  Table,
  styled,
  TableRow,
  TableBody,
  TableCell,
  TableHead,
  TableContainer,
  TextField,
  IconButton,
  TablePagination,
  Typography
} from "@mui/material";
import { jwtDecode } from "jwt-decode";
import InsertDriveFileIcon from "@mui/icons-material/InsertDriveFile";
import { useLocation, useParams } from "react-router-dom";
import { useForm, Controller } from "react-hook-form";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import CloseIcon from "@mui/icons-material/Close";
import toast from "react-hot-toast";
import img1 from "../../../assets/download_file_icon.png";

const ContentBox = styled("div")(({ theme }) => ({
  margin: "20px",
  [theme.breakpoints.down("sm")]: { margin: "16px" }
}));

const StyledTextField = styled(TextField)(() => ({
  width: "100%",
  marginBottom: "16px",
  "& .MuiInputLabel-root": {
    textAlign: "center",
    position: "absolute",
    top: "50%",
    left: "10px",
    transform: "translateY(-50%)",
    fontFamily: "sans-serif",
    fontSize: "0.875rem",
    transition: "top 0.2s ease-out, font-size 0.2s ease-out"
  },
  "& .MuiInputLabel-shrink": {
    top: "2px", // Adjust this value to move the label to the border of the box outline
    fontSize: "0.75rem" // Optional: Reduce font size when the label is shrunk
  },
  "& .MuiInputBase-root": {
    height: 30, // Adjust the height as needed
    fontFamily: "sans-serif",
    fontSize: "0.875rem",
    backgroundColor: "transparent" // Default background color
  },

  "& .MuiOutlinedInput-root": {
    position: "relative" // Ensure the label is positioned relative to the input
  },

  "& .MuiInputBase-input": {
    backgroundColor: "transparent", // Input remains transparent
    height: "100%", // Ensure input takes full height
    boxSizing: "border-box"
  }
}));

const StyledSelect = styled(Select)(() => ({
  width: "100%",
  height: "30px", // Ensure the select component itself has a defined height
  fontFamily: "sans-serif",
  fontSize: "0.875rem",
  "& .MuiInputBase-root": {
    height: "30px", // Apply the height to the input base
    alignItems: "center", // Align the content vertically
    fontFamily: "sans-serif",
    fontSize: "1.10rem"
  },
  "& .MuiInputLabel-root": {
    lineHeight: "30px", // Set the line height to match the height of the input
    top: "40", // Align the label at the top of the input
    transform: "none", // Ensure there's no unwanted transformation
    left: "20px", // Add padding for better spacing
    fontFamily: "sans-serif",
    fontSize: "0.875rem"
  },
  "& .MuiInputLabel-shrink": {
    top: "-6px" // Move the label when focused or with content
  }
}));

export default function PolicyDetails() {
  const { control } = useForm();
  const navigate = useNavigate();
  const { id } = useParams();
  const location = useLocation();
  const { title, status, activeTab } = location.state || {};

  const getDisplayPolicyId = (policy_id) => {
    return "PL" + String(policy_id).padStart(7, "0");
  };

  // const reviewersOptions = [
  //     { value:'572', label: 'testUser2' }
  // ]

  // const approvalMembersOptions = [
  //     { value: '573', label: 'testUser3' },
  //     { value: '574', label: 'testUser4' },
  //     { value: '575', label: 'testUser5' },
  // ];

  // const userGroupOptions = [
  //   { value: "1", label: "HO Staff" },
  //   { value: "2", label: "Field Staff" }
  // ];

  const [userId, setUserId] = useState(null);
  const [roleId, setRoleId] = useState(null);

  const [reviewersOptions, setReviewersOptions] = useState([]);
  const [approvalMembersOptions, setApprovalMembersOptions] = useState([]);
  const [userGroupOptions, setUserGroupOptions] = useState([]);
  const [categorizedUserGroupOptions, setCategorizedUserGroupOptions] = useState({});
  const [sortColumn, setSortColumn] = useState(""); // Column being sorted
  const [sortDirection, setSortDirection] = useState("asc");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedRow, setSelectedRow] = useState(null);
  const [selectedDocument, setSelectedDocument] = useState(null);
  const [selectedDocumentTitle, setSelectedDocumentTitle] = useState(null);

  const [documentID, setDocumentID] = useState(selectedDocument?.id || "");
  const [documentStatus, setDocumentStatus] = useState(null);
  const [documentTitle, setDocumentTitle] = useState(selectedDocument?.title || "");
  const [documentDescription, setDocumentDescription] = useState(
    selectedDocument?.description || ""
  );
  const [selectedReviewer, setSelectedReviewer] = useState(selectedDocument?.reviewer_id || "");
  const [approvalMembersWithPriority, setApprovalMembersWithPriority] = useState([]);
  const [selectedApprovalMembers, setSelectedApprovalMembers] = useState([]);
  const [useDefaultValue, setUseDefaultValue] = useState(true);
  const [priorityOrder, setPriorityOrder] = useState([]);

  const userToken = useSelector((state) => {
    return state.token; //.data;
  });

  useEffect(() => {
    if (selectedDocument) {
      console.log("Selected document: ", selectedDocument);
      setDocumentID(selectedDocument.id || "");
      setDocumentTitle(selectedDocument.title);
      setDocumentDescription(selectedDocument.description);
      setSelectedReviewer(selectedDocument.reviewer_id || "");
      if (Array.isArray(selectedDocument.Policy_status)) {
        const approvalMembers = selectedDocument.Policy_status.filter(
          (member) => member.priority > 2
        ).map((member) => ({
          value: member.approver_id,
          priority: member.priority - 2,
          label: member.approver_details.emp_name
        }));

        const sortedMembers = approvalMembers.sort((a, b) => a.priority - b.priority);

        setApprovalMembersWithPriority(sortedMembers);

        const initiallySelected = sortedMembers
          .filter(
            (member) =>
              selectedDocument.approvers && selectedDocument.approvers.includes(member.value)
          )
          .map((member) => member.value);

        setSelectedApprovalMembers(initiallySelected);
        setPriorityOrder(initiallySelected);
      } else {
        console.error(
          "Policy_status is not defined or not an array",
          selectedDocument.Policy_status
        );
      }
    }
  }, [selectedDocument]);

  useEffect(() => {
    // Fetch reviewers from the API
    axios
      .get("https://policyuat.spandanasphoorty.com/policy_apis/auth/getReviewer", {
        headers: {
          Authorization: `Bearer ${userToken}` // Include the JWT token in the Authorization header
        }
      })
      .then((response) => {
        if (response.data.status) {
          // Map the API response to format for dropdown (using emp_name as label and user_id as value)
          const fetchedReviewers = response.data.data.map((reviewer) => ({
            value: reviewer.user_id,
            label: reviewer.emp_name
          }));
          setReviewersOptions(fetchedReviewers);
        }
      })
      .catch((error) => {
        console.error("Error fetching reviewers:", error);
      });
  }, []);

  useEffect(() => {
    // Fetch reviewers from the API
    axios
      .get("https://policyuat.spandanasphoorty.com/policy_apis/auth/getApprover", {
        headers: {
          Authorization: `Bearer ${userToken}` // Include the JWT token in the Authorization header
        }
      })
      .then((response) => {
        if (response.data.status) {
          // Map the API response to format for dropdown (using emp_name as label and user_id as value)
          const fetchedApprovalMembers = response.data.data.map((approvalmember) => ({
            value: approvalmember.user_id,
            label: approvalmember.emp_name
          }));
          setApprovalMembersOptions(fetchedApprovalMembers);
        }
      })
      .catch((error) => {
        console.error("Error fetching reviewers:", error);
      });
  }, []);

  useEffect(() => {
    axios
      .get("https://policyuat.spandanasphoorty.com/policy_apis/auth/get-user-groups", {
        headers: {
          Authorization: `Bearer ${userToken}`
        }
      })
      .then((response) => {
        if (response.data.status) {
          const fetchedUserGroups = response.data.data.map((usergroup) => ({
            value: usergroup.value,
            label: usergroup.user_group,
            category: usergroup.category
          }));

          // Categorize user groups
          const categorizedGroups = fetchedUserGroups.reduce((acc, usergroup) => {
            const { category } = usergroup;
            if (!acc[category]) {
              acc[category] = [];
            }
            acc[category].push(usergroup);
            return acc;
          }, {});

          // Set the state for both user group options and categorized user group options
          setUserGroupOptions(fetchedUserGroups);
          setCategorizedUserGroupOptions(categorizedGroups);

          console.log("Fetched user groups from useEffect: ", fetchedUserGroups);
          console.log("Categorized user groups: ", categorizedGroups);
        }
      })
      .catch((error) => {
        console.error("Error fetching user groups:", error);
      });
  }, [userToken]);

  const [decision, setDecision] = useState("");
  const [documentDecision, setDocumentDecision] = useState("");

  const pendingApprover = selectedDocument?.Policy_status?.find(
    (status) => status.approver_id === selectedDocument?.pending_at_id
  );

  // If pendingApprover is not found and pending_at_id is equal to initiator_id, set name to initiator's name
  const pendingApproverName = pendingApprover
    ? pendingApprover.approver_details?.emp_name
    : selectedDocument?.pending_at_id === selectedDocument?.initiator_id
    ? "Initiator"
    : "No pending approver";

  const latestPolicyStatus = selectedDocument?.Policy_status?.filter(
    (status) => status.decision !== 0
  ).sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt))[0];

  const latestPolicyLogEntry = selectedDocument?.Policy_status_log?.find(
    (log) =>
      log.approver_id === latestPolicyStatus?.approver_id && // Check latestPolicyStatus for null/undefined
      log.activity === latestPolicyStatus?.decision // Assuming decision corresponds to activity
  );

  // Check if both are not null
  const latest_remarks =
    latestPolicyLogEntry && latestPolicyLogEntry.approver_id === latestPolicyStatus?.approver_id
      ? latestPolicyLogEntry.remarks.split(":")[1]
      : null;

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

  const isAdmin = (role_id) => {
    let temp = Number(role_id);
    const bin = temp.toString(2);
    return bin[bin.length - 4] == "1";
  };

  useEffect(() => {
    fetchDocumentDetails(id);
  }, [id]);

  // useEffect(() => {
  //     if (activeTab) {
  //         fetchDocumentDetails(activeTab); // Replace with your API call to fetch data
  //     }
  // }, [activeTab]);

  const fetchDocumentDetails = async (documentId) => {
    setLoading(true); // Start loading
    setError(null); // Reset error

    try {
      const response = await fetch(`https://policyuat.spandanasphoorty.com/policy_apis/policy/${documentId}`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${userToken}` // Include JWT token in the headers
        }
      });
      const data = await response.json();
      setSelectedDocument(data.data); // Set the document data
      const decodedToken = jwtDecode(userToken);
      if (decodedToken.role_id) {
        setRoleId(decodedToken.role_id);
      }
      if (decodedToken.user_id) {
        setUserId(decodedToken.user_id);
      }
    } catch (err) {
      setError("Failed to fetch document details.");
    } finally {
      setLoading(false); // End loading
    }
  };

  const handleBackClick = () => {
    navigate(-1); // Navigates to the previous page
  };

  const [isBtnDisabled, setIsBtnDisabled] = useState(false);

  const handleSubmit = async (event) => {
    event.preventDefault();
    setLoading(true);

    setIsBtnDisabled(true);

    // const mappedDecision = mapDecisionToNumber(decision);

    const url = documentDecision == "activate" ? "https://policyuat.spandanasphoorty.com/policy_apis/admin/depricate-policy" : "https://policyuat.spandanasphoorty.com/policy_apis/admin/reactivate-policy";

    const formData = {
        id: documentID
    }
    const submitForm = fetch(url, {
      method: "POST",
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${userToken}` // Example header for token authentication
      },
      body: JSON.stringify(formData),
    })
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
        setLoading(false); // Reset loading state
      })
      .catch((error) => {
        console.error("Submission error:", error);
        setIsBtnDisabled(false);
        setLoading(false); // Reset loading state
        throw error;
      });

    toast.promise(submitForm, {
      loading: "Updating...",
      success: (data) => `Decision updated successfully`, // Adjust based on your API response
      error: (err) => `Error while updating the decision`
    });
  };

  return (
    <ContentBox className="analytics">
      <Card sx={{ px: 3, py: 3, height: "100%", width: "100%" }}>
        {/* <form onSubmit={handleSubmit} encType="multipart/form-data"> */}
        <Grid container>
          <Grid item xs={12} display="flex" justifyContent="flex-end">
            <Button
              variant="contained"
              onClick={handleBackClick}
              sx={{
                marginRight: 2,
                marginTop: 2,
                height: "28px",
                backgroundColor: "#ee8812",
                "&:hover": { backgroundColor: "rgb(249, 83, 22)" }
              }}
            >
              Back
            </Button>
          </Grid>
        </Grid>
        <Grid container spacing={2} alignItems="flex-start">
          <Grid
            item
            lg={6}
            md={6}
            sm={12}
            xs={12}
            sx={{
              fontFamily: "sans-serif",
              fontSize: "0.875 rem",
              marginLeft: 2,
              marginTop: 2,
              marginRight: 2,
              paddingRight: "16px"
            }}
          >
            <Typography
              variant="h5"
              sx={{
                fontFamily: "sans-serif",
                fontSize: "1.4rem",
                fontWeight: "bold",
                marginBottom: 2,
                marginTop: -2,
                marginRight: 2
              }}
            >
              Document Details:
            </Typography>
            {selectedDocument && (
              <>
                <TableContainer component={Paper} sx={{ marginLeft: "0" }}>
                  <Table aria-label="data table">
                    <TableBody>
                      <TableRow>
                        <TableCell sx={{ pl: 2, width: "30%" }}>
                          <b>Document ID:</b>
                        </TableCell>
                        <TableCell sx={{ pl: 2, width: "70%" }}>
                          {getDisplayPolicyId(selectedDocument.id)}
                        </TableCell>
                      </TableRow>
                      <TableRow>
                        <TableCell sx={{ pl: 2 }}>
                          <b>Document Title:</b>
                        </TableCell>
                        <TableCell sx={{ pl: 2 }}>{selectedDocument.title}</TableCell>
                      </TableRow>
                      <TableRow>
                        <TableCell sx={{ pl: 2 }}>
                          <b>Document Description:</b>
                        </TableCell>
                        <TableCell sx={{ pl: 2 }}>{selectedDocument.description}</TableCell>
                      </TableRow>
                      {roleId !== 16 && (
                        <>
                          <TableRow>
                            <TableCell sx={{ pl: 2 }}>
                              <b>Initiator Name:</b>
                            </TableCell>
                            <TableCell sx={{ pl: 2 }}>
                              {selectedDocument.initiator_details?.emp_name}
                            </TableCell>
                          </TableRow>
                          <TableRow>
                            <TableCell sx={{ pl: 2 }}>
                              <b>Reviewer Name:</b>
                            </TableCell>
                            <TableCell sx={{ pl: 2 }}>
                              {selectedDocument.reviwer_details?.emp_name}
                            </TableCell>
                          </TableRow>
                          {selectedDocument.Policy_status.slice(1).map((approver, index) => (
                            <TableRow key={approver.approver_id}>
                              <TableCell sx={{ pl: 2 }}>
                                <b>Approver-{index + 1} Name:</b>
                              </TableCell>
                              <TableCell sx={{ pl: 2 }}>
                                {approver.approver_details?.emp_name}
                              </TableCell>
                            </TableRow>
                          ))}
                          <TableRow>
                            <TableCell sx={{ pl: 2 }}>
                              <b>Current Version:</b>
                            </TableCell>
                            <TableCell sx={{ pl: 2 }}>{selectedDocument.version}</TableCell>
                          </TableRow>
                        </>
                      )}
                      <TableRow>
                        <TableCell sx={{ pl: 2 }}>
                          <b>Status: </b>
                        </TableCell>
                        <TableCell sx={{ pl: 2 }}>
                          {{
                            0: "In Review",
                            1: "Approved",
                            2: "Rejected",
                            3: "Deprecated"
                          }[selectedDocument.status] || "Unknown"}
                        </TableCell>
                      </TableRow>
                      {selectedDocument.status == 0 ? (
                        <>
                          {selectedDocument.policy_files &&
                          Array.isArray(selectedDocument.policy_files) &&
                          selectedDocument.policy_files.length > 0 ? (
                            <>
                              {selectedDocument.pending_at_id === selectedDocument.initiator_id && (
                                <>
                                  <TableRow>
                                    <TableCell sx={{ pl: 2 }}>
                                      <b>Latest files received for changes</b>
                                    </TableCell>

                                    <TableCell sx={{ pl: 2 }}>
                                      <table style={{ width: "100%", borderCollapse: "collapse" }}>
                                        <thead>
                                          <tr>
                                            <th
                                              style={{
                                                width: "15%",
                                                borderBottom: "1px solid #ddd",
                                                padding: "8px",
                                                textAlign: "left"
                                              }}
                                            >
                                              S.no
                                            </th>
                                            <th
                                              style={{
                                                width: "20%",
                                                borderBottom: "1px solid #ddd",
                                                padding: "8px",
                                                textAlign: "left"
                                              }}
                                            >
                                              File
                                            </th>
                                            <th
                                              style={{
                                                width: "20%",
                                                borderBottom: "1px solid #ddd",
                                                padding: "8px",
                                                textAlign: "left"
                                              }}
                                            >
                                              Version
                                            </th>
                                            <th
                                              style={{
                                                width: "25%",
                                                borderBottom: "1px solid #ddd",
                                                padding: "8px",
                                                textAlign: "left"
                                              }}
                                            >
                                              Uploaded On
                                            </th>
                                          </tr>
                                        </thead>
                                        <tbody>
                                          {selectedDocument.policy_files
                                            .filter(
                                              (file) =>
                                                file.version === selectedDocument.version &&
                                                file.type === 2
                                            )
                                            .map((file, index) => (
                                              <tr key={index}>
                                                <td
                                                  style={{
                                                    width: "15%",
                                                    padding: "8px",
                                                    borderBottom: "1px solid #ddd"
                                                  }}
                                                >
                                                  {index + 1}
                                                </td>
                                                <td
                                                  style={{
                                                    width: "20%",
                                                    padding: "8px",
                                                    borderBottom: "1px solid #ddd"
                                                  }}
                                                >
                                                  <a
                                                    href={`https://policyuat.spandanasphoorty.com/policy_apis/policy_document/${file.file_name}`}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    download
                                                    style={{ cursor: "pointer" }}
                                                  >
                                                    <div className="img-wrapper">
                                                      <img src={img1} width="45%" alt="" />
                                                    </div>
                                                  </a>
                                                </td>
                                                <td
                                                  style={{
                                                    width: "20%",
                                                    padding: "8px",
                                                    borderBottom: "1px solid #ddd"
                                                  }}
                                                >
                                                  {file.version}
                                                </td>
                                                <td
                                                  style={{
                                                    width: "25%",
                                                    padding: "8px",
                                                    borderBottom: "1px solid #ddd"
                                                  }}
                                                >
                                                  {new Date(file.createdAt).toLocaleDateString(
                                                    "en-GB"
                                                  )}
                                                </td>
                                              </tr>
                                            ))}

                                          {/* If no files match, display a message */}
                                          {selectedDocument.policy_files.filter(
                                            (file) =>
                                              file.version === selectedDocument.version &&
                                              file.type === 2
                                          ).length === 0 && (
                                            <tr>
                                              <td
                                                colSpan="4"
                                                style={{ textAlign: "center", padding: "8px" }}
                                              >
                                                No file found for the selected version and type.
                                              </td>
                                            </tr>
                                          )}
                                        </tbody>
                                      </table>
                                    </TableCell>
                                  </TableRow>
                                </>
                              )}

                              <TableRow>
                                <TableCell sx={{ pl: 2 }}>
                                  <b>Latest files uploaded by the initiator</b>
                                </TableCell>
                                <TableCell sx={{ pl: 2 }}>
                                  <table style={{ width: "100%", borderCollapse: "collapse" }}>
                                    <thead>
                                      <tr>
                                        <th
                                          style={{
                                            width: "15%",
                                            borderBottom: "1px solid #ddd",
                                            padding: "8px",
                                            textAlign: "left"
                                          }}
                                        >
                                          S.no
                                        </th>
                                        <th
                                          style={{
                                            width: "20%",
                                            borderBottom: "1px solid #ddd",
                                            padding: "8px",
                                            textAlign: "left"
                                          }}
                                        >
                                          File
                                        </th>
                                        <th
                                          style={{
                                            width: "20%",
                                            borderBottom: "1px solid #ddd",
                                            padding: "8px",
                                            textAlign: "left"
                                          }}
                                        >
                                          Version
                                        </th>
                                        <th
                                          style={{
                                            width: "25%",
                                            borderBottom: "1px solid #ddd",
                                            padding: "8px",
                                            textAlign: "left"
                                          }}
                                        >
                                          Uploaded On
                                        </th>
                                      </tr>
                                    </thead>
                                    <tbody>
                                      {selectedDocument.policy_files
                                        .filter(
                                          (file) =>
                                            file.version === selectedDocument.version &&
                                            file.type === 1
                                        )
                                        .map((file, index) => (
                                          <tr key={index}>
                                            <td
                                              style={{
                                                width: "15%",
                                                padding: "8px",
                                                borderBottom: "1px solid #ddd"
                                              }}
                                            >
                                              {index + 1}
                                            </td>
                                            <td
                                              style={{
                                                width: "20%",
                                                padding: "8px",
                                                borderBottom: "1px solid #ddd"
                                              }}
                                            >
                                              <a
                                                href={`https://policyuat.spandanasphoorty.com/policy_apis/policy_document/${file.file_name}`}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                download
                                                style={{ cursor: "pointer" }}
                                              >
                                                <div className="img-wrapper">
                                                  <img src={img1} width="45%" alt="" />
                                                </div>
                                              </a>
                                            </td>
                                            <td
                                              style={{
                                                width: "20%",
                                                padding: "8px",
                                                borderBottom: "1px solid #ddd"
                                              }}
                                            >
                                              {file.version}
                                            </td>
                                            <td
                                              style={{
                                                width: "25%",
                                                padding: "8px",
                                                borderBottom: "1px solid #ddd"
                                              }}
                                            >
                                              {new Date(file.createdAt).toLocaleDateString("en-GB")}
                                            </td>
                                          </tr>
                                        ))}

                                      {/* Fallback message if no files match */}
                                      {selectedDocument.policy_files.filter(
                                        (file) =>
                                          file.version === selectedDocument.version &&
                                          file.type === 1
                                      ).length === 0 && (
                                        <tr>
                                          <td
                                            colSpan="4"
                                            style={{ textAlign: "center", padding: "8px" }}
                                          >
                                            No file found for the selected version and type.
                                          </td>
                                        </tr>
                                      )}
                                    </tbody>
                                  </table>
                                </TableCell>
                              </TableRow>
                            </>
                          ) : (
                            <Typography>No files uploaded</Typography>
                          )}
                        </>
                      ) : selectedDocument.status == 2 || selectedDocument.status == 3 ? (
                        <>
                          {selectedDocument.policy_files &&
                          Array.isArray(selectedDocument.policy_files) &&
                          selectedDocument.policy_files.length > 0 ? (
                            <>
                              <TableRow>
                                <TableCell sx={{ pl: 2 }}>
                                  <b>Received files</b>
                                </TableCell>
                                <TableCell>
                                  <table
                                    style={{
                                      width: "100%",
                                      borderCollapse: "collapse",
                                      marginBottom: "20px"
                                    }}
                                  >
                                    <thead>
                                      <tr>
                                        <th
                                          style={{
                                            width: "15%",
                                            borderBottom: "1px solid #ddd",
                                            padding: "8px",
                                            textAlign: "left"
                                          }}
                                        >
                                          S.no
                                        </th>
                                        <th
                                          style={{
                                            width: "20%",
                                            borderBottom: "1px solid #ddd",
                                            padding: "8px",
                                            textAlign: "left"
                                          }}
                                        >
                                          File
                                        </th>
                                        <th
                                          style={{
                                            width: "20%",
                                            borderBottom: "1px solid #ddd",
                                            padding: "8px",
                                            textAlign: "left"
                                          }}
                                        >
                                          Version
                                        </th>
                                        <th
                                          style={{
                                            width: "25%",
                                            borderBottom: "1px solid #ddd",
                                            padding: "8px",
                                            textAlign: "left"
                                          }}
                                        >
                                          Uploaded On
                                        </th>
                                      </tr>
                                    </thead>
                                    <tbody>
                                      {selectedDocument.policy_files
                                        .filter(
                                          (file) =>
                                            file.version === selectedDocument.version &&
                                            file.type === 1
                                        )
                                        .map((file, index) => (
                                          <tr key={index}>
                                            <td
                                              style={{
                                                width: "15%",
                                                padding: "8px",
                                                borderBottom: "1px solid #ddd"
                                              }}
                                            >
                                              {index + 1}
                                            </td>
                                            <td
                                              style={{
                                                width: "20%",
                                                padding: "8px",
                                                borderBottom: "1px solid #ddd"
                                              }}
                                            >
                                              <a
                                                href={`https://policyuat.spandanasphoorty.com/policy_apis/policy_document/${file.file_name}`}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                download
                                                style={{ cursor: "pointer" }}
                                              >
                                                <img src={img1} width="45%" alt="" />
                                              </a>
                                            </td>
                                            <td
                                              style={{
                                                width: "20%",
                                                padding: "8px",
                                                borderBottom: "1px solid #ddd"
                                              }}
                                            >
                                              {file.version}
                                            </td>
                                            <td
                                              style={{
                                                width: "25%",
                                                padding: "8px",
                                                borderBottom: "1px solid #ddd"
                                              }}
                                            >
                                              {new Date(file.createdAt).toLocaleDateString("en-GB")}
                                            </td>
                                          </tr>
                                        ))}
                                    </tbody>
                                  </table>
                                </TableCell>
                              </TableRow>
                            </>
                          ) : (
                            <Typography>No files uploaded</Typography>
                          )}
                        </>
                      ) : (
                        <>
                          <TableRow>
                            <TableCell sx={{ pl: 2 }}>
                              <b>Final files</b>
                            </TableCell>
                            <TableCell>
                              <table
                                style={{
                                  width: "100%",
                                  borderCollapse: "collapse",
                                  marginBottom: "20px"
                                }}
                              >
                                <thead>
                                  <tr>
                                    <th
                                      style={{
                                        width: "15%",
                                        borderBottom: "1px solid #ddd",
                                        padding: "8px",
                                        textAlign: "left"
                                      }}
                                    >
                                      S.no
                                    </th>
                                    <th
                                      style={{
                                        width: "20%",
                                        borderBottom: "1px solid #ddd",
                                        padding: "8px",
                                        textAlign: "left"
                                      }}
                                    >
                                      File
                                    </th>
                                    <th
                                      style={{
                                        width: "20%",
                                        borderBottom: "1px solid #ddd",
                                        padding: "8px",
                                        textAlign: "left"
                                      }}
                                    >
                                      Version
                                    </th>
                                    <th
                                      style={{
                                        width: "25%",
                                        borderBottom: "1px solid #ddd",
                                        padding: "8px",
                                        textAlign: "left"
                                      }}
                                    >
                                      Uploaded On
                                    </th>
                                  </tr>
                                </thead>
                                <tbody>
                                  {selectedDocument.policy_files.map((file, index) => (
                                    <tr key={index}>
                                      <td
                                        style={{
                                          width: "15%",
                                          padding: "8px",
                                          borderBottom: "1px solid #ddd"
                                        }}
                                      >
                                        {index + 1}
                                      </td>
                                      <td
                                        style={{
                                          width: "20%",
                                          padding: "8px",
                                          borderBottom: "1px solid #ddd"
                                        }}
                                      >
                                        <a
                                          href={`https://policyuat.spandanasphoorty.com/policy_apis/policy_document/${file.file_name}`}
                                          target="_blank"
                                          rel="noopener noreferrer"
                                          download
                                          style={{ cursor: "pointer" }}
                                        >
                                          <div className="img-wrapper">
                                            <img src={img1} width="45%" alt="" />
                                          </div>
                                        </a>
                                      </td>
                                      <td
                                        style={{
                                          width: "20%",
                                          padding: "8px",
                                          borderBottom: "1px solid #ddd"
                                        }}
                                      >
                                        {file.version}
                                      </td>
                                      <td
                                        style={{
                                          width: "25%",
                                          padding: "8px",
                                          borderBottom: "1px solid #ddd"
                                        }}
                                      >
                                        {new Date(file.createdAt).toLocaleDateString("en-GB")}
                                      </td>
                                    </tr>
                                  ))}
                                </tbody>
                              </table>
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
          {selectedDocument && (selectedDocument.status == 1 || selectedDocument.status == 3) && (
          <Grid
            item
            lg={5}
            md={5}
            sm={12}
            xs={12}
            sx={{
              fontFamily: "sans-serif",
              fontSize: "0.875 rem",
              marginLeft: 2,
              marginTop: 2,
              marginRight: 2
            }}
          >
            <div style={{ marginBottom: "16px" }}>
              <Typography
                variant="h5"
                sx={{
                  fontFamily: "sans-serif",
                  fontSize: "1.4rem",
                  fontWeight: "bold",
                  marginTop: -2,
                  marginRight: 2
                }}
              >
                Action:
              </Typography>
              <span style={{ fontSize: "0.7rem" }}>
                Fields marked with (<span style={{ color: "red" }}>*</span>) are mandatory
              </span>
            </div>
            <Typography variant="h8" sx={{ fontFamily: "sans-serif" }}>
              <strong>Current Status: </strong>{" "}
              {documentStatus === 1 ? "Active" : documentStatus === 3 ? "Deprecated" : "Unknown"}
            </Typography>

            {selectedDocument ? (
              <>
                <form onSubmit={handleSubmit} encType="multipart/form-data">
                  {/* <Box sx={{ width: '600px', margin: '0 auto',}}> */}
                  {(selectedDocument.status == 1 || selectedDocument.status == 3) && (
                      <Box sx={{ mt: 2 }}>
                        <Typography
                          variant="h8"
                          sx={{ fontFamily: "sans-serif", display: "block" }}
                        >
                          <b>
                            Decision <span style={{ color: "red" }}>*</span> :
                          </b>
                        </Typography>
                        <StyledSelect
                          value={decision}
                          onChange={handleDecisionChange}
                          // onBlur={handleBlur}
                          fullWidth
                          variant="outlined"
                          sx={{ mt: 1 }}
                        >
                          <MenuItem value="">
                            <em>None</em>
                          </MenuItem>
                          <MenuItem value="activate" disabled={documentDecision === "activate"}>Activate</MenuItem>
                          <MenuItem value="deprecate" disabled={documentDecision === "deprecate"}>Deprecate</MenuItem>
                        </StyledSelect>
                      </Box>
                    )}
                  {/* </Box> */}

                  {(selectedDocument.status == 1 || selectedDocument.status == 3) && (
                    <Grid container justifyContent="center" sx={{ mt: 2, mb: 2 }}>
                      <Grid item>
                        <Button
                          type="submit"
                          disabled={isBtnDisabled}
                          variant="contained"
                          sx={{
                            padding: "6px 16px",
                            fontSize: "0.875rem",
                            minHeight: "24px",
                            lineHeight: 1,
                            backgroundColor: "#ee8812",
                            "&:hover": { backgroundColor: "rgb(249, 83, 22)" }
                          }}
                        >
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
          </Grid>
          )}
        </Grid>
      </Card>
    </ContentBox>
  );
}
