import React, { useState, useEffect } from "react";
import { useForm, Controller } from "react-hook-form";
import { useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import { Button, Card, Checkbox, ListItemText, MenuItem, FormControl, Grid, IconButton, styled, Select, Typography, TextField } from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import toast from "react-hot-toast";
import useCustomFetch from "../../../hooks/useFetchWithAuth";

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

const InitiateCA = () => {
  const { control } = useForm();
  const navigate = useNavigate();
  const customFetchWithAuth=useCustomFetch();

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [uploadFilename, setUploadFilename] = useState([]);
  const [uploadedFile, setUploadedFile] = useState([]);
  const [userGroupOptions, setUserGroupOptions] = useState([]);
  const [selectedUserGroup, setSelectedUserGroup] = useState([]);
  const [selectedUserGroupSum, setSelectedUserGroupSum] = useState(0);
  const [userGroupStoreSum, setUserGroupStoreSum] = useState(0);
  const [loading, setLoading] = useState(false);

  const userToken = useSelector((state) => {
    return state.token;
  });

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
    const files = Array.from(e.target.files);
    if (uploadedFile.length + files.length > 10) {
      toast.error("You can only upload a maximum of 10 files.");
      return;
    }
    files.forEach((file) => {
      setUploadFilename((prev) => [...prev, file.name]);
      setUploadedFile((prev) => [...prev, file]);
    });
  };

  const openUploadedFile = (index) => {
    const fileURL = URL.createObjectURL(uploadedFile[index]);
    window.open(fileURL);
  };

  const handleRemoveFile = (index) => {
    setUploadFilename((prev) => prev.filter((_, i) => i !== index));
    setUploadedFile((prev) => prev.filter((_, i) => i !== index));
  };

  useEffect(() => {
    const fetchUserGroups = async() => {
      try{
        const response = await customFetchWithAuth(`${process.env.REACT_APP_POLICY_BACKEND}auth/get-user-groups`,"GET",1,{});
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
    if (!(title === "" && e.target.value === " ")) setTitle(e.target.value);
  };

  const handleDescriptionChange = (e) => {
    if (!(description === "" && e.target.value === " ")) setDescription(e.target.value);
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setLoading(true);
    setIsBtnDisabled(true);
    if ( !title.trimStart() || !description.trimStart() || uploadedFile.length === 0 || (selectedUserGroup.length === 0 && selectedUserGroupSum === 0) ) {
      toast.error("Please fill in all the required fields");
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
    const oversizedFile = uploadedFile.some((file) => file.size > maxFileSizeBytes);
    if (oversizedFile) {
      toast.error(`Each file must be smaller than ${maxFileSizeMB} MB`);
      setIsBtnDisabled(true);
      setTimeout(() => {
        setIsBtnDisabled(false);
      }, 4000);
      return;
    }
    const isValidFileFormat = uploadedFile.every((file) => file.name.endsWith(".doc") || file.name.endsWith(".docx") || file.name.endsWith(".pdf"));
    if (!isValidFileFormat) {
      toast.error("Please upload only .doc, .docx or .pdf files");
      setIsBtnDisabled(true);
      setTimeout(() => {
        setIsBtnDisabled(false);
      }, 4000);
      return;
    }
    const url = `${process.env.REACT_APP_POLICY_BACKEND}circular-advisories/`;
    const formData = new FormData();
    uploadedFile.forEach((file) => {
      formData.append("files[]", file);
    });
    formData.append("title", title.trimStart());
    formData.append("description", description.trimStart());
    formData.append("user_group", selectedUserGroupSum || 0);
    const submitPromise = customFetchWithAuth(url,"POST",3,formData)
      .then((response) => {
        if (!response.ok) {
          throw new Error(`Error: ${response.statusText}`);
        }
        return response.json();
      })
      .then((data) => {
        if (data.status) {
          setTimeout(() => {
            navigate("/list/ca");
          }, 1000);
        } else {
          throw new Error("Submission failed");
        }
        setLoading(false);
      })
      .catch((error) => {
        console.error("Submission error:", error);
        setLoading(false);
        setIsBtnDisabled(false);
        throw error;
      });
    toast.promise(submitPromise, {
      loading: "Submitting...",
      success: (data) => `Circular Initiated Successfully`,
      error: (err) => `Error while Initiating`
    });
  };

  return (
    <ContentBox className="analytics">
      <Card sx={{ px: 3, py: 3, height: "100%", width: "100%" }}>
        <form onSubmit={handleSubmit}>
          <Grid container spacing={2}>
            <Grid item lg={12} md={12} sm={12} xs={12}>
              <Typography variant="h5" sx={{ fontFamily: "sans-serif", fontSize: "1.4rem", marginLeft: { sm: 2, xs: 2 }, marginTop: { sm: 2, xs: 2 }, marginRight: { sm: 2, xs: 2 } }}>
                Initiate a Circular or Advisory
              </Typography>
            </Grid>
            <Grid item lg={12} md={12} sm={12} xs={12} sx={{ marginLeft: { sm: 2, xs: 2 } }}>
              <span style={{ fontSize: "0.7rem" }}>
                Fields marked with (<span style={{ color: "red" }}>*</span>) are mandatory
              </span>
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
                        id="title"
                        value={title}
                        onChange={handleTitleChange}
                        rows={1}
                        maxRows={1}
                        variant="outlined"
                        fullWidth
                        placeholder="Enter title"
                        inputProps={{ maxLength: 100 }}
                        InputProps={{ style: { fontFamily: "sans-serif", fontSize: "0.875rem", height: "30px" } }}
                      />
                    </Grid>
                  </Grid>
                  <Grid item xs={12} sx={{ textAlign: "right", marginTop: 1 }}>
                    <Typography variant="body2" sx={{ fontFamily: "sans-serif", fontSize: "0.7rem" }}>
                      {title.length}/100 characters
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
                        id="description"
                        value={description}
                        onChange={handleDescriptionChange}
                        multiline
                        rows={2}
                        maxRows={2}
                        variant="outlined"
                        fullWidth
                        placeholder="Enter description"
                        inputProps={{ maxLength: 1000 }}
                        InputProps={{ style: { fontFamily: "sans-serif", fontSize: "0.875rem" } }}
                      />
                    </Grid>
                  </Grid>
                  <Grid item xs={12} sx={{ textAlign: "right", marginTop: 1 }}>
                    <Typography variant="body2" sx={{ fontFamily: "sans-serif", fontSize: "0.7rem" }}>
                      {description.length}/1000 characters
                    </Typography>
                  </Grid>
                </Grid>
              </Grid>
            </Grid>
            <Grid item lg={12} md={12} sm={12} xs={12} sx={{ marginLeft: { sm: 2, xs: 2 }, marginRight: { sm: 2, xs: 2 } }}>
              <Grid container alignItems="flex-start" spacing={2}>
                <Grid item xs={3} sm={3} md={3} lg={3}>
                  <Typography variant="h5" sx={{ fontFamily: "sans-serif", fontSize: "0.875rem", alignSelf: "flex-start" }}>
                    Upload <span style={{ color: "red" }}>*</span>
                  </Typography>
                  <Typography variant="body2" sx={{ fontFamily: "sans-serif", fontSize: "0.7rem", color: "#666", marginTop: 0.5 }}>
                    Maximum 10 files allowed
                  </Typography>
                  <Typography variant="body2" sx={{ fontFamily: "sans-serif", fontSize: "0.7rem", color: "#666", marginTop: 0.5 }}>
                    Allowed extension .doc/.docx/.pdf
                  </Typography>
                  <Typography variant="body2" sx={{ fontFamily: "sans-serif", fontSize: "0.7rem", color: "#666", marginTop: 0.5 }}>
                    Max file size 5MB
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
                              accept=".doc, .docx, .pdf"
                              multiple
                              onChange={(e) => handleFileUpload(e)}
                            />
                          </Button>
                        </Grid>
                      </Grid>
                    </Grid>
                    <Grid item>
                      <Grid container direction="column" spacing={0}>
                        {uploadFilename.map((filename, index) => (
                          <Grid item key={index} container alignItems="center" justifyContent="space-between" spacing={1}>
                            <Grid item xs>
                              <Typography variant="body2" sx={{ cursor: "pointer", fontFamily: "sans-serif", fontSize: "0.875rem", overflow: "hidden", whiteSpace: "nowrap", textOverflow: "ellipsis", color: filename.slice(-4) == "docx" || filename.slice(-4) == ".doc" || filename.slice(-4) == ".pdf" ? "green" : "red" }} onClick={() => openUploadedFile(index)}>
                                {index + 1}.{" "}
                                {filename.length > 40
                                  ? filename.substring(0, 37) + "... ." + filename.split(".").pop()
                                  : filename}
                              </Typography>
                            </Grid>
                            <Grid item container direction="row" alignItems="center" justifyContent="flex-end" xs>
                              <Typography sx={{ marginRight: 1, color: uploadedFile[index].size >= 5 * 1024 * 1024 ? "red" : "green" }}>
                                {(uploadedFile[index].size / (1024 * 1024)).toFixed(2)} MB
                              </Typography>
                              <IconButton onClick={() => handleRemoveFile(index)} aria-label="remove file" size="small" >
                                <CloseIcon />
                              </IconButton>
                            </Grid>
                            <Grid item xs={12}>
                              <hr style={{ border: "none", borderTop: "1px solid #ccc", margin: "5px 0" }}/>
                            </Grid>
                          </Grid>
                        ))}
                      </Grid>
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

export default InitiateCA;
