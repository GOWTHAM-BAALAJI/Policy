import React, { useState, useEffect } from "react";
import { useForm, Controller } from "react-hook-form";
import { useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import { Button, Card, Checkbox, ListItemText, MenuItem, FormControl, Grid, IconButton, styled, Select, Typography, TextField } from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import toast from "react-hot-toast";
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

const AddExistingPolicy = () => {
    const { control } = useForm();
    const navigate = useNavigate();
    const customFetchWithAuth = useCustomFetch();

    const isXs = useMediaQuery((theme) => theme.breakpoints.down('sm'));
    const isSmCustom = useMediaQuery("(min-width: 600px) and (max-width: 655px)");

    const [docType, setDocType] = useState("");
    const [policytitle, setPolicyTitle] = useState("");
    const [policydescription, setDescription] = useState("");
    const [uploadedFilename, setUploadedFilename] = useState("");
    const [uploadFile, setUploadFile] = useState(null);
    const [approvedOnDate, setApprovedOnDate] = useState("");
    const [userGroupOptions, setUserGroupOptions] = useState([]);
    const [selectedUserGroup, setSelectedUserGroup] = useState([]);
    const [selectedUserGroupSum, setSelectedUserGroupSum] = useState(0);
    const [userGroupStoreSum, setUserGroupStoreSum] = useState(0);
    const [loading, setLoading] = useState(false);

    const doctypes = [
        { value: "1", label: "  Policy" },
        { value: "2", label: "  SOP" },
        { value: "3", label: "  Guidance Note" }
      ];

    const handleDateChange = (event) => {
        setApprovedOnDate(event.target.value);
    };
    const todayDate = new Date().toISOString().split('T')[0];

    const userToken = useSelector((state) => {
        return state.token;
    });

    const handleBackClick = () => {
        navigate(-1);
    };

    const handleCheckboxChange = (optionValue) => {
        setSelectedUserGroup((prevSelected) => {
            const updatedSelection = prevSelected.includes(optionValue)
                ? prevSelected.filter((item) => item !== optionValue)
                : [...prevSelected, optionValue];
            const newTotalValue = updatedSelection.reduce((sum, value) => sum + value, 0);
            setSelectedUserGroupSum(newTotalValue);
            return updatedSelection;
        });
    };

    useEffect(() => {
        setUserGroupStoreSum(selectedUserGroupSum);
    }, [selectedUserGroupSum]);

    const handleFileUpload = (e) => {
        const file = e.target.files[0];
        if (file) {
            setUploadedFilename(file.name);
            setUploadFile(file);
        }
    };

    const openUploadedFile = () => {
        if (uploadFile) {
            const fileURL = URL.createObjectURL(uploadFile);
            window.open(fileURL);
        }
    };
    
    const handleRemoveFile = () => {
        setUploadedFilename("");
        setUploadFile(null);
    };    

    useEffect(() => {
        const fetchUserGroups = async () => {
            try {
                const response = await customFetchWithAuth(`${process.env.REACT_APP_POLICY_BACKEND}auth/get-user-groups`, "GET", 1, {});
                const data = await response.json();
                if (data.status) {
                    const categorizedGroups = data.data.reduce((acc, usergroup) => {
                        const category = usergroup.category;
                        const option = {
                            value: usergroup.value,
                            label: usergroup.user_group
                        };
                        if (!acc[category]) {
                            acc[category] = [];
                        }
                        acc[category].push(option);
                        return acc;
                    }, {});
                    setUserGroupOptions(categorizedGroups);
                }
            } catch (error) {
                console.error('Error fetching data', error);
            } finally {
                setLoading(false);
            }
        };
        fetchUserGroups();
    }, [userToken]);

    const [isBtnDisabled, setIsBtnDisabled] = useState(false);

    const handleTitleChange = (e) => {
        if (!(policytitle === "" && e.target.value === " ")) setPolicyTitle(e.target.value);
    };

    const handleDescriptionChange = (e) => {
        if (!(policydescription === "" && e.target.value === " ")) setDescription(e.target.value);
    };

    const getSuccessMessage = () => {
        switch (docType) {
          case "1":
            return "Policy added successfully";
          case "2":
            return "SOP added successfully";
          case "3":
            return "Guidance Note added successfully";
          default:
            return "Document added successfully";
        }
      };

    const handleSubmit = async (event) => {
        event.preventDefault();
        setLoading(true);
        setIsBtnDisabled(true);
        if ( !docType || !policytitle.trimStart() || !policydescription.trimStart() || !uploadFile || (selectedUserGroup.length === 0 && selectedUserGroupSum === 0)) {
            toast.error("Please fill in all the required fields");
            setIsBtnDisabled(true);
            setTimeout(() => {
                setIsBtnDisabled(false);
            }, 4000);
            return;
        }
        const maxFileSizeMB = 25;
        const maxFileSizeBytes = maxFileSizeMB * 1024 * 1024;
        const oversizedFile = uploadFile.size > maxFileSizeBytes;
        if (oversizedFile) {
            toast.error(`File must be smaller than ${maxFileSizeMB} MB`);
            setIsBtnDisabled(true);
            setTimeout(() => {
                setIsBtnDisabled(false);
            }, 4000);
            return;
        }
        const isValidFileFormat = uploadFile.name.endsWith(".pdf");
        if (!isValidFileFormat) {
            toast.error("Please upload only pdf file");
            setIsBtnDisabled(true);
            setTimeout(() => {
                setIsBtnDisabled(false);
            }, 4000);
            return;
        }
        const url = `${process.env.REACT_APP_POLICY_BACKEND}admin/add-existing-policy`;
        const formData = new FormData();
        // uploadedFile.forEach((file) => {
        //   formData.append("files[]", file);
        // });
        formData.append("files[]", uploadFile);
        formData.append("type", docType);
        formData.append("title", policytitle.trimStart());
        formData.append("description", policydescription.trimStart());
        formData.append("approvedDate", approvedOnDate);
        formData.append("userGroup", selectedUserGroupSum || 0);
        const submitPromise = customFetchWithAuth(url, "POST", 3, formData)
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
        toast.promise(submitPromise, {
            loading: "Adding...",
            success: (data) => getSuccessMessage(),
            error: (err) => `Error while Adding`
        });
    };

    return (
        <ContentBox className="analytics">
            <Card sx={{ px: 3, py: 3, height: "100%", width: "100%" }}>
                <form onSubmit={handleSubmit}>
                    <Grid container justifyContent="space-between" alignItems="center" sx={{ mb: 1 }}>
                        <Grid item>
                            <Typography variant="h5" sx={{ fontFamily: "sans-serif", fontSize: "1.4rem", marginLeft: { sm: 2, xs: 2 }, marginTop: { sm: 2, xs: 2 }, marginRight: { sm: 2, xs: 2 } }}>
                                Add an Existing Policy, SOP or Guidance Note
                            </Typography>
                        </Grid>
                        {!isXs && !isSmCustom && (
                        <Grid item>
                            <Button variant="contained" onClick={handleBackClick} sx={{ marginRight: 2, marginTop: 2, height: "28px", backgroundColor: "#ee8812", "&:hover": { backgroundColor: "rgb(249, 83, 22)" } }}>
                                Back
                            </Button>
                        </Grid>
                        )}
                    </Grid>
                    <Grid container spacing={2} sx={{ mb: 2 }}>
                        <Grid item lg={12} md={12} sm={12} xs={12} sx={{ marginLeft: { sm: 2, xs: 2 } }}>
                            <span style={{ fontSize: "0.7rem" }}>
                                Fields marked with (<span style={{ color: "red" }}>*</span>) are mandatory
                            </span>
                        </Grid>
                    </Grid>
                    <Grid container spacing={2} alignItems="flex-start">
                        <Grid item lg={12} md={12} sm={12} xs={12} sx={{ marginLeft: { sm: 2, xs: 2 }, marginRight: { sm: 2, xs: 2 } }}>
                        <Grid container alignItems="flex-start" spacing={2}>
                            <Grid item xs={3} sm={3} md={3} lg={3}>
                            <Typography variant="h5" sx={{ fontFamily: "sans-serif", fontSize: "0.875rem" }}>
                                Type of Document <span style={{ color: "red" }}>*</span>
                            </Typography>
                            </Grid>
                            <Grid item xs={9} sm={9} md={9} lg={9}>
                            <Controller
                                name="docType"
                                control={control}
                                render={({ field }) => (
                                <StyledSelect
                                    labelId="doc-type-label"
                                    id="docType"
                                    value={docType || ""}
                                    displayEmpty
                                    onChange={(e) => {
                                        setDocType(e.target.value);
                                    }}
                                >
                                    <MenuItem value="" disabled>
                                    <ListItemText
                                        style={{ color: "#bdbdbd" }}
                                        primary="Select a document type"
                                    />
                                    </MenuItem>
                                    {doctypes.map((option) => (
                                    <MenuItem key={option.value} value={option.value}>
                                        <ListItemText primary={option.label} />
                                    </MenuItem>
                                    ))}
                                </StyledSelect>
                                )}
                            />
                            </Grid>
                        </Grid>
                        </Grid>
                        <Grid item lg={12} md={12} sm={12} xs={12} sx={{ marginLeft: { sm: 2, xs: 2 }, marginRight: { sm: 2, xs: 2 } }}>
                            <Grid container alignItems="flex-start" spacing={2}>
                                <Grid item xs={3} sm={3} md={3} lg={3}>
                                    <Typography variant="h5" sx={{ fontFamily: "sans-serif", fontSize: "0.875rem" }}>
                                        Title <span style={{ color: "red" }}>*</span>
                                    </Typography>
                                </Grid>
                                <Grid item xs={9} sm={9} md={9} lg={9}>
                                    <Grid container alignItems="center" spacing={2}>
                                        <Grid item xs>
                                            <TextField
                                                id="policytitle"
                                                value={policytitle}
                                                onChange={handleTitleChange}
                                                rows={1}
                                                maxRows={1}
                                                variant="outlined"
                                                fullWidth
                                                placeholder="Enter the policy title"
                                                inputProps={{ maxLength: 100 }}
                                                InputProps={{ style: { fontFamily: "sans-serif", fontSize: "0.875rem", height: "30px" } }}
                                            />
                                        </Grid>
                                    </Grid>
                                    <Grid item xs={12} sx={{ textAlign: "right", marginTop: 1 }}>
                                        <Typography variant="body2" sx={{ fontFamily: "sans-serif", fontSize: "0.7rem" }}>
                                            {policytitle.length}/100 characters
                                        </Typography>
                                    </Grid>
                                </Grid>
                            </Grid>
                        </Grid>
                        <Grid item lg={12} md={12} sm={12} xs={12} sx={{ marginLeft: { sm: 2, xs: 2 }, marginRight: { sm: 2, xs: 2 } }}>
                            <Grid container alignItems="flex-start" spacing={2}>
                                <Grid item xs={3} sm={3} md={3} lg={3}>
                                    <Typography variant="h5" sx={{ fontFamily: "sans-serif", fontSize: "0.875rem" }}>
                                        Description <span style={{ color: "red" }}>*</span>
                                    </Typography>
                                </Grid>
                                <Grid item xs={9} sm={9} md={9} lg={9}>
                                    <Grid container alignItems="center" spacing={2}>
                                        <Grid item xs>
                                            <TextField
                                                id="policydescription"
                                                value={policydescription}
                                                onChange={handleDescriptionChange}
                                                multiline
                                                rows={2}
                                                maxRows={2}
                                                variant="outlined"
                                                fullWidth
                                                placeholder="Enter the policy description"
                                                inputProps={{ maxLength: 1000 }}
                                                InputProps={{ style: { fontFamily: "sans-serif", fontSize: "0.875rem" } }}
                                            />
                                        </Grid>
                                    </Grid>
                                    <Grid item xs={12} sx={{ textAlign: "right", marginTop: 1 }}>
                                        <Typography variant="body2" sx={{ fontFamily: "sans-serif", fontSize: "0.7rem" }}>
                                            {policydescription.length}/1000 characters
                                        </Typography>
                                    </Grid>
                                </Grid>
                            </Grid>
                        </Grid>
                        {/* FILE UPLOAD */}
                        <Grid item lg={12} md={12} sm={12} xs={12} sx={{ marginLeft: { sm: 2, xs: 2 }, marginRight: { sm: 2, xs: 2 } }}>
                            <Grid container alignItems="flex-start" spacing={2}>
                                <Grid item xs={3} sm={3} md={3} lg={3}>
                                    <Typography variant="h5" sx={{ fontFamily: "sans-serif", fontSize: "0.875rem", alignSelf: "flex-start" }}>
                                        Upload <span style={{ color: "red" }}>*</span>
                                    </Typography>
                                    <Typography variant="body2" sx={{ fontFamily: "sans-serif", fontSize: "0.7rem", color: "#666", marginTop: 0.5 }}>
                                        Only 1 file allowed
                                    </Typography>
                                    <Typography variant="body2" sx={{ fontFamily: "sans-serif", fontSize: "0.7rem", color: "#666", marginTop: 0.5 }}>
                                        Allowed extension .pdf
                                    </Typography>
                                    <Typography variant="body2" sx={{ fontFamily: "sans-serif", fontSize: "0.7rem", color: "#666", marginTop: 0.5 }}>
                                        Max file size 25MB
                                    </Typography>
                                </Grid>
                                <Grid item xs={9} sm={9} md={9} lg={9}>
                                    <Grid container direction="column" spacing={1}>
                                        <Grid item>
                                            <Grid container alignItems="center">
                                                <Grid item>
                                                    <Button variant="contained" component="label" sx={{ fontFamily: "sans-serif", fontSize: "0.875rem", height: "30px", backgroundColor: "#ee8812", "&:hover": { backgroundColor: "rgb(249, 83, 22)" } }}>
                                                        Upload
                                                        <input
                                                            type="file"
                                                            hidden
                                                            accept=".pdf"
                                                            onChange={(e) => handleFileUpload(e)}
                                                        />
                                                    </Button>
                                                </Grid>
                                            </Grid>
                                        </Grid>
                                        <Grid item>
                                            {uploadedFilename && (
                                                <Grid container direction="row" alignItems="center" justifyContent="space-between" spacing={1}>
                                                    <Grid item xs>
                                                        <Typography variant="body2" sx={{ cursor: "pointer", fontFamily: "sans-serif", fontSize: "0.875rem", overflow: "hidden", whiteSpace: "nowrap", textOverflow: "ellipsis", color: uploadedFilename.endsWith(".pdf") ? "green" : "red", }} onClick={() => openUploadedFile()}>
                                                            {uploadedFilename.length > 40 ? uploadedFilename.substring(0, 37) + "... ." + uploadedFilename.split(".").pop() : uploadedFilename}
                                                        </Typography>
                                                    </Grid>
                                                    <Grid item>
                                                        <Grid container direction="row" alignItems="center" spacing={1}>
                                                            <Grid item>
                                                                <Typography sx={{ fontSize: "0.875rem", color: uploadFile?.size >= 25 * 1024 * 1024 ? "red" : "green", }}>
                                                                    {(uploadFile?.size / (1024 * 1024)).toFixed(2)} MB
                                                                </Typography>
                                                            </Grid>
                                                            <Grid item>
                                                                <IconButton onClick={handleRemoveFile} aria-label="remove file" size="small">
                                                                    <CloseIcon />
                                                                </IconButton>
                                                            </Grid>
                                                        </Grid>
                                                    </Grid>
                                                </Grid>
                                            )}
                                        </Grid>
                                    </Grid>
                                </Grid>
                            </Grid>
                        </Grid>
                        <Grid item lg={12} md={12} sm={12} xs={12} sx={{ marginLeft: { sm: 2, xs: 2 }, marginRight: { sm: 2, xs: 2 } }}>
                            <Grid container alignItems="center" spacing={2}>
                                <Grid item xs={3} sm={3} md={3} lg={3}>
                                    <Typography variant="h5" sx={{ fontFamily: "sans-serif", fontSize: "0.875rem" }}>
                                        Approved On <span style={{ color: "red" }}>*</span>
                                    </Typography>
                                </Grid>
                                <Grid item xs={9} sm={9} md={9} lg={9}>
                                    <Grid container alignItems="center" spacing={2}>
                                        <Grid item xs>
                                            <TextField
                                                id="approvedOn"
                                                value={approvedOnDate}
                                                onChange={handleDateChange}
                                                rows={1}
                                                maxRows={1}
                                                type="date"
                                                variant="outlined"
                                                fullWidth
                                                placeholder="Enter the policy title"
                                                inputProps={{ max: todayDate }}
                                                InputProps={{ style: { fontFamily: "sans-serif", fontSize: "0.875rem", height: "30px" } }}
                                            />
                                        </Grid>
                                    </Grid>
                                </Grid>
                            </Grid>
                        </Grid>
                        <Grid item lg={12} md={12} sm={12} xs={12} sx={{ marginLeft: { sm: 2, xs: 2 }, marginRight: { sm: 2, xs: 2 } }}>
                            <Grid container alignItems="center" spacing={2}>
                                <Grid item xs={3} sm={3} md={3} lg={3}>
                                    <Typography variant="h5" sx={{ fontFamily: "sans-serif", fontSize: "0.875rem" }}>
                                        Select User Groups for publishing <span style={{ color: "red" }}>*</span>
                                    </Typography>
                                </Grid>
                                <Grid item xs={9} sm={9} md={9} lg={9}>
                                    <Grid container alignItems="center" spacing={2}>
                                        <Grid item xs>
                                            <FormControl variant="outlined" fullWidth sx={{ position: "relative" }}>
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
                                                            onChange={(e) => field.onChange(selectedUserGroup)}
                                                            renderValue={(selected) =>
                                                                selected.length > 0 ? (
                                                                    selected
                                                                        .map(
                                                                            (value) =>
                                                                                Object.values(userGroupOptions)
                                                                                    .flat()
                                                                                    .find((option) => option.value === value)?.label
                                                                        )
                                                                        .join(", ")
                                                                ) : (
                                                                    <span style={{ color: "#bdbdbd" }}>Select a user group</span>
                                                                )
                                                            }
                                                        >
                                                            <MenuItem value="" disabled>
                                                                <ListItemText
                                                                    style={{ color: "#bdbdbd" }}
                                                                    primary="Select a user group"
                                                                />
                                                            </MenuItem>
                                                            {Object.entries(userGroupOptions).map(([category, options]) => (
                                                                <div key={category}>
                                                                    <MenuItem>
                                                                        <Typography variant="h8" color="#ee8812" fontWeight="bolder">
                                                                            {category}
                                                                        </Typography>
                                                                    </MenuItem>
                                                                    {options.map((option) => (
                                                                        <MenuItem key={option.value} value={option.value}>
                                                                            <Checkbox sx={{ "&.Mui-checked": { color: "#ee8812" } }} checked={selectedUserGroup.includes(option.value)} onChange={() => handleCheckboxChange(option.value)} />
                                                                            <ListItemText primary={option.label} />
                                                                        </MenuItem>
                                                                    ))}
                                                                </div>
                                                            ))}
                                                        </StyledSelect>
                                                    )}
                                                />
                                            </FormControl>
                                        </Grid>
                                    </Grid>
                                </Grid>
                            </Grid>
                        </Grid>
                        <Grid container justifyContent="center" alignItems="center" sx={{ marginTop: 2 }}>
                            <Button type="submit" disabled={isBtnDisabled} variant="contained" sx={{ mb: 2, height: "30px", fontFamily: "sans-serif", fontSize: "0.875rem", backgroundColor: "#ee8812", "&:hover": { backgroundColor: "rgb(249, 83, 22)" } }}>
                                Submit
                            </Button>
                        </Grid>
                    </Grid>
                </form>
            </Card>
        </ContentBox>
    );
};

export default AddExistingPolicy;
