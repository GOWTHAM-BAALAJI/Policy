import React, { useState, useEffect } from "react";
import { Box, Button, Card, Checkbox, Grid, MenuItem, ListItemText, Paper, Select, Table, styled, TableRow, TableBody, TableCell, TableContainer, TextField, IconButton, Typography } from "@mui/material";
import { jwtDecode } from "jwt-decode";
import { useLocation, useParams } from "react-router-dom";
import { useForm, Controller } from "react-hook-form";
import { useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import CloseIcon from "@mui/icons-material/Close";
import toast from "react-hot-toast";
import img1 from "../../../assets/download_file_icon.png";
import useCustomFetch from "../../../hooks/useFetchWithAuth";
import { useMediaQuery } from '@mui/material';

const ContentBox = styled("div")(({ theme }) => ({
  margin: "15px",
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
    top: "2px",
    fontSize: "0.75rem"
  },
  "& .MuiInputBase-root": {
    height: 30,
    fontFamily: "sans-serif",
    fontSize: "0.875rem",
    backgroundColor: "transparent"
  },

  "& .MuiOutlinedInput-root": {
    position: "relative"
  },

  "& .MuiInputBase-input": {
    backgroundColor: "transparent",
    height: "100%",
    boxSizing: "border-box"
  }
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
  const { control } = useForm();
  const navigate = useNavigate();
  const { id } = useParams();
  const location = useLocation();
  const { title, status, activeTab } = location.state || {};
  const customFetchWithAuth = useCustomFetch();
  const isXs = useMediaQuery((theme) => theme.breakpoints.down('sm'));
  const isMd = useMediaQuery((theme) => theme.breakpoints.down('md'));

  const getDisplayPolicyId = (policy_id) => {
    return "PL" + String(policy_id).padStart(7, "0");
  };

  const [userId, setUserId] = useState(null);
  const [roleId, setRoleId] = useState(null);
  const [reviewersOptions, setReviewersOptions] = useState([]);
  const [approvalMembersOptions, setApprovalMembersOptions] = useState([]);
  const [userGroupOptions, setUserGroupOptions] = useState([]);
  const [categorizedUserGroupOptions, setCategorizedUserGroupOptions] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedDocument, setSelectedDocument] = useState(null);
  const [documentID, setDocumentID] = useState(selectedDocument?.id || "");
  const [documentTitle, setDocumentTitle] = useState(selectedDocument?.title || "");
  const [documentDescription, setDocumentDescription] = useState(selectedDocument?.description || "");
  const [selectedReviewer, setSelectedReviewer] = useState(selectedDocument?.reviewer_id || "");
  const [approvalMembersWithPriority, setApprovalMembersWithPriority] = useState([]);
  const [selectedApprovalMembers, setSelectedApprovalMembers] = useState([]);
  const [useDefaultValue, setUseDefaultValue] = useState(true);
  const [priorityOrder, setPriorityOrder] = useState([]);
  const [selectedUserGroup, setSelectedUserGroup] = useState([]);
  const [selectedUserGroupSum, setSelectedUserGroupSum] = useState(0);
  const [userGroupStoreSum, setUserGroupStoreSum] = useState(0);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  const [filesCount, setFilesCount] = useState(0);

  useEffect(() => {
    if (selectedDocument?.status != 1) {
      let doc_version_count = parseInt(selectedDocument?.version.split(".")[1], 10);
      if (selectedDocument?.version === "1.0") {
        if (selectedDocument?.pending_at_id === selectedDocument?.initiator_id) {
          setFilesCount(2);
        } else {
          setFilesCount(1);
        }
      } else {
        if (selectedDocument?.pending_at_id === selectedDocument?.initiator_id) {
          setFilesCount((2 * doc_version_count) + 2);
        } else {
          setFilesCount((2 * doc_version_count) + 1);
        }
      }
    } else {
      setFilesCount(1);
    }
  }, [selectedDocument]);

  useEffect(() => {
    if (selectedDocument?.user_group && userGroupOptions.length > 0) {
      const initialSelectedGroups = userGroupOptions
        .filter((group) => selectedDocument.user_group[group.label] === 1)
        .map((group) => group.label);
      setSelectedUserGroup(initialSelectedGroups);
      const sum = initialSelectedGroups.reduce((acc, currentLabel) => {
        const group = userGroupOptions.find((group) => group.label === currentLabel);
        const groupValue = group ? group.value : 0;
        return acc + groupValue;
      }, 0);
      setSelectedUserGroupSum(sum);
    }
  }, [selectedDocument, userGroupOptions]);

  const handleSelectChange = (event) => {
    const value = event.target.value;
    const newSelectedGroups = Array.isArray(value) ? value : [value];
    const sum = newSelectedGroups.reduce((acc, currentLabel) => {
      const group = userGroupOptions.find((group) => group.label === currentLabel);
      const groupValue = group ? group.value : 0;
      return acc + groupValue;
    }, 0);
    setSelectedUserGroup(newSelectedGroups);
    setSelectedUserGroupSum(sum);
  };

  useEffect(() => {
    setUserGroupStoreSum(selectedUserGroupSum);
  }, [selectedUserGroupSum]);

  const userToken = useSelector((state) => {
    return state.token;
  });

  const filteredApprovalMembers = selectedReviewer ? approvalMembersOptions.filter((member) => member.value !== selectedReviewer) : approvalMembersOptions;
  const approvalMembers = approvalMembersWithPriority.map((member) => member.value.toString());

  const handleDropdownOpen = () => {
    setIsDropdownOpen(true);
  };

  const handleDropdownClose = () => {
    setIsDropdownOpen(false);
  };

  const handleSelectChangeApprovalMembers = (event) => {
    const { value } = event.target;
    const updatedSelection = Array.isArray(value) ? [...value] : [];
    const validatedSelection = updatedSelection
      .map((selectedValue) => {
        const member = approvalMembersOptions.find((m) => m.value === selectedValue);
        return member ? { value: selectedValue, label: member.label } : null;
      })
      .filter(Boolean);
    const newPriorityOrder = validatedSelection.map((member, index) => ({
      value: member.value,
      priority: index + 1,
      label: member.label
    }));
    setSelectedApprovalMembers(validatedSelection.map((member) => member.value));
    setApprovalMembersWithPriority(newPriorityOrder);
    setPriorityOrder(newPriorityOrder.map((member) => member.value));
    setUseDefaultValue(false);
  };

  useEffect(() => {
    if (selectedDocument) {
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
    const fetchReviewers = async () => {
      try {
        const response = await customFetchWithAuth(`${process.env.REACT_APP_POLICY_BACKEND}auth/getReviewer`, "GET", 1, {});
        const data = await response.json();
        if (data.status) {
          const fetchedReviewers = data.data.map((reviewer) => ({
            value: reviewer.user_id,
            label: reviewer.emp_name
          }));
          setReviewersOptions(fetchedReviewers);
        }
      } catch (error) {
        console.error('Error fetching data', error);
      } finally {
        setLoading(false);
      }
    };
    fetchReviewers();
  }, [userToken]);

  useEffect(() => {
    const fetchApprovers = async () => {
      try {
        const response = await customFetchWithAuth(`${process.env.REACT_APP_POLICY_BACKEND}auth/getApprover`, "GET", 1, {});
        const data = await response.json();
        if (data.status) {
          const fetchedApprovalMembers = data.data.map((approvalmember) => ({
            value: approvalmember.user_id,
            label: approvalmember.emp_name
          }));
          setApprovalMembersOptions(fetchedApprovalMembers);
        }
      } catch (error) {
        console.error('Error fetching data', error);
      } finally {
        setLoading(false);
      }
    };
    fetchApprovers();
  }, [userToken]);

  useEffect(() => {
    const fetchUserGroups = async () => {
      try {
        const response = await customFetchWithAuth(`${process.env.REACT_APP_POLICY_BACKEND}auth/get-user-groups`, "GET", 1, {});
        const data = await response.json();
        if (data.status) {
          const fetchedUserGroups = data.data.map((usergroup) => ({
            value: usergroup.value,
            label: usergroup.user_group,
            category: usergroup.category
          }));
          const categorizedGroups = fetchedUserGroups.reduce((acc, usergroup) => {
            const { category } = usergroup;
            if (!acc[category]) {
              acc[category] = [];
            }
            acc[category].push(usergroup);
            return acc;
          }, {});
          setUserGroupOptions(fetchedUserGroups);
          setCategorizedUserGroupOptions(categorizedGroups);
        }
      } catch (error) {
        console.error('Error fetching data', error);
      } finally {
        setLoading(false);
      }
    };
    fetchUserGroups();
  }, [userToken]);

  const [decision, setDecision] = useState("");
  const [remarks, setRemarks] = useState("");
  const [uploadedFile, setUploadedFile] = useState([]);
  const [uploadedFileName, setUploadedFileName] = useState([]);
  const [uploadedFile1, setUploadedFile1] = useState([]);
  const [uploadedFileName1, setUploadedFileName1] = useState([]);

  const mapDecisionToNumber = (decision) => {
    switch (decision) {
      case "approved":
        return 1;
      case "reviewraised":
        return 2;
      case "rejected":
        return 3;
      default:
        return "";
    }
  };

  const latestPolicyStatus = selectedDocument?.Policy_status?.filter((status) => status.decision !== 0).sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt))[0];
  const latestPolicyLogEntry = selectedDocument?.Policy_status_log?.find((log) => log.approver_id === latestPolicyStatus?.approver_id && log.activity === latestPolicyStatus?.decision);
  const latest_remarks = latestPolicyLogEntry && latestPolicyLogEntry.approver_id === latestPolicyStatus?.approver_id ? latestPolicyLogEntry.remarks.split(":")[1] : null;
  const rejected_by = latestPolicyLogEntry && (latestPolicyLogEntry.approver_id == latestPolicyStatus?.approver_id) ? latestPolicyStatus.approver_details.emp_name : null;

  const handleDecisionChange = (event) => {
    setDecision(event.target.value);
    if (event.target.value === "approved") {
      setRemarks("");
    }
  };

  const handleRemarksChange = (e) => {
    if (!(remarks === "" && e.target.value === " ")) setRemarks(e.target.value);
  };

  const handleFileUpload1 = (e) => {
    const files = Array.from(e.target.files);
    if (uploadedFile1.length + files.length > 10) {
      toast.error("You can only upload a maximum of 10 files.");
      return;
    }
    files.forEach((file) => {
      setUploadedFileName1((prev) => [...prev, file.name]);
      setUploadedFile1((prev) => [...prev, file]);
    });
  };

  const openUploadedFile1 = (index) => {
    const fileURL = URL.createObjectURL(uploadedFile1[index]);
    window.open(fileURL);
  };

  const handleRemoveFile1 = (index) => {
    setUploadedFileName1((prev) => prev.filter((_, i) => i !== index));
    setUploadedFile1((prev) => prev.filter((_, i) => i !== index));
  };

  const isInitiator = (role_id) => {
    let temp = Number(role_id);
    const bin = temp.toString(2);
    return bin[bin.length - 1] == "1";
  };

  const isReviewer = (role_id) => {
    let temp = Number(role_id);
    const bin = temp.toString(2);
    return bin[bin.length - 2] == "1";
  };

  const isApprover = (role_id) => {
    let temp = Number(role_id);
    const bin = temp.toString(2);
    return bin[bin.length - 3] == "1";
  };

  useEffect(() => {
    fetchDocumentDetails(id);
  }, [id]);

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

  const handleFileUpload = (e) => {
    const files = Array.from(e.target.files);
    if (uploadedFile.length + files.length > 10) {
      toast.error("You can only upload a maximum of 10 files.");
      return;
    }
    files.forEach((file) => {
      setUploadedFileName((prev) => [...prev, file.name]);
      setUploadedFile((prev) => [...prev, file]);
    });
  };

  const openUploadedFile = (index) => {
    const fileURL = URL.createObjectURL(uploadedFile[index]);
    window.open(fileURL);
  };

  const handleRemoveFile = (index) => {
    setUploadedFileName((prev) => prev.filter((_, i) => i !== index));
    setUploadedFile((prev) => prev.filter((_, i) => i !== index));
  };

  const handleBackClick = () => {
    navigate(-1);
  };

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

  const [isBtnDisabled, setIsBtnDisabled] = useState(false);

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
      const response = await customFetchWithAuth(url, "POST", 3, requestData);
      if (response.ok) {
        const blob = await response.blob();
        const link = document.createElement("a");
        const fileURL = window.URL.createObjectURL(blob);
        link.href = fileURL;
        link.download = `document-${documentID}.pdf`;
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

  const handleSubmit = async (event) => {
    event.preventDefault();
    setLoading(true);
    setIsBtnDisabled(true);
    const mappedDecision = mapDecisionToNumber(decision);
    if (isInitiator(roleId) && activeTab == 4) {
      if (selectedDocument.initiator_id === userId) {
        if (!documentTitle.trimStart() || !documentDescription.trimStart() || uploadedFile.length === 0 || !selectedReviewer || approvalMembers.length === 0 || (selectedUserGroup.length === 0 && selectedUserGroupSum === 0)) {
          toast.error("Please fill in all the required fields");
          setIsBtnDisabled(true);
          setTimeout(() => {
            setIsBtnDisabled(false);
          }, 4000);
          return;
        }
      } else {
        if (!mappedDecision) {
          toast.error("Please fill the decision");
          setIsBtnDisabled(true);
          setTimeout(() => {
            setIsBtnDisabled(false);
          }, 4000);
          return;
        } else {
          if (mappedDecision === 2) {
            if (!remarks.trimStart() || uploadedFile1.length === 0) {
              toast.error("Please fill the remarks and upload a file");
              setIsBtnDisabled(true);
              setTimeout(() => {
                setIsBtnDisabled(false);
              }, 4000);
              return;
            }
          } else if (mappedDecision === 3) {
            if (!remarks.trimStart()) {
              toast.error("Please fill the remarks");
              setIsBtnDisabled(true);
              setTimeout(() => {
                setIsBtnDisabled(false);
              }, 4000);
              return;
            }
          }
        }
      }
    }
    if ((isApprover(roleId) || isReviewer(roleId)) && selectedDocument.initiator_id !== userId && activeTab == 4) {
      if (!mappedDecision) {
        toast.error("Please fill the decision");
        setIsBtnDisabled(true);
        setTimeout(() => {
          setIsBtnDisabled(false);
        }, 4000);
        return;
      } else {
        if (mappedDecision === 2) {
          if (!remarks.trimStart() || uploadedFile1.length === 0) {
            toast.error("Please fill the remarks and upload a file");
            setIsBtnDisabled(true);
            setTimeout(() => {
              setIsBtnDisabled(false);
            }, 4000);
            return;
          }
        } else if (mappedDecision === 3) {
          if (!remarks.trimStart()) {
            toast.error("Please fill the remarks");
            setIsBtnDisabled(true);
            setTimeout(() => {
              setIsBtnDisabled(false);
            }, 4000);
            return;
          }
        }
      }
    }
    if (uploadedFile1.length > 10) {
      toast.error("You can upload a maximum of 10 files only");
      setIsBtnDisabled(true);
      setTimeout(() => {
        setIsBtnDisabled(false);
      }, 4000);
      return;
    }
    if (uploadedFile.length > 10) {
      toast.error("You can upload a maximum of 10 files only");
      setIsBtnDisabled(true);
      setTimeout(() => {
        setIsBtnDisabled(false);
      }, 4000);
      return;
    }
    const maxFileSizeMB = 5;
    const maxFileSizeBytes = maxFileSizeMB * 1024 * 1024;
    const oversizedFile1 = uploadedFile1.some((file) => file.size > maxFileSizeBytes);
    if (oversizedFile1) {
      toast.error(`Each file must be smaller than ${maxFileSizeMB} MB`);
      setIsBtnDisabled(true);
      setTimeout(() => {
        setIsBtnDisabled(false);
      }, 4000);
      return;
    }
    const oversizedFile = uploadedFile.some((file) => file.size > maxFileSizeBytes);
    if (oversizedFile) {
      toast.error(`Each file must be smaller than ${maxFileSizeMB} MB`);
      setIsBtnDisabled(true);
      setTimeout(() => {
        setIsBtnDisabled(false);
      }, 4000);
      return;
    }
    const isValidFileFormat1 = uploadedFile1.every(
      (file) => file.name.endsWith(".doc") || file.name.endsWith(".docx")
    );
    if (!isValidFileFormat1) {
      toast.error("Please upload only .doc or .docx files");
      setIsBtnDisabled(true);
      setTimeout(() => {
        setIsBtnDisabled(false);
      }, 4000);
      return;
    }
    const isValidFileFormat = uploadedFile.every(
      (file) => file.name.endsWith(".doc") || file.name.endsWith(".docx")
    );
    if (!isValidFileFormat) {
      toast.error("Please upload only .doc or .docx files");
      setIsBtnDisabled(true);
      setTimeout(() => {
        setIsBtnDisabled(false);
      }, 4000);
      return;
    }
    const url = `${process.env.REACT_APP_POLICY_BACKEND}policy/update`;
    const formData = new FormData();
    uploadedFile1.forEach((file) => {
      formData.append("files[]", file);
    });
    uploadedFile.forEach((file) => {
      formData.append("files[]", file);
    });
    formData.append("policy_id", selectedDocument.id);
    formData.append("decision", mappedDecision);
    formData.append("remarks", remarks.trimStart());
    formData.append("title", documentTitle.trimStart());
    formData.append("description", documentDescription.trimStart());
    formData.append("reviewer_id", selectedReviewer);
    formData.append(
      "approver_ids",
      JSON.stringify(approvalMembersWithPriority.map((member) => member.value.toString()))
    );
    formData.append("user_group", selectedUserGroupSum || 0);

    const submitForm = customFetchWithAuth(url, "POST", 3, formData)
      .then((response) => {
        if (!response.ok) {
          throw new Error(`Error: ${response.statusText}`);
        }
        return response.json();
      })
      .then((data) => {
        if (data.status) {
          setTimeout(() => {
            navigate("/list/psg");
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
    toast.promise(submitForm, {
      loading: "Saving...",
      success: (data) => `Response saved successfully`,
      error: (err) => `Error while filling the response`
    });
  };

  const handleTitleChange = (e) => {
    if (!(documentTitle === "" && e.target.value === " ")) setDocumentTitle(e.target.value);
  };

  const handleDescriptionChange = (e) => {
    if (!(documentDescription === "" && e.target.value === " "))
      setDocumentDescription(e.target.value);
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
                          <b>{selectedDocument.type == 1 ? 'Policy' : selectedDocument.type == 2 ? 'SOP' : 'Guidance Note'} ID:</b>
                        </TableCell>
                        <TableCell sx={{ pl: 2, width: { lg: "70%", md: "72%", sm: "80%", xs: "60%" }, verticalAlign: "top" }}>
                          {getDisplayPolicyId(selectedDocument.id)}
                        </TableCell>
                      </TableRow>
                      <TableRow>
                        <TableCell sx={{ pl: 2, width: { lg: "30%", md: "30%", sm: "20%", xs: "40%" }, verticalAlign: "top" }}>
                          <b>Title:</b>
                        </TableCell>
                        <TableCell sx={{ pl: 2, width: { lg: "70%", md: "70%", sm: "80%", xs: "60%" }, verticalAlign: "top" }}>{selectedDocument.title}</TableCell>
                      </TableRow>
                      <TableRow>
                        <TableCell sx={{ pl: 2, width: { lg: "30%", md: "30%", sm: "20%", xs: "40%" }, verticalAlign: "top" }}>
                          <b>Description:</b>
                        </TableCell>
                        <TableCell sx={{ pl: 2, width: { lg: "70%", md: "70%", sm: "80%", xs: "60%" }, verticalAlign: "top" }}>{selectedDocument.description}</TableCell>
                      </TableRow>
                      {roleId !== 16 && (
                        <>
                          <TableRow>
                            <TableCell sx={{ pl: 2, width: { lg: "30%", md: "30%", sm: "20%", xs: "40%" }, verticalAlign: "top" }}>
                              <b>Initiator :</b>
                            </TableCell>
                            <TableCell sx={{ pl: 2, width: { lg: "70%", md: "70%", sm: "80%", xs: "60%" }, verticalAlign: "top" }}>
                              {selectedDocument.initiator_details?.emp_name}
                            </TableCell>
                          </TableRow>
                          <TableRow>
                            <TableCell sx={{ pl: 2, width: { lg: "30%", md: "30%", sm: "20%", xs: "40%" }, verticalAlign: "top" }}>
                              <b>Reviewer :</b>
                            </TableCell>
                            <TableCell sx={{ pl: 2, width: { lg: "70%", md: "70%", sm: "80%", xs: "60%" }, verticalAlign: "top" }}>
                              {selectedDocument.reviwer_details?.emp_name}
                            </TableCell>
                          </TableRow>
                          {selectedDocument.Policy_status.slice(2).map((approver, index) => (
                            <TableRow key={approver.approver_id}>
                              <TableCell sx={{ pl: 2, width: { lg: "30%", md: "30%", sm: "20%", xs: "40%" }, verticalAlign: "top" }}>
                                <b>Approver-{index + 1} :</b>
                              </TableCell>
                              <TableCell sx={{ pl: 2, width: { lg: "70%", md: "70%", sm: "80%", xs: "60%" }, verticalAlign: "top" }}>
                                {approver.approver_details?.emp_name}
                              </TableCell>
                            </TableRow>
                          ))}
                          <TableRow>
                            <TableCell sx={{ pl: 2, width: { lg: "30%", md: "30%", sm: "20%", xs: "40%" }, verticalAlign: "top" }}>
                              <b>Current Version:</b>
                            </TableCell>
                            <TableCell sx={{ pl: 2, width: { lg: "70%", md: "70%", sm: "80%", xs: "60%" }, verticalAlign: "top" }}>{selectedDocument.version}</TableCell>
                          </TableRow>
                        </>
                      )}
                      {activeTab == 3 && roleId !== 16 && (
                        <>
                          <TableRow>
                            <TableCell sx={{ pl: 2, width: { lg: "30%", md: "30%", sm: "20%", xs: "40%" }, verticalAlign: "top" }}>
                              <b>Pending at:</b>
                            </TableCell>
                            <TableCell sx={{ pl: 2, width: { lg: "70%", md: "70%", sm: "80%", xs: "60%" }, verticalAlign: "top" }}>
                              {selectedDocument.pending_at_details?.emp_name}
                            </TableCell>
                          </TableRow>
                        </>
                      )}
                      {activeTab == 2 && selectedDocument.pending_at_id === null && roleId !== 16 && (
                        <>
                          <TableRow>
                            <TableCell sx={{ pl: 2, verticalAlign: "top" }}>
                              <b>Final Decision: </b>
                            </TableCell>
                            <TableCell sx={{ pl: 2, verticalAlign: "top" }}>Rejected</TableCell>
                          </TableRow>
                        </>
                      )}
                      {activeTab == 4 && (selectedDocument.pending_at_id === selectedDocument.initiator_id || selectedDocument.pending_at_id === null) && latestPolicyStatus && roleId !== 16 && (
                        <>
                          <TableRow>
                            <TableCell sx={{ pl: 2, verticalAlign: "top" }}>
                              <b>Latest policy status: </b>
                            </TableCell>
                            <TableCell sx={{ pl: 2, verticalAlign: "top" }}>
                              {latestPolicyStatus.decision === 1 ? "Approved" : latestPolicyStatus.decision === 2 ? "Sent for review" : latestPolicyStatus.decision === 3 ? "Rejected" : "Pending"}{" "} by {latestPolicyStatus.approver_details.emp_name}
                            </TableCell>
                          </TableRow>
                          <TableRow>
                            <TableCell sx={{ pl: 2, verticalAlign: "top" }}>
                              <b>Remarks: </b>
                            </TableCell>
                            <TableCell sx={{ pl: 2, verticalAlign: "top" }}>{latest_remarks}</TableCell>
                          </TableRow>
                        </>
                      )}
                      {(activeTab == 2 && selectedDocument.status == 2) && selectedDocument.pending_at_id === null && latestPolicyStatus && roleId !== 16 && (
                        <>
                          <TableRow>
                            <TableCell sx={{ pl: 2, width: { lg: "30%", md: "30%", sm: "20%", xs: "40%" }, verticalAlign: "top" }}>
                              <b>Remarks: </b>
                            </TableCell>
                            <TableCell sx={{ pl: 2, width: { lg: "70%", md: "70%", sm: "80%", xs: "60%" }, verticalAlign: "top" }}>{latest_remarks}</TableCell>
                          </TableRow>
                          <TableRow>
                            <TableCell sx={{ pl: 2, width: { lg: "30%", md: "30%", sm: "20%", xs: "40%" }, verticalAlign: "top" }}>
                              <b>Rejected by: </b>
                            </TableCell>
                            <TableCell sx={{ pl: 2, width: { lg: "70%", md: "70%", sm: "80%", xs: "60%" }, verticalAlign: "top" }}>{rejected_by}</TableCell>
                          </TableRow>
                        </>
                      )}
                      {activeTab == 4 && isInitiator(roleId) && selectedDocument.initiator_id === userId ? (
                        <>
                          {selectedDocument.policy_files && Array.isArray(selectedDocument.policy_files) && selectedDocument.policy_files.length > 0 ? (
                            <>
                              <TableRow>
                                <TableCell sx={{ pt: 3, pl: 2, verticalAlign: "top" }}>
                                  <b>Received for changes</b>
                                </TableCell>
                                <TableCell sx={{ pl: 2, verticalAlign: "top" }}>
                                  <div style={{ overflowX: 'auto', width: '100%' }}>
                                    <table style={{ minWidth: isXs ? "200%" : isMd ? "150%" : "100%", borderCollapse: "collapse" }}>
                                      <thead>
                                        <tr>
                                          {/* <th style={{ width: "15%", borderBottom: "1px solid #ddd", padding: "8px", textAlign: "left" }}> S.no </th> */}
                                          <th style={{ width: "15%", borderBottom: "1px solid #ddd", padding: "8px", textAlign: "left" }}> Files </th>
                                          <th style={{ width: "20%", borderBottom: "1px solid #ddd", padding: "8px", textAlign: "left" }}> Version </th>
                                          <th style={{ width: "25%", borderBottom: "1px solid #ddd", padding: "8px", textAlign: "left" }}> Uploaded On </th>
                                        </tr>
                                      </thead>
                                      <tbody>
                                        {/* {selectedDocument.policy_files.filter((file) => file.version === selectedDocument.version && file.type === 2).map((file) => ( */}
                                        <tr>
                                          {/* <td style={{ width: "15%", padding: "8px", borderBottom: "1px solid #ddd" }}>{1}</td> */}
                                          <td style={{ width: "15%", padding: "8px", borderBottom: "1px solid #ddd" }}>
                                            <a href="#" onClick={(e) => { e.preventDefault(); handleFileDownload(parseInt(selectedDocument.version.split(".")[1], 10), 2); }} target="_blank" rel="noopener noreferrer" download style={{ cursor: "pointer" }}>
                                              <div className="img-wrapper">
                                                <Box sx={{ width: { lg: "45%", md: "45%", sm: "45%", xs: "45%" }, ml: { lg: 0, md: 0, sm: 0, xs: 0 } }}>
                                                  {/* <img src={img1} style={{ width: "100%, height: "auto" }} alt="" /> */}
                                                  <img src={img1} style={{ width: "100%", height: "auto" }} />
                                                </Box>
                                              </div>
                                            </a>
                                          </td>
                                          <td style={{ width: "20%", padding: "8px", borderBottom: "1px solid #ddd" }}> {selectedDocument.version} </td>
                                          <td style={{ width: "25%", padding: "8px", borderBottom: "1px solid #ddd" }}> {new Date(selectedDocument.createdAt).toLocaleDateString("en-GB")} </td>
                                        </tr>
                                        {/* ))} */}
                                        {selectedDocument.policy_files.filter((file) => file.version === selectedDocument.version && file.type === 2).length === 0 && (
                                          <tr>
                                            <td colSpan="4" style={{ textAlign: "center", padding: "8px" }}> No file found for the selected version and type. </td>
                                          </tr>
                                        )}
                                      </tbody>
                                    </table>
                                  </div>
                                </TableCell>
                              </TableRow>
                              <TableRow>
                                <TableCell sx={{ pt: 3, pl: 2, verticalAlign: "top" }}>
                                  <b>Uploaded files</b>
                                </TableCell>
                                <TableCell sx={{ pl: 2, verticalAlign: "top" }}>
                                  <div style={{ overflowX: 'auto', width: '100%' }}>
                                    <table style={{ minWidth: isXs ? "200%" : isMd ? "150%" : "100%", borderCollapse: "collapse" }}>
                                      <thead>
                                        <tr>
                                          {/* <th style={{ width: "15%", borderBottom: "1px solid #ddd", padding: "8px", textAlign: "left" }}> S.no </th> */}
                                          <th style={{ width: "15%", borderBottom: "1px solid #ddd", padding: "8px", textAlign: "left" }}> Files </th>
                                          <th style={{ width: "20%", borderBottom: "1px solid #ddd", padding: "8px", textAlign: "left" }}> Version </th>
                                          <th style={{ width: "25%", borderBottom: "1px solid #ddd", padding: "8px", textAlign: "left" }}> Uploaded On </th>
                                        </tr>
                                      </thead>
                                      <tbody>
                                        {/* {selectedDocument.policy_files.filter((file) => file.version === selectedDocument.version && file.type === 1).map((file) => ( */}
                                        <tr>
                                          {/* <td style={{ width: "15%", padding: "8px", borderBottom: "1px solid #ddd" }}>{1}</td> */}
                                          <td style={{ width: "15%", padding: "8px", borderBottom: "1px solid #ddd" }}>
                                            <a href={`${process.env.REACT_APP_POLICY_BACKEND}policy_document`} target="_blank" rel="noopener noreferrer" download style={{ cursor: "pointer" }}>
                                              <div className="img-wrapper">
                                                <Box sx={{ width: { lg: "45%", md: "45%", sm: "45%", xs: "45%" }, ml: { lg: 0, md: 0, sm: 0, xs: 0 } }}>
                                                  {/* <img src={img1} style={{ width: "100%, height: "auto" }} alt="" /> */}
                                                  <img src={img1} style={{ width: "100%", height: "auto" }} />
                                                </Box>
                                              </div>
                                            </a>
                                          </td>
                                          <td style={{ width: "20%", padding: "8px", borderBottom: "1px solid #ddd" }}> {selectedDocument.version} </td>
                                          <td style={{ width: "25%", padding: "8px", borderBottom: "1px solid #ddd" }}> {new Date(selectedDocument.createdAt).toLocaleDateString("en-GB")} </td>
                                        </tr>
                                        {/* ))} */}
                                        {selectedDocument.policy_files.filter((file) => file.version === selectedDocument.version && file.type === 1).length === 0 && (
                                          <tr>
                                            <td colSpan="4" style={{ textAlign: "center", padding: "8px" }}> No file found for the selected version and type. </td>
                                          </tr>
                                        )}
                                      </tbody>
                                    </table>
                                  </div>
                                </TableCell>
                              </TableRow>
                              {selectedDocument.version !== "1.0" && (
                                <TableRow>
                                  <TableCell sx={{ pt: 3, pl: 2, verticalAlign: "top" }}>
                                    <b>Previous files</b>
                                  </TableCell>
                                  <TableCell sx={{ pl: 2, verticalAlign: "top" }}>
                                    {selectedDocument.version !== "1.0" && (
                                      <>
                                        <Typography sx={{ marginBottom: 2, marginTop: 1, textDecoration: "underline" }}>
                                          <b>Sent for review :</b>
                                        </Typography>
                                        {Object.keys(groupedFiles).map((version, tableIndex) => (
                                          <>
                                            <Typography sx={{ marginBottom: 2, textDecoration: "underline" }}>
                                              Remarks - Version {version}:
                                            </Typography>
                                            <Typography sx={{ marginBottom: 2 }}>
                                              <em>{remarksArray[tableIndex]}</em>
                                            </Typography>
                                            <div style={{ overflowX: 'auto', width: '100%' }}>
                                              <table key={tableIndex} style={{ minWidth: isXs ? "200%" : isMd ? "150%" : "100%", borderCollapse: "collapse", marginBottom: "20px" }}>
                                                <thead>
                                                  <tr>
                                                    {/* <th style={{ width: "15%", borderBottom: "1px solid #ddd", padding: "8px", textAlign: "left" }}> S.no </th> */}
                                                    <th style={{ width: "15%", borderBottom: "1px solid #ddd", padding: "8px", textAlign: "left" }}> Files </th>
                                                    <th style={{ width: "20%", borderBottom: "1px solid #ddd", padding: "8px", textAlign: "left" }}> Version </th>
                                                    <th style={{ width: "25%", borderBottom: "1px solid #ddd", padding: "8px", textAlign: "left" }}> Uploaded On </th>
                                                  </tr>
                                                </thead>
                                                <tbody>
                                                  {/* {groupedFiles[version].map((file) => ( */}
                                                  <tr>
                                                    {/* <td style={{ width: "15%", padding: "8px", borderBottom: "1px solid #ddd" }}> {index + 1} </td> */}
                                                    <td style={{ width: "15%", padding: "8px", borderBottom: "1px solid #ddd" }}>
                                                      <a href={`${process.env.REACT_APP_POLICY_BACKEND}policy_document`} target="_blank" rel="noopener noreferrer" download style={{ cursor: "pointer" }}>
                                                        <div className="img-wrapper">
                                                          <Box sx={{ width: { lg: "45%", md: "45%", sm: "45%", xs: "45%" }, ml: { lg: 0, md: 0, sm: 0, xs: 0 } }}>
                                                            <img src={img1} style={{ width: "100%", height: "auto" }} alt="" />
                                                          </Box>
                                                        </div>
                                                      </a>
                                                    </td>
                                                    <td style={{ width: "20%", padding: "8px", borderBottom: "1px solid #ddd" }}> {selectedDocument.version} </td>
                                                    <td style={{ width: "25%", padding: "8px", borderBottom: "1px solid #ddd" }}> {new Date(selectedDocument.createdAt).toLocaleDateString("en-GB")} </td>
                                                  </tr>
                                                  {/* ))} */}
                                                </tbody>
                                              </table>
                                            </div>
                                          </>
                                        ))}
                                        <Typography sx={{ marginBottom: 2, marginTop: 1, textDecoration: "underline" }}>
                                          <b>Uploaded by the initiator :</b>
                                        </Typography>
                                        {Object.keys(groupedFiles1).map((version, tableIndex) => (
                                          <>
                                            <Typography sx={{ marginBottom: 2, textDecoration: "underline" }}>
                                              Version {version}:
                                            </Typography>
                                            <div style={{ overflowX: 'auto', width: '100%' }}>
                                              <table style={{ minWidth: isXs ? "200%" : isMd ? "150%" : "100%", borderCollapse: "collapse", marginBottom: "20px" }}>
                                                <thead>
                                                  <tr>
                                                    {/* <th style={{ width: "15%", borderBottom: "1px solid #ddd", padding: "8px", textAlign: "left" }}> S.no </th> */}
                                                    <th style={{ width: "15%", borderBottom: "1px solid #ddd", padding: "8px", textAlign: "left" }}> File </th>
                                                    <th style={{ width: "20%", borderBottom: "1px solid #ddd", padding: "8px", textAlign: "left" }}> Version </th>
                                                    <th style={{ width: "25%", borderBottom: "1px solid #ddd", padding: "8px", textAlign: "left" }} > Uploaded On </th>
                                                  </tr>
                                                </thead>
                                                <tbody>
                                                  {/* {groupedFiles1[version].map((file) => ( */}
                                                  <tr>
                                                    {/* <td style={{ width: "15%", padding: "8px", borderBottom: "1px solid #ddd" }}> {index + 1} </td> */}
                                                    <td style={{ width: "15%", padding: "8px", borderBottom: "1px solid #ddd" }}>
                                                      <a href={`${process.env.REACT_APP_POLICY_BACKEND}policy_document`} target="_blank" rel="noopener noreferrer" download style={{ cursor: "pointer" }}>
                                                        <div className="img-wrapper">
                                                          <Box sx={{ width: { lg: "45%", md: "45%", sm: "45%", xs: "45%" }, ml: { lg: 0, md: 0, sm: 0, xs: 0 } }}>
                                                            <img src={img1} style={{ width: "100%", height: "auto" }} alt="" />
                                                          </Box>
                                                        </div>
                                                      </a>
                                                    </td>
                                                    <td style={{ width: "20%", padding: "8px", borderBottom: "1px solid #ddd" }}> {selectedDocument.version} </td>
                                                    <td style={{ width: "25%", padding: "8px", borderBottom: "1px solid #ddd" }}> {new Date(selectedDocument.createdAt).toLocaleDateString("en-GB")} </td>
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
                              )}
                            </>
                          ) : (
                            <Typography>No files uploaded</Typography>
                          )}
                        </>
                      ) : (activeTab == 4 || (selectedDocument.status != 1 && selectedDocument.status != 2)) && (isApprover(roleId) || isReviewer(roleId)) && (selectedDocument.reviewer_id === userId || selectedDocument.Policy_status.some((status) => status.approver_id === userId)) ? (
                        <>
                          {selectedDocument.policy_files && Array.isArray(selectedDocument.policy_files) && selectedDocument.policy_files.length > 0 ? (
                            <>
                              <TableRow>
                                <TableCell sx={{ pt: 3, pl: 2, verticalAlign: "top" }}>
                                  <b>Received files</b>
                                </TableCell>
                                <TableCell sx={{ pl: 2, verticalAlign: "top" }}>
                                  <div style={{ overflowX: 'auto', width: '100%' }}>
                                    <table style={{ minWidth: isXs ? "200%" : isMd ? "150%" : "100%", borderCollapse: "collapse", marginBottom: "20px" }}>
                                      <thead>
                                        <tr>
                                          {/* <th style={{ width: "15%", borderBottom: "1px solid #ddd", padding: "8px", textAlign: "left" }}> S.no </th> */}
                                          <th style={{ width: "15%", borderBottom: "1px solid #ddd", padding: "8px", textAlign: "left" }}> File </th>
                                          <th style={{ width: "20%", borderBottom: "1px solid #ddd", padding: "8px", textAlign: "left" }}> Version </th>
                                          <th style={{ width: "25%", borderBottom: "1px solid #ddd", padding: "8px", textAlign: "left" }}> Uploaded On </th>
                                        </tr>
                                      </thead>
                                      <tbody>
                                        {/* {selectedDocument.policy_files.filter((file) => file.version === selectedDocument.version && file.type === 1).map((file) => ( */}
                                        <tr>
                                          {/* <td style={{ width: "15%", padding: "8px", borderBottom: "1px solid #ddd" }}> {1} </td> */}
                                          <td style={{ width: "15%", padding: "8px", borderBottom: "1px solid #ddd" }}>
                                            <a href={`${process.env.REACT_APP_POLICY_BACKEND}policy_document`} target="_blank" rel="noopener noreferrer" download style={{ cursor: "pointer" }}>
                                              <div className="img-wrapper">
                                                <Box sx={{ width: { lg: "45%", md: "45%", sm: "45%", xs: "45%" }, ml: { lg: 0, md: 0, sm: 0, xs: 0 } }}>
                                                  <img src={img1} style={{ width: "100%", height: "auto" }} alt="" />
                                                </Box>
                                              </div>
                                            </a>
                                          </td>
                                          <td style={{ width: "20%", padding: "8px", borderBottom: "1px solid #ddd" }}> {selectedDocument.version} </td>
                                          <td style={{ width: "25%", padding: "8px", borderBottom: "1px solid #ddd" }}> {new Date(selectedDocument.createdAt).toLocaleDateString("en-GB")} </td>
                                        </tr>
                                        {/* ))} */}
                                      </tbody>
                                    </table>
                                  </div>
                                </TableCell>
                              </TableRow>
                              {selectedDocument.version !== "1.0" && (
                                <>
                                  <TableRow>
                                    <TableCell sx={{ pt: 3, pl: 2, verticalAlign: "top" }}>
                                      <b>Previous files</b>
                                    </TableCell>
                                    <TableCell sx={{ pl: 2, verticalAlign: "top" }}>
                                      {selectedDocument.version !== "1.0" && (
                                        <>
                                          <Typography sx={{ marginBottom: 2, marginTop: 1, textDecoration: "underline" }}><b>Sent for review :</b></Typography>
                                          {Object.keys(groupedFiles).map((version, tableIndex) => (
                                            <>
                                              <Typography sx={{ marginBottom: 2, textDecoration: "underline" }}>
                                                Remarks - Version {version}:
                                              </Typography>
                                              <Typography sx={{ marginBottom: 2 }}>
                                                <em>{remarksArray[tableIndex]}</em>
                                              </Typography>
                                              <div style={{ overflowX: 'auto', width: '100%' }}>
                                                <table key={tableIndex} style={{ minWidth: isXs ? "200%" : isMd ? "150%" : "100%", borderCollapse: "collapse", marginBottom: "20px" }}>
                                                  <thead>
                                                    <tr>
                                                      {/* <th style={{ width: "15%", borderBottom: "1px solid #ddd", padding: "8px", textAlign: "left" }}> S.no </th> */}
                                                      <th style={{ width: "15%", borderBottom: "1px solid #ddd", padding: "8px", textAlign: "left" }}> File </th>
                                                      <th style={{ width: "20%", borderBottom: "1px solid #ddd", padding: "8px", textAlign: "left" }}> Version </th>
                                                      <th style={{ width: "25%", borderBottom: "1px solid #ddd", padding: "8px", textAlign: "left" }}> Uploaded On </th>
                                                    </tr>
                                                  </thead>
                                                  <tbody>
                                                    {/* {groupedFiles[version].map((file) => ( */}
                                                    <tr>
                                                      {/* <td style={{ width: "15%", padding: "8px", borderBottom: "1px solid #ddd" }}> {index + 1} </td> */}
                                                      <td style={{ width: "15%", padding: "8px", borderBottom: "1px solid #ddd" }}>
                                                        <a href={`${process.env.REACT_APP_POLICY_BACKEND}policy_document/${selectedDocument.file_name}`} target="_blank" rel="noopener noreferrer" download style={{ cursor: "pointer" }}>
                                                          <div className="img-wrapper">
                                                            <Box sx={{ width: { lg: "45%", md: "45%", sm: "45%", xs: "45%" }, ml: { lg: 0, md: 0, sm: 0, xs: 0 } }}>
                                                              <img src={img1} style={{ width: "100%", height: "auto" }} alt="" />
                                                            </Box>
                                                          </div>
                                                        </a>
                                                      </td>
                                                      <td style={{ width: "20%", padding: "8px", borderBottom: "1px solid #ddd" }}> {selectedDocument.version} </td>
                                                      <td style={{ width: "25%", padding: "8px", borderBottom: "1px solid #ddd" }}> {new Date(selectedDocument.createdAt).toLocaleDateString("en-GB")} </td>
                                                    </tr>
                                                    {/* ))} */}
                                                  </tbody>
                                                </table>
                                              </div>
                                            </>
                                          ))}
                                          <Typography sx={{ marginBottom: 2, marginTop: 1, textDecoration: "underline" }}><b>Uploaded by the initiator :</b></Typography>
                                          {Object.keys(groupedFiles1).map((version, tableIndex) => (
                                            <>
                                              <Typography sx={{ marginBottom: 2, textDecoration: "underline" }}>
                                                Version {version}:
                                              </Typography>
                                              <div style={{ overflowX: 'auto', width: '100%' }}>
                                                <table key={tableIndex} style={{ minWidth: isXs ? "200%" : isMd ? "150%" : "100%", borderCollapse: "collapse", marginBottom: "20px" }}>
                                                  <thead>
                                                    <tr>
                                                      {/* <th style={{ width: "15%", borderBottom: "1px solid #ddd", padding: "8px", textAlign: "left" }}> S.no </th> */}
                                                      <th style={{ width: "15%", borderBottom: "1px solid #ddd", padding: "8px", textAlign: "left" }}> File </th>
                                                      <th style={{ width: "20%", borderBottom: "1px solid #ddd", padding: "8px", textAlign: "left" }}> Version </th>
                                                      <th style={{ width: "25%", borderBottom: "1px solid #ddd", padding: "8px", textAlign: "left" }}> Uploaded On </th>
                                                    </tr>
                                                  </thead>
                                                  <tbody>
                                                    {/* {groupedFiles1[version].map((file) => ( */}
                                                      <tr>
                                                        {/* <td style={{ width: "15%", padding: "8px", borderBottom: "1px solid #ddd" }}> {index + 1} </td> */}
                                                        <td style={{ width: "15%", padding: "8px", borderBottom: "1px solid #ddd" }}>
                                                          <a href={`${process.env.REACT_APP_POLICY_BACKEND}policy_document/${selectedDocument.file_name}`} target="_blank" rel="noopener noreferrer" download style={{ cursor: "pointer" }}>
                                                            <div className="img-wrapper">
                                                              <Box sx={{ width: { lg: "45%", md: "45%", sm: "45%", xs: "45%" }, ml: { lg: 0, md: 0, sm: 0, xs: 0 } }}>
                                                                <img src={img1} style={{ width: "100%", height: "auto" }} alt="" />
                                                              </Box>
                                                            </div>
                                                          </a>
                                                        </td>
                                                        <td style={{ width: "20%", padding: "8px", borderBottom: "1px solid #ddd" }}> {selectedDocument.version} </td>
                                                        <td style={{ width: "25%", padding: "8px", borderBottom: "1px solid #ddd" }}> {new Date(selectedDocument.createdAt).toLocaleDateString("en-GB")} </td>
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
                              )}
                            </>
                          ) : (
                            <Typography>No files uploaded</Typography>
                          )}
                        </>
                      ) : activeTab == 3 && roleId !== 16 ? (
                        <>
                          <TableRow>
                            <TableCell sx={{ pt: 3, pl: 2, verticalAlign: "top" }}>
                              <b>Files</b>
                            </TableCell>
                            <TableCell sx={{ pl: 2, verticalAlign: "top" }}>
                              {selectedDocument.version === "1.0" && selectedDocument.pending_at_id === selectedDocument.initiator_id && (
                                <>
                                  <Typography sx={{ marginBottom: 2, marginTop: 1, textDecoration: "underline" }}>
                                    <b>Files sent for review :</b>
                                  </Typography>
                                  <div style={{ overflowX: 'auto', width: '100%' }}>
                                    <table style={{ minWidth: isXs ? "200%" : isMd ? "150%" : "100%", borderCollapse: "collapse", marginBottom: "20px" }}>
                                      <thead>
                                        <tr>
                                          {/* <th style={{ width: "15%", borderBottom: "1px solid #ddd", padding: "8px", textAlign: "left" }}> S.no </th> */}
                                          <th style={{ width: "15%", borderBottom: "1px solid #ddd", padding: "8px", textAlign: "left" }}> File </th>
                                          <th style={{ width: "20%", borderBottom: "1px solid #ddd", padding: "8px", textAlign: "left" }}> Version </th>
                                          <th style={{ width: "25%", borderBottom: "1px solid #ddd", padding: "8px", textAlign: "left" }}> Uploaded On </th>
                                        </tr>
                                      </thead>
                                      <tbody>
                                        {/* {selectedDocument.policy_files.filter((file) => file.version === selectedDocument.version && file.type === 2).map((file, index) => ( */}
                                          <tr>
                                            {/* <td style={{ width: "15%", padding: "8px", borderBottom: "1px solid #ddd" }}> {index + 1} </td> */}
                                            <td style={{ width: "15%", padding: "8px", borderBottom: "1px solid #ddd" }}>
                                              <a href={`${process.env.REACT_APP_POLICY_BACKEND}policy_document/${selectedDocument.file_name}`} target="_blank" rel="noopener noreferrer" download style={{ cursor: "pointer" }}>
                                                <div className="img-wrapper">
                                                  <Box sx={{ width: { lg: "45%", md: "45%", sm: "45%", xs: "45%" }, ml: { lg: 0, md: 0, sm: 0, xs: 0 } }}>
                                                    <img src={img1} style={{ width: "100%", height: "auto" }} alt="" />
                                                  </Box>
                                                </div>
                                              </a>
                                            </td>
                                            <td style={{ width: "20%", padding: "8px", borderBottom: "1px solid #ddd" }}> {selectedDocument.version} </td>
                                            <td style={{ width: "25%", padding: "8px", borderBottom: "1px solid #ddd" }}> {new Date(selectedDocument.createdAt).toLocaleDateString("en-GB")} </td>
                                          </tr>
                                        {/* ))} */}
                                      </tbody>
                                    </table>
                                  </div>
                                </>
                              )}
                              {selectedDocument.version === "1.0" && (
                                <>
                                  <Typography sx={{ marginBottom: 2, marginTop: 1, textDecoration: "underline" }}>
                                    <b>Files uploaded by initiator :</b>
                                  </Typography>
                                  <div style={{ overflowX: 'auto', width: '100%' }}>
                                    <table style={{ minWidth: isXs ? "200%" : isMd ? "150%" : "100%", borderCollapse: "collapse", marginBottom: "20px" }}>
                                      <thead>
                                        <tr>
                                          {/* <th style={{ width: "15%", borderBottom: "1px solid #ddd", padding: "8px", textAlign: "left" }}> S.no </th> */}
                                          <th style={{ width: "15%", borderBottom: "1px solid #ddd", padding: "8px", textAlign: "left" }}> File </th>
                                          <th style={{ width: "20%", borderBottom: "1px solid #ddd", padding: "8px", textAlign: "left" }}> Version </th>
                                          <th style={{ width: "25%", borderBottom: "1px solid #ddd", padding: "8px", textAlign: "left" }}> Uploaded On </th>
                                        </tr>
                                      </thead>
                                      <tbody>
                                        {/* {selectedDocument.policy_files.filter((file) => file.version === selectedDocument.version && file.type === 1).map((file, index) => ( */}
                                          <tr>
                                            {/* <td style={{ width: "15%", padding: "8px", borderBottom: "1px solid #ddd" }}> {index + 1} </td> */}
                                            <td style={{ width: "15%", padding: "8px", borderBottom: "1px solid #ddd" }}>
                                              <a href={`${process.env.REACT_APP_POLICY_BACKEND}policy_document/${selectedDocument.file_name}`} target="_blank" rel="noopener noreferrer" download style={{ cursor: "pointer" }}>
                                                <div className="img-wrapper">
                                                  <Box sx={{ width: { lg: "45%", md: "45%", sm: "45%", xs: "45%" }, ml: { lg: 0, md: 0, sm: 0, xs: 0 } }}>
                                                    <img src={img1} style={{ width: "100%", height: "auto" }} alt="" />
                                                  </Box>
                                                </div>
                                              </a>
                                            </td>
                                            <td style={{ width: "20%", padding: "8px", borderBottom: "1px solid #ddd" }}> {selectedDocument.version} </td>
                                            <td style={{ width: "25%", padding: "8px", borderBottom: "1px solid #ddd" }}> {new Date(selectedDocument.createdAt).toLocaleDateString("en-GB")} </td>
                                          </tr>
                                        {/* ))} */}
                                      </tbody>
                                    </table>
                                  </div>
                                </>
                              )}
                              {selectedDocument.version !== "1.0" && selectedDocument.pending_at_id === selectedDocument.initiator_id && (
                                <>
                                  <Typography sx={{ marginBottom: 2, marginTop: 1, textDecoration: "underline" }}><b>Latest files sent for review :</b></Typography>
                                  <Typography sx={{ marginBottom: 2, textDecoration: "underline" }}>Remarks :</Typography>
                                  <Typography sx={{ marginBottom: 2 }}><em>{latest_remarks}</em></Typography>
                                  <div style={{ overflowX: 'auto', width: '100%' }}>
                                    <table style={{ minWidth: isXs ? "200%" : isMd ? "150%" : "100%", borderCollapse: "collapse", marginBottom: "20px" }}>
                                      <thead>
                                        <tr>
                                          {/* <th style={{ width: "15%", borderBottom: "1px solid #ddd", padding: "8px", textAlign: "left" }}> S.no </th> */}
                                          <th style={{ width: "15%", borderBottom: "1px solid #ddd", padding: "8px", textAlign: "left" }}> File </th>
                                          <th style={{ width: "20%", borderBottom: "1px solid #ddd", padding: "8px", textAlign: "left" }}> Version </th>
                                          <th style={{ width: "25%", borderBottom: "1px solid #ddd", padding: "8px", textAlign: "left" }}> Uploaded On </th>
                                        </tr>
                                      </thead>
                                      <tbody>
                                        {/* {selectedDocument.policy_files.filter((file) => file.version === selectedDocument.version && file.type === 2).map((file, index) => ( */}
                                          <tr>
                                            {/* <td style={{ width: "15%", padding: "8px", borderBottom: "1px solid #ddd" }}> {index + 1} </td> */}
                                            <td style={{ width: "15%", padding: "8px", borderBottom: "1px solid #ddd" }}>
                                              <a href={`${process.env.REACT_APP_POLICY_BACKEND}policy_document/${selectedDocument.file_name}`} target="_blank" rel="noopener noreferrer" download style={{ cursor: "pointer" }}>
                                                <div className="img-wrapper">
                                                  <Box sx={{ width: { lg: "45%", md: "45%", sm: "45%", xs: "45%" }, ml: { lg: 0, md: 0, sm: 0, xs: 0 } }}>
                                                    <img src={img1} style={{ width: "100%", height: "auto" }} alt="" />
                                                  </Box>
                                                </div>
                                              </a>
                                            </td>
                                            <td style={{ width: "20%", padding: "8px", borderBottom: "1px solid #ddd" }}> {selectedDocument.version} </td>
                                            <td style={{ width: "25%", padding: "8px", borderBottom: "1px solid #ddd" }}> {new Date(selectedDocument.createdAt).toLocaleDateString("en-GB")} </td>
                                          </tr>
                                        {/* ))} */}
                                      </tbody>
                                    </table>
                                  </div>
                                </>
                              )}
                              {selectedDocument.version !== "1.0" && (
                                <>
                                  <Typography sx={{ marginBottom: 2, marginTop: 1, textDecoration: "underline" }}>
                                    <b>Latest files uploaded by the initiator :</b>
                                  </Typography>
                                  <div style={{ overflowX: 'auto', width: '100%' }}>
                                    <table style={{ minWidth: isXs ? "200%" : isMd ? "150%" : "100%", borderCollapse: "collapse", marginBottom: "20px" }}>
                                      <thead>
                                        <tr>
                                          {/* <th style={{ width: "15%", borderBottom: "1px solid #ddd", padding: "8px", textAlign: "left" }}> S.no </th> */}
                                          <th style={{ width: "15%", borderBottom: "1px solid #ddd", padding: "8px", textAlign: "left" }}> File </th>
                                          <th style={{ width: "20%", borderBottom: "1px solid #ddd", padding: "8px", textAlign: "left" }}> Version </th>
                                          <th style={{ width: "25%", borderBottom: "1px solid #ddd", padding: "8px", textAlign: "left" }}> Uploaded On </th>
                                        </tr>
                                      </thead>
                                      <tbody>
                                        {/* {selectedDocument.policy_files.filter((file) => file.version === selectedDocument.version && file.type === 1).map((file, index) => ( */}
                                          <tr>
                                            {/* <td style={{ width: "15%", padding: "8px", borderBottom: "1px solid #ddd" }}> {index + 1} </td> */}
                                            <td style={{ width: "15%", padding: "8px", borderBottom: "1px solid #ddd" }}>
                                              <a href={`${process.env.REACT_APP_POLICY_BACKEND}policy_document/${selectedDocument.file_name}`} target="_blank" rel="noopener noreferrer" download style={{ cursor: "pointer" }}>
                                                <div className="img-wrapper">
                                                  <Box sx={{ width: { lg: "45%", md: "45%", sm: "45%", xs: "45%" }, ml: { lg: 0, md: 0, sm: 0, xs: 0 } }}>
                                                    <img src={img1} style={{ width: "100%", height: "auto" }} alt="" />
                                                  </Box>
                                                </div>
                                              </a>
                                            </td>
                                            <td style={{ width: "20%", padding: "8px", borderBottom: "1px solid #ddd" }}> {selectedDocument.version} </td>
                                            <td style={{ width: "25%", padding: "8px", borderBottom: "1px solid #ddd" }}> {new Date(selectedDocument.createdAt).toLocaleDateString("en-GB")} </td>
                                          </tr>
                                        {/* ))} */}
                                      </tbody>
                                    </table>
                                  </div>
                                </>
                              )}
                              {selectedDocument.version !== "1.0" && (
                                <>
                                  <Typography sx={{ marginBottom: 2, marginTop: 1, textDecoration: "underline" }}>
                                    <b>Previous files sent for review :</b>
                                  </Typography>
                                  {Object.keys(groupedFiles).map((version, tableIndex) => (
                                    <>
                                      <Typography sx={{ marginBottom: 2, textDecoration: "underline" }}>
                                        Remarks - Version {version}:
                                      </Typography>
                                      <Typography sx={{ marginBottom: 2 }}>
                                        <em>{remarksArray[tableIndex]}</em>
                                      </Typography>
                                      <div style={{ overflowX: 'auto', width: '100%' }}>
                                        <table key={tableIndex} style={{ minWidth: isXs ? "200%" : isMd ? "150%" : "100%", borderCollapse: "collapse", marginBottom: "20px" }}>
                                          <thead>
                                            <tr>
                                              {/* <th style={{ width: "15%", borderBottom: "1px solid #ddd", padding: "8px", textAlign: "left" }}> S.no </th> */}
                                              <th style={{ width: "15%", borderBottom: "1px solid #ddd", padding: "8px", textAlign: "left" }}> File </th>
                                              <th style={{ width: "20%", borderBottom: "1px solid #ddd", padding: "8px", textAlign: "left" }}> Version </th>
                                              <th style={{ width: "25%", borderBottom: "1px solid #ddd", padding: "8px", textAlign: "left" }}> Uploaded On </th>
                                            </tr>
                                          </thead>
                                          <tbody>
                                            {/* {groupedFiles[version].map((file, index) => ( */}
                                              <tr>
                                                {/* <td style={{ width: "15%", padding: "8px", borderBottom: "1px solid #ddd" }}> {index + 1} </td> */}
                                                <td style={{ width: "15%", padding: "8px", borderBottom: "1px solid #ddd" }}>
                                                  <a href={`${process.env.REACT_APP_POLICY_BACKEND}policy_document/${selectedDocument.file_name}`} target="_blank" rel="noopener noreferrer" download style={{ cursor: "pointer" }}>
                                                    <div className="img-wrapper">
                                                      <Box sx={{ width: { lg: "45%", md: "45%", sm: "45%", xs: "45%" }, ml: { lg: 0, md: 0, sm: 0, xs: 0 } }}>
                                                        <img src={img1} style={{ width: "100%", height: "auto" }} alt="" />
                                                      </Box>
                                                    </div>
                                                  </a>
                                                </td>
                                                <td style={{ width: "20%", padding: "8px", borderBottom: "1px solid #ddd" }}> {selectedDocument.version} </td>
                                                <td style={{ width: "25%", padding: "8px", borderBottom: "1px solid #ddd" }}> {new Date(selectedDocument.createdAt).toLocaleDateString("en-GB")} </td>
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
                                        <table key={tableIndex} style={{ minWidth: isXs ? "200%" : isMd ? "150%" : "100%", borderCollapse: "collapse", marginBottom: "20px" }}>
                                          <thead>
                                            <tr>
                                              {/* <th style={{ width: "15%", borderBottom: "1px solid #ddd", padding: "8px", textAlign: "left" }}> S.no </th> */}
                                              <th style={{ width: "15%", borderBottom: "1px solid #ddd", padding: "8px", textAlign: "left" }}> File </th>
                                              <th style={{ width: "20%", borderBottom: "1px solid #ddd", padding: "8px", textAlign: "left" }}> Version </th>
                                              <th style={{ width: "25%", borderBottom: "1px solid #ddd", padding: "8px", textAlign: "left" }}> Uploaded On </th>
                                            </tr>
                                          </thead>
                                          <tbody>
                                            {/* {groupedFiles1[version].map((file, index) => ( */}
                                              <tr>
                                                {/* <td style={{ width: "15%", padding: "8px", borderBottom: "1px solid #ddd" }}> {index + 1} </td> */}
                                                <td style={{ width: "15%", padding: "8px", borderBottom: "1px solid #ddd" }}>
                                                  <a href={`${process.env.REACT_APP_POLICY_BACKEND}policy_document/${selectedDocument.file_name}`} target="_blank" rel="noopener noreferrer" download style={{ cursor: "pointer" }}>
                                                    <div className="img-wrapper">
                                                      <Box sx={{ width: { lg: "45%", md: "45%", sm: "45%", xs: "45%" }, ml: { lg: 0, md: 0, sm: 0, xs: 0 } }}>
                                                        <img src={img1} style={{ width: "100%", height: "auto" }} alt="" />
                                                      </Box>
                                                    </div>
                                                  </a>
                                                </td>
                                                <td style={{ width: "20%", padding: "8px", borderBottom: "1px solid #ddd" }}> {selectedDocument.version} </td>
                                                <td style={{ width: "25%", padding: "8px", borderBottom: "1px solid #ddd" }}> {new Date(selectedDocument.createdAt).toLocaleDateString("en-GB")} </td>
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
                      ) : activeTab == 2 && selectedDocument.status == 2 && selectedDocument.pending_at_id === null && roleId !== 16 ? (
                        <>
                          <TableRow>
                            <TableCell sx={{ pt: 3, pl: 2, verticalAlign: "top" }}>
                              <b>Files</b>
                            </TableCell>
                            <TableCell sx={{ pl: 2, verticalAlign: "top" }}>
                              {selectedDocument.version === "1.0" && selectedDocument.pending_at_id === selectedDocument.initiator_id && (
                                <>
                                  <Typography sx={{ marginBottom: 2, marginTop: 1, textDecoration: "underline" }}>
                                    <b>Files sent for review :</b>
                                  </Typography>
                                  <div style={{ overflowX: 'auto', width: '100%' }}>
                                    <table style={{ minWidth: isXs ? "200%" : isMd ? "150%" : "100%", borderCollapse: "collapse", marginBottom: "20px" }}>
                                      <thead>
                                        <tr>
                                          {/* <th style={{ width: "15%", borderBottom: "1px solid #ddd", padding: "8px", textAlign: "left" }}> S.no </th> */}
                                          <th style={{ width: "15%", borderBottom: "1px solid #ddd", padding: "8px", textAlign: "left" }}> File </th>
                                          <th style={{ width: "20%", borderBottom: "1px solid #ddd", padding: "8px", textAlign: "left" }}> Version </th>
                                          <th style={{ width: "25%", borderBottom: "1px solid #ddd", padding: "8px", textAlign: "left" }}> Uploaded On </th>
                                        </tr>
                                      </thead>
                                      <tbody>
                                        {/* {selectedDocument.policy_files.filter((file) => file.version === selectedDocument.version && file.type === 2).map((file, index) => ( */}
                                          <tr>
                                            {/* <td style={{ width: "15%", padding: "8px", borderBottom: "1px solid #ddd" }}> {index + 1} </td> */}
                                            <td style={{ width: "15%", padding: "8px", borderBottom: "1px solid #ddd" }}>
                                              <a href={`${process.env.REACT_APP_POLICY_BACKEND}policy_document/${selectedDocument.file_name}`} target="_blank" rel="noopener noreferrer" download style={{ cursor: "pointer" }}>
                                                <div className="img-wrapper">
                                                  <Box sx={{ width: { lg: "45%", md: "45%", sm: "45%", xs: "45%" }, ml: { lg: 0, md: 0, sm: 0, xs: 0 } }}>
                                                    <img src={img1} style={{ width: "100%", height: "auto" }} alt="" />
                                                  </Box>
                                                </div>
                                              </a>
                                            </td>
                                            <td style={{ width: "20%", padding: "8px", borderBottom: "1px solid #ddd" }}> {selectedDocument.version} </td>
                                            <td style={{ width: "25%", padding: "8px", borderBottom: "1px solid #ddd" }}> {new Date(selectedDocument.createdAt).toLocaleDateString("en-GB")} </td>
                                          </tr>
                                        {/* ))} */}
                                      </tbody>
                                    </table>
                                  </div>
                                </>
                              )}
                              {selectedDocument.version === "1.0" && (
                                <>
                                  <Typography sx={{ marginBottom: 2, marginTop: 1, textDecoration: "underline" }}>
                                    <b>Files uploaded by initiator :</b>
                                  </Typography>
                                  <div style={{ overflowX: 'auto', width: '100%' }}>
                                    <table style={{ minWidth: isXs ? "200%" : isMd ? "150%" : "100%", borderCollapse: "collapse", marginBottom: "20px" }}>
                                      <thead>
                                        <tr>
                                          {/* <th style={{ width: "15%", borderBottom: "1px solid #ddd", padding: "8px", textAlign: "left" }}> S.no </th> */}
                                          <th style={{ width: "15%", borderBottom: "1px solid #ddd", padding: "8px", textAlign: "left" }}> File </th>
                                          <th style={{ width: "20%", borderBottom: "1px solid #ddd", padding: "8px", textAlign: "left" }}> Version </th>
                                          <th style={{ width: "25%", borderBottom: "1px solid #ddd", padding: "8px", textAlign: "left" }}> Uploaded On </th>
                                        </tr>
                                      </thead>
                                      <tbody>
                                        {/* {selectedDocument.policy_files.filter((file) => file.version === selectedDocument.version && file.type === 1).map((file, index) => ( */}
                                          <tr>
                                            {/* <td style={{ width: "15%", padding: "8px", borderBottom: "1px solid #ddd" }}> {index + 1} </td> */}
                                            <td style={{ width: "15%", padding: "8px", borderBottom: "1px solid #ddd" }}>
                                              <a href={`${process.env.REACT_APP_POLICY_BACKEND}policy_document/${selectedDocument.file_name}`} target="_blank" rel="noopener noreferrer" download style={{ cursor: "pointer" }}>
                                                <div className="img-wrapper">
                                                  <Box sx={{ width: { lg: "45%", md: "45%", sm: "45%", xs: "45%" }, ml: { lg: 0, md: 0, sm: 0, xs: 0 } }}>
                                                    <img src={img1} style={{ width: "100%", height: "auto" }} alt="" />
                                                  </Box>
                                                </div>
                                              </a>
                                            </td>
                                            <td style={{ width: "20%", padding: "8px", borderBottom: "1px solid #ddd" }}> {selectedDocument.version} </td>
                                            <td style={{ width: "25%", padding: "8px", borderBottom: "1px solid #ddd" }}> {new Date(selectedDocument.createdAt).toLocaleDateString("en-GB")} </td>
                                          </tr>
                                        {/* ))} */}
                                      </tbody>
                                    </table>
                                  </div>
                                </>
                              )}
                              {selectedDocument.version !== "1.0" && selectedDocument.pending_at_id === selectedDocument.initiator_id && (
                                <>
                                  <Typography sx={{ marginBottom: 2, marginTop: 1, textDecoration: "underline" }}>
                                    <b>Latest files sent for review :</b>
                                  </Typography>
                                  <div style={{ overflowX: 'auto', width: '100%' }}>
                                    <table style={{ minWidth: isXs ? "200%" : isMd ? "150%" : "100%", borderCollapse: "collapse", marginBottom: "20px" }}>
                                      <thead>
                                        <tr>
                                          {/* <th style={{ width: "15%", borderBottom: "1px solid #ddd", padding: "8px", textAlign: "left" }}> S.no </th> */}
                                          <th style={{ width: "15%", borderBottom: "1px solid #ddd", padding: "8px", textAlign: "left" }}> File </th>
                                          <th style={{ width: "20%", borderBottom: "1px solid #ddd", padding: "8px", textAlign: "left" }}> Version </th>
                                          <th style={{ width: "25%", borderBottom: "1px solid #ddd", padding: "8px", textAlign: "left" }}> Uploaded On </th>
                                        </tr>
                                      </thead>
                                      <tbody>
                                        {/* {selectedDocument.policy_files.filter((file) => file.version === selectedDocument.version && file.type === 2).map((file, index) => ( */}
                                          <tr>
                                            {/* <td style={{ width: "15%", padding: "8px", borderBottom: "1px solid #ddd" }}> {index + 1} </td> */}
                                            <td style={{ width: "15%", padding: "8px", borderBottom: "1px solid #ddd" }}>
                                              <a href={`${process.env.REACT_APP_POLICY_BACKEND}policy_document/${selectedDocument.file_name}`} target="_blank" rel="noopener noreferrer" download style={{ cursor: "pointer" }}>
                                                <div className="img-wrapper">
                                                  <Box sx={{ width: { lg: "65%", md: "65%", sm: "45%", xs: "65%" }, ml: { lg: 0, md: 0, sm: -1, xs: -1 } }}>
                                                    <img src={img1} style={{ width: "100%", height: "auto" }} alt="" />
                                                  </Box>
                                                </div>
                                              </a>
                                            </td>
                                            <td style={{ width: "20%", padding: "8px", borderBottom: "1px solid #ddd" }}> {selectedDocument.version} </td>
                                            <td style={{ width: "25%", padding: "8px", borderBottom: "1px solid #ddd" }}> {new Date(selectedDocument.createdAt).toLocaleDateString("en-GB")} </td>
                                          </tr>
                                        {/* ))} */}
                                      </tbody>
                                    </table>
                                  </div>
                                </>
                              )}
                              {selectedDocument.version !== "1.0" && (
                                <>
                                  <Typography sx={{ marginBottom: 2, marginTop: 1, textDecoration: "underline" }}>
                                    <b>Latest files uploaded by the initiator:</b>
                                  </Typography>
                                  <div style={{ overflowX: 'auto', width: '100%' }}>
                                    <table style={{ minWidth: isXs ? "200%" : isMd ? "150%" : "100%", borderCollapse: "collapse", marginBottom: "20px" }}>
                                      <thead>
                                        <tr>
                                          <th style={{ width: "15%", borderBottom: "1px solid #ddd", padding: "8px", textAlign: "left" }}> S.no </th>
                                          <th style={{ width: "15%", borderBottom: "1px solid #ddd", padding: "8px", textAlign: "left" }}> File </th>
                                          <th style={{ width: "20%", borderBottom: "1px solid #ddd", padding: "8px", textAlign: "left" }}> Version </th>
                                          <th style={{ width: "25%", borderBottom: "1px solid #ddd", padding: "8px", textAlign: "left" }}> Uploaded On </th>
                                        </tr>
                                      </thead>
                                      <tbody>
                                        {selectedDocument.policy_files.filter((file) => file.version === selectedDocument.version && file.type === 1).map((file, index) => (
                                          <tr key={index}>
                                            <td style={{ width: "15%", padding: "8px", borderBottom: "1px solid #ddd" }}> {index + 1} </td>
                                            <td style={{ width: "15%", padding: "8px", borderBottom: "1px solid #ddd" }}>
                                              <a href={`${process.env.REACT_APP_POLICY_BACKEND}policy_document/${file.file_name}`} target="_blank" rel="noopener noreferrer" download style={{ cursor: "pointer" }}>
                                                <div className="img-wrapper">
                                                  <Box sx={{ width: { lg: "65%", md: "65%", sm: "45%", xs: "65%" }, ml: { lg: 0, md: 0, sm: -1, xs: -1 } }}>
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
                                  <Typography sx={{ marginBottom: 2, marginTop: 1, textDecoration: "underline" }}>
                                    <b>Previous files sent for review :</b>
                                  </Typography>
                                  {Object.keys(groupedFiles).map((version, tableIndex) => (
                                    <>
                                      <Typography sx={{ marginBottom: 2, textDecoration: "underline" }}>
                                        Remarks - Version {version}:
                                      </Typography>
                                      <Typography sx={{ marginBottom: 2 }}>
                                        <em>{remarksArray[tableIndex]}</em>
                                      </Typography>
                                      <div style={{ overflowX: 'auto', width: '100%' }}>
                                        <table key={tableIndex} style={{ minWidth: isXs ? "200%" : isMd ? "150%" : "100%", borderCollapse: "collapse", marginBottom: "20px" }}>
                                          <thead>
                                            <tr>
                                              <th style={{ width: "15%", borderBottom: "1px solid #ddd", padding: "8px", textAlign: "left" }}> S.no </th>
                                              <th style={{ width: "15%", borderBottom: "1px solid #ddd", padding: "8px", textAlign: "left" }}> File </th>
                                              <th style={{ width: "20%", borderBottom: "1px solid #ddd", padding: "8px", textAlign: "left" }}> Version </th>
                                              <th style={{ width: "25%", borderBottom: "1px solid #ddd", padding: "8px", textAlign: "left" }}> Uploaded On </th>
                                            </tr>
                                          </thead>
                                          <tbody>
                                            {groupedFiles[version].map((file, index) => (
                                              <tr key={index}>
                                                <td style={{ width: "15%", padding: "8px", borderBottom: "1px solid #ddd" }}> {index + 1} </td>
                                                <td style={{ width: "15%", padding: "8px", borderBottom: "1px solid #ddd" }}>
                                                  <a href={`${process.env.REACT_APP_POLICY_BACKEND}policy_document/${file.file_name}`} target="_blank" rel="noopener noreferrer" download style={{ cursor: "pointer" }}>
                                                    <div className="img-wrapper">
                                                      <Box sx={{ width: { lg: "65%", md: "65%", sm: "45%", xs: "65%" }, ml: { lg: 0, md: 0, sm: -1, xs: -1 } }}>
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
                                  <Typography sx={{ marginBottom: 2, marginTop: 1, textDecoration: "underline" }}>
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
                                              <th style={{ width: "15%", borderBottom: "1px solid #ddd", padding: "8px", textAlign: "left" }}> File </th>
                                              <th style={{ width: "20%", borderBottom: "1px solid #ddd", padding: "8px", textAlign: "left" }}> Version </th>
                                              <th style={{ width: "25%", borderBottom: "1px solid #ddd", padding: "8px", textAlign: "left" }}> Uploaded On </th>
                                            </tr>
                                          </thead>
                                          <tbody>
                                            {groupedFiles1[version].map((file, index) => (
                                              <tr key={index}>
                                                <td style={{ width: "15%", padding: "8px", borderBottom: "1px solid #ddd" }}> {index + 1} </td>
                                                <td style={{ width: "15%", padding: "8px", borderBottom: "1px solid #ddd" }}>
                                                  <a href={`${process.env.REACT_APP_POLICY_BACKEND}policy_document/${file.file_name}`} target="_blank" rel="noopener noreferrer" download style={{ cursor: "pointer" }}>
                                                    <div className="img-wrapper">
                                                      <Box sx={{ width: { lg: "65%", md: "65%", sm: "45%", xs: "65%" }, ml: { lg: 0, md: 0, sm: -1, xs: -1 } }}>
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
                      ) : (selectedDocument.status == 1) && selectedDocument.pending_at_id === null && roleId == 16 && (
                        <>
                          <TableRow>
                            <TableCell sx={{ pt: 2, pl: 2, width: '30%', verticalAlign: "top" }}>
                              <b>Final file: </b>
                            </TableCell>
                            <TableCell sx={{ pl: 1, width: '70%', verticalAlign: "top" }}>
                              <div style={{ overflowX: 'auto', width: '100%' }}>
                                <table style={{ minWidth: isXs ? "200%" : isMd ? "150%" : "100%", borderCollapse: "collapse", marginBottom: "10px" }}>
                                  <thead>
                                    <tr>
                                      <th style={{ width: "15%", borderBottom: "1px solid #ddd", padding: "8px", textAlign: "left" }}> S.no </th>
                                      <th style={{ width: "15%", borderBottom: "1px solid #ddd", padding: "8px", textAlign: "left" }}> File </th>
                                      <th style={{ width: "20%", borderBottom: "1px solid #ddd", padding: "8px", textAlign: "left" }}> Version </th>
                                      <th style={{ width: "25%", borderBottom: "1px solid #ddd", padding: "8px", textAlign: "left" }}> Uploaded On </th>
                                    </tr>
                                  </thead>
                                  <tbody>
                                    {selectedDocument.policy_files.map((file, index) => (
                                      <tr key={index}>
                                        <td style={{ width: "15%", padding: "8px", borderBottom: "1px solid #ddd" }}> {index + 1} </td>
                                        <td style={{ width: "15%", padding: "8px", borderBottom: "1px solid #ddd" }}>
                                          <a href={`${process.env.REACT_APP_POLICY_BACKEND}policy_document/${file.file_name}`} target="_blank" rel="noopener noreferrer" download style={{ cursor: "pointer" }}>
                                            <div className="img-wrapper">
                                              <Box sx={{ width: { lg: "65%", md: "65%", sm: "45%", xs: "65%" }, ml: { lg: 0, md: 0, sm: -1, xs: -1 } }}>
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
          <Grid item lg={5.3} md={12} sm={12} xs={12} sx={{ fontFamily: "sans-serif", fontSize: "0.875 rem", marginLeft: { lg: 2, md: 2, sm: 1, xs: 1 }, marginTop: 2, marginRight: { sm: 1, xs: 1 } }}>
            {selectedDocument && (
              <>
                {(activeTab == 1 || selectedDocument.status == 1) && selectedDocument.pending_at_id === null && roleId !== 16 && (
                  <>
                    <TableContainer component={Paper} sx={{ marginLeft: "0", marginTop: { lg: "30px", md: "30px", sm: 0, xs: 0 } }}>
                      <Table aria-label="data table">
                        <TableBody>
                          <TableRow>
                            <TableCell sx={{ pt: 2, pl: 2, width: { lg: "30%", md: "30%", sm: "20%", xs: "40%" }, verticalAlign: "top" }}>
                              <b>Final Decision: </b>
                            </TableCell>
                            <TableCell sx={{ pt: 2, pl: 2, width: { lg: "70%", md: "70%", sm: "80%", xs: "60%" }, verticalAlign: "top" }}>Approved</TableCell>
                          </TableRow>
                          <TableRow>
                            <TableCell sx={{ pt: 2, pl: 2, width: '30%', verticalAlign: "top" }}>
                              <b>Final file: </b>
                            </TableCell>
                            <TableCell sx={{ pl: 1, width: '70%', verticalAlign: "top" }}>
                              <div style={{ overflowX: 'auto', width: '100%' }}>
                                <table style={{ minWidth: isXs ? "200%" : isMd ? "150%" : "100%", borderCollapse: "collapse", marginBottom: "10px" }}>
                                  <thead>
                                    <tr>
                                      <th style={{ width: "15%", borderBottom: "1px solid #ddd", padding: "8px", textAlign: "left" }}> S.no </th>
                                      <th style={{ width: "15%", borderBottom: "1px solid #ddd", padding: "8px", textAlign: "left" }}> File </th>
                                      <th style={{ width: "20%", borderBottom: "1px solid #ddd", padding: "8px", textAlign: "left" }}> Version </th>
                                      <th style={{ width: "30%", borderBottom: "1px solid #ddd", padding: "8px", textAlign: "left" }}> Uploaded On </th>
                                    </tr>
                                  </thead>
                                  <tbody>
                                    {selectedDocument.policy_files.map((file, index) => (
                                      <tr key={index}>
                                        <td style={{ width: "15%", padding: "8px", borderBottom: "1px solid #ddd" }}> {index + 1} </td>
                                        <td style={{ width: "15%", padding: "8px", borderBottom: "1px solid #ddd" }}>
                                          <a href={`${process.env.REACT_APP_POLICY_BACKEND}policy_document/${file.file_name}`} target="_blank" rel="noopener noreferrer" download style={{ cursor: "pointer" }}>
                                            <div className="img-wrapper">
                                              <Box sx={{ width: { lg: "65%", md: "65%", sm: "45%", xs: "65%" }, ml: { lg: 0, md: 0, sm: -1, xs: -1 } }}>
                                                <img src={img1} style={{ width: "100%", height: "auto" }} alt="" />
                                              </Box>
                                            </div>
                                          </a>
                                        </td>
                                        <td style={{ width: "20%", padding: "8px", borderBottom: "1px solid #ddd" }}> {file.version} </td>
                                        <td style={{ width: "30%", padding: "8px", borderBottom: "1px solid #ddd" }}> {new Date(file.createdAt).toLocaleDateString("en-GB")} </td>
                                      </tr>
                                    ))}
                                  </tbody>
                                </table>
                              </div>
                            </TableCell>
                          </TableRow>
                        </TableBody>
                      </Table>
                    </TableContainer>
                  </>
                )}
              </>
            )}
            {activeTab == 4 && (
              <div>
                <Typography variant="h5" sx={{ fontFamily: "sans-serif", fontSize: "1.4rem", fontWeight: "bold", marginTop: -2, marginRight: 2 }}>
                  Action:
                </Typography>
                <span style={{ fontSize: "0.7rem" }}>
                  Fields marked with (<span style={{ color: "red" }}>*</span>) are mandatory
                </span>
              </div>
            )}
            {selectedDocument ? (
              <>
                <form onSubmit={handleSubmit} encType="multipart/form-data">
                  {activeTab == 4 && selectedDocument.pending_at_id === userId && selectedDocument.initiator_id === userId && isInitiator(roleId) && (
                    <>
                      <Typography variant="h8" sx={{ fontFamily: "sans-serif", display: "block", mt: 2 }}>
                        <b>Policy ID:</b>
                      </Typography>
                      <StyledTextField fullWidth value={getDisplayPolicyId(documentID)} onChange={(e) => setDocumentID(e.target.value)} sx={{ mt: 1 }} InputProps={{ readOnly: true }} />
                      <Typography variant="h8" sx={{ fontFamily: "sans-serif", display: "block" }}>
                        <b>Document Title <span style={{ color: "red" }}>*</span> :</b>
                      </Typography>
                      <StyledTextField fullWidth inputProps={{ maxLength: 100 }} value={documentTitle} onChange={handleTitleChange} sx={{ mt: 1 }} />
                      <Grid item xs={12} sx={{ textAlign: "right", marginTop: 1 }}>
                        <Typography variant="body2" sx={{ fontFamily: "sans-serif", fontSize: "0.7rem" }}>
                          {documentTitle.length}/100 characters
                        </Typography>
                      </Grid>
                      <Typography variant="h8" sx={{ fontFamily: "sans-serif", display: "block" }}>
                        <b>Document Description <span style={{ color: "red" }}>*</span> :</b>
                      </Typography>
                      <TextField fullWidth multiline rows={2} maxRows={2} inputProps={{ maxLength: 1000 }} value={documentDescription} onChange={handleDescriptionChange} sx={{ mt: 1, mb: 1 }} />
                      <Grid item xs={12} sx={{ textAlign: "right", marginTop: 1 }}>
                        <Typography variant="body2" sx={{ fontFamily: "sans-serif", fontSize: "0.7rem" }}>
                          {documentDescription.length}/1000 characters
                        </Typography>
                      </Grid>
                      <Typography variant="h8" sx={{ fontFamily: "sans-serif", display: "block", mb: 1 }}>
                        <b>Upload the updated document <span style={{ color: "red" }}>*</span> :</b>
                      </Typography>
                      <Typography variant="body2" sx={{ fontFamily: "sans-serif", fontSize: "0.7rem", color: "#666", marginTop: 0.5 }}>
                        Maximum 10 files allowed
                      </Typography>
                      <Typography variant="body2" sx={{ fontFamily: "sans-serif", fontSize: "0.7rem", color: "#666", marginTop: 0.5 }}>
                        Allowed extension .doc/.docx
                      </Typography>
                      <Typography variant="body2" sx={{ fontFamily: "sans-serif", fontSize: "0.7rem", color: "#666", marginTop: 0.5 }}>
                        Max file size 5MB
                      </Typography>
                      <Grid item>
                        <Grid container alignItems="center">
                          <Grid item>
                            <Button variant="contained" component="label" sx={{ fontFamily: "sans-serif", fontSize: "0.875rem", height: "30px", backgroundColor: "#ee8812", "&:hover": { backgroundColor: "rgb(249, 83, 22)" }, mt: 2 }}>
                              Upload
                              <input type="file" hidden accept=".doc, .docx" multiple onChange={(e) => handleFileUpload(e)} />
                            </Button>
                          </Grid>
                        </Grid>
                      </Grid>
                      <Grid item>
                        <Grid container direction="column" spacing={0}>
                          {uploadedFileName.map((filename, index) => (
                            <Grid item key={index} container alignItems="center" justifyContent="space-between" spacing={1}>
                              <Grid item xs>
                                <Typography variant="body2" sx={{ cursor: "pointer", fontFamily: "sans-serif", fontSize: "0.875rem", overflow: "hidden", whiteSpace: "nowrap", textOverflow: "ellipsis", color: filename.slice(-4) == "docx" || filename.slice(-4) == ".doc" ? "green" : "red" }} onClick={() => openUploadedFile(index)}>
                                  {index + 1}.{" "}
                                  {filename.length > 40 ? filename.substring(0, 32) + "... ." + filename.split(".").pop() : filename}
                                </Typography>
                              </Grid>
                              <Grid item container direction="row" alignItems="center" justifyContent="flex-end" xs>
                                <Typography sx={{ marginRight: 1, color: uploadedFile[index].size >= 5 * 1024 * 1024 ? "red" : "green" }}>
                                  {(uploadedFile[index].size / (1024 * 1024)).toFixed(2)} MB
                                </Typography>
                                <IconButton onClick={() => handleRemoveFile(index)} aria-label="remove file" size="small">
                                  <CloseIcon />
                                </IconButton>
                              </Grid>
                              <Grid item xs={12}>
                                <hr style={{ border: "none", borderTop: "1px solid #ccc", margin: "5px 0" }} />
                              </Grid>
                            </Grid>
                          ))}
                        </Grid>
                      </Grid>
                      <Typography variant="h8" sx={{ fontFamily: "sans-serif", display: "block", mt: 2 }}>
                        <b> Select the Reviewer <span style={{ color: "red" }}>*</span> : </b>
                      </Typography>
                      <StyledSelect labelId="reviewer-label" id="reviewer" value={selectedReviewer || selectedDocument.reviewer_id || ""} onChange={(e) => setSelectedReviewer(e.target.value)} fullWidth sx={{ mt: 1 }}>
                        <MenuItem value="">Select a reviewer</MenuItem>
                        {reviewersOptions.map((option) => (
                          <MenuItem key={option.value} value={option.value}>
                            <ListItemText primary={option.label} />
                          </MenuItem>
                        ))}
                      </StyledSelect>
                      <Typography variant="h8" sx={{ fontFamily: "sans-serif", display: "block", mt: 2 }}>
                        <b> Select Approval Committee Members{" "} <span style={{ color: "red" }}>*</span> : </b>
                      </Typography>
                      <StyledSelect
                        labelId="approval-members-label"
                        id="approvalMembers"
                        multiple
                        value={useDefaultValue ? approvalMembersWithPriority.map((member) => member.value) : selectedApprovalMembers}
                        onChange={handleSelectChangeApprovalMembers}
                        fullWidth
                        sx={{ mt: 1 }}
                        onOpen={handleDropdownOpen}
                        onClose={handleDropdownClose}
                        renderValue={(selected) =>
                          selected
                            .map((value) => {
                              const member = approvalMembersWithPriority.find(
                                (m) => m.value === value
                              );
                              return member ? `${member.priority} - ${member.label}` : "";
                            })
                            .join(", ")
                        }
                      >
                        {filteredApprovalMembers.map((option) => (
                          <MenuItem key={option.value} value={option.value}>
                            <Checkbox checked={selectedApprovalMembers.includes(option.value)} />
                            <ListItemText primary={option.label} />
                          </MenuItem>
                        ))}
                      </StyledSelect>
                      <Typography variant="h8" sx={{ fontFamily: "sans-serif", display: "block", mt: 2 }}>
                        <b> Select User Groups for Publishing{" "} <span style={{ color: "red" }}>*</span> : </b>
                      </Typography>
                      <Controller
                        name="userGroups"
                        control={control}
                        render={({ field }) => (
                          <StyledSelect
                            labelId="user-groups-label"
                            id="userGroups"
                            value={selectedUserGroup}
                            multiple
                            displayEmpty
                            onChange={handleSelectChange}
                            renderValue={(selected) =>
                              selected.length > 0 ? (
                                selected.join(", ")
                              ) : (
                                <span style={{ color: "#bdbdbd" }}>Select a user group</span>
                              )
                            }
                          >
                            <MenuItem value="" disabled>
                              <ListItemText style={{ color: "#bdbdbd" }} primary="Select a user group" />
                            </MenuItem>
                            {Object.entries(categorizedUserGroupOptions).map(
                              ([category, options]) => (
                                <div key={category}>
                                  <MenuItem>
                                    <Typography variant="h8" color="#ee8812" fontWeight="bolder">
                                      {category}
                                    </Typography>
                                  </MenuItem>
                                  {options.map((option) => (
                                    <MenuItem key={option.label} value={option.label}>
                                      <Checkbox
                                        sx={{ "&.Mui-checked": { color: "#ee8812" } }}
                                        checked={selectedUserGroup.includes(option.label)}
                                        onChange={(event) => {
                                          const newSelectedUserGroup = [...selectedUserGroup];
                                          if (event.target.checked) {
                                            newSelectedUserGroup.push(option.label);
                                          } else {
                                            const index = newSelectedUserGroup.indexOf(
                                              option.label
                                            );
                                            newSelectedUserGroup.splice(index, 1);
                                          }
                                          const sum = newSelectedUserGroup.reduce(
                                            (acc, currentLabel) => {
                                              const group = userGroupOptions.find(
                                                (group) => group.label === currentLabel
                                              );
                                              const groupValue = group ? group.value : 0;
                                              return acc + groupValue;
                                            },
                                            0
                                          );
                                          setSelectedUserGroup(newSelectedUserGroup);
                                          setSelectedUserGroupSum(sum);
                                        }}
                                      />
                                      <ListItemText primary={option.label} />
                                    </MenuItem>
                                  ))}
                                </div>
                              )
                            )}
                          </StyledSelect>
                        )}
                      />
                    </>
                  )}
                  {(isApprover(roleId) || isReviewer(roleId)) && selectedDocument.pending_at_id === userId && selectedDocument.initiator_id !== userId && activeTab == 4 && (
                    <Box sx={{ mt: 2 }}>
                      <Typography variant="h8" sx={{ fontFamily: "sans-serif", display: "block" }}>
                        <b> Decision <span style={{ color: "red" }}>*</span> : </b>
                      </Typography>
                      <StyledSelect value={decision} onChange={handleDecisionChange} fullWidth variant="outlined" sx={{ mt: 1 }}>
                        <MenuItem value=""><em>None</em></MenuItem>
                        <MenuItem value="approved">Approve</MenuItem>
                        <MenuItem value="reviewraised">Raise a review</MenuItem>
                        <MenuItem value="rejected">Reject</MenuItem>
                      </StyledSelect>
                    </Box>
                  )}
                  {(isApprover(roleId) || isReviewer(roleId)) && decision && decision !== "approved" && (
                    <>
                      <Typography variant="h8" sx={{ fontFamily: "sans-serif", display: "block", mt: 1 }}>
                        <b> Remarks <span style={{ color: "red" }}>*</span> : </b>
                      </Typography>
                      <TextField label="Remarks" variant="outlined" fullWidth inputProps={{ maxLength: 1000 }} multiline rows={4} value={remarks} onChange={handleRemarksChange} sx={{ mt: 1 }} />
                      <Grid item xs={12} sx={{ textAlign: "right", marginTop: 1 }}>
                        <Typography variant="body2" sx={{ fontFamily: "sans-serif", fontSize: "0.7rem" }}>
                          {remarks.length}/1000 characters
                        </Typography>
                      </Grid>
                    </>
                  )}
                  {(isApprover(roleId) || isReviewer(roleId)) && decision && decision === "reviewraised" && (
                    <>
                      <Typography variant="h8" sx={{ fontFamily: "sans-serif", display: "block", mt: 1, mb: 1 }}>
                        <b> Upload Document <span style={{ color: "red" }}>*</span> : </b>
                      </Typography>
                      <Typography variant="body2" sx={{ fontFamily: "sans-serif", fontSize: "0.7rem", color: "#666", marginTop: 0.5 }}>
                        Maximum 10 files allowed
                      </Typography>
                      <Typography variant="body2" sx={{ fontFamily: "sans-serif", fontSize: "0.7rem", color: "#666", marginTop: 0.5 }}>
                        Allowed extension .doc/.docx
                      </Typography>
                      <Typography variant="body2" sx={{ fontFamily: "sans-serif", fontSize: "0.7rem", color: "#666", marginTop: 0.5 }}>
                        Max file size 5Mb
                      </Typography>
                      <Grid item>
                        <Grid container alignItems="center">
                          <Grid item>
                            <Button variant="contained" component="label" sx={{ fontFamily: "sans-serif", fontSize: "0.875rem", height: "30px", backgroundColor: "#ee8812", "&:hover": { backgroundColor: "rgb(249, 83, 22)" }, mt: 1 }}>
                              Upload
                              <input type="file" hidden accept=".doc, .docx" multiple onChange={(e) => handleFileUpload1(e)} />
                            </Button>
                          </Grid>
                        </Grid>
                      </Grid>
                      <Grid item>
                        <Grid container direction="column" spacing={0}>
                          {uploadedFileName1.map((filename, index) => (
                            <Grid item key={index} container alignItems="center" justifyContent="space-between" spacing={1}>
                              <Grid item xs>
                                <Typography variant="body2" sx={{ cursor: "pointer", fontFamily: "sans-serif", fontSize: "0.875rem", overflow: "hidden", whiteSpace: "nowrap", textOverflow: "ellipsis" }} onClick={() => openUploadedFile1(index)}>
                                  {index + 1}.{" "}
                                  {filename.length > 40 ? filename.substring(0, 32) + "... ." + filename.split(".").pop() : filename}
                                </Typography>
                              </Grid>
                              <Grid item container direction="row" alignItems="center" justifyContent="flex-end" xs>
                                <Typography sx={{ marginRight: 1, color: uploadedFile1[index].size >= 5 * 1024 * 1024 ? "red" : "green" }}>
                                  {(uploadedFile1[index].size / (1024 * 1024)).toFixed(2)} MB
                                </Typography>
                                <IconButton onClick={() => handleRemoveFile1(index)} aria-label="remove file" size="small">
                                  <CloseIcon />
                                </IconButton>
                              </Grid>
                              <Grid item xs={12}>
                                <hr style={{ border: "none", borderTop: "1px solid #ccc", margin: "5px 0" }} />
                              </Grid>
                            </Grid>
                          ))}
                        </Grid>
                      </Grid>
                    </>
                  )}
                  {selectedDocument.pending_at_id === userId && activeTab == 4 && (
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
          </Grid>
        </Grid>
      </Card>
    </ContentBox>
  );
}
