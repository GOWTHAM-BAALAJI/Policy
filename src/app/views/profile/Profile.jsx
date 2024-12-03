import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import toast from "react-hot-toast";
import { jwtDecode } from "jwt-decode";
import { Visibility, VisibilityOff } from "@mui/icons-material";
import useCustomFetch from "../../hooks/useFetchWithAuth";
import { Box, Button, Table, TableRow, TableCell, TableBody, Grid, InputAdornment, Typography, TextField, IconButton } from "@mui/material";
import Avatar from "@mui/material/Avatar";
import { CameraAlt as CameraIcon } from "@mui/icons-material";
import { setUserData } from "../../../redux/actions/userActions";

const Profile = () => {
  const [showFields, setShowFields] = useState(false);
  const handleUpdatePasswordClick = () => {
    setShowFields((prev) => !prev);
  };
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const customFetchWithAuth = useCustomFetch();

  const [storeImage, setStoreImage] = useState("");
  const userProfile = useSelector((state) => state.userData);
  const { profile_pic } = userProfile;
  const [profileImage, setProfileImage] = useState("");
  const [loading, setLoading] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);
  const [newpassword, setNewPassword] = useState("");
  const [confirmnewpassword, setConfirmNewPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const handleTogglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };
  const handleToggleConfirmPasswordVisibility = () => {
    setShowConfirmPassword(!showConfirmPassword);
  };
  const [empId, setEmpId] = useState(null);
  const [empName, setEmpName] = useState(null);
  const [empEmail, setEmpEmail] = useState(null);
  const [empMobile, setEmpMobile] = useState(null);
  const userToken = useSelector((state) => {
    return state.token;
  });

  useEffect(() => {
    if (!userToken) {
      navigate("/");
    }
  }, [navigate, userToken]);

  useEffect(() => {
    const decodedToken = jwtDecode(userToken);
    setProfileImage(`${process.env.REACT_APP_POLICY_BACKEND}profile_image/${decodedToken.profile_pic}`);
    if (profile_pic) {
      setProfileImage(`${process.env.REACT_APP_POLICY_BACKEND}profile_image/${profile_pic}`);
    }
  }, [profile_pic, userToken]);

  useEffect(() => {
    if (userToken) {
      try {
        const decodedToken = jwtDecode(userToken);
        if (decodedToken.emp_id) {
          setEmpId(decodedToken.emp_id);
        }
        if (decodedToken.emp_name) {
          setEmpName(decodedToken.emp_name);
        }
        if (decodedToken.emp_email) {
          setEmpEmail(decodedToken.emp_email);
        }
        if (decodedToken.emp_mobile) {
          setEmpMobile(decodedToken.emp_mobile);
        }
      } catch (error) {
        console.error("Invalid token:", error);
      }
    }
  }, [userToken]);

  const handleFileChange = (event) => {
    const file = event.target.files[0];
    const isValidFileFormat = file.name.endsWith(".jpeg") || file.name.endsWith(".jpg") || file.name.endsWith(".png");
    if (!isValidFileFormat) {
      toast.error("Please upload only .jpeg, .jpg or .png files");
      setIsBtnDisabled1(true);
      setTimeout(() => {
        setIsBtnDisabled1(false);
      }, 4000);
      const decodedToken = jwtDecode(userToken);
      if(profile_pic){
        setProfileImage(`${process.env.REACT_APP_POLICY_BACKEND}profile_image/${profile_pic}`);
        setSelectedFile(null);
      } else{
         if(decodedToken.profile_pic){
          setProfileImage(`${process.env.REACT_APP_POLICY_BACKEND}profile_image/${decodedToken.profile_pic}`);
          setSelectedFile(null);
        } else{
          setProfileImage(storeImage);
          setSelectedFile(null);
        }
      }
      return;
    } else{
      setSelectedFile(file);
      const reader = new FileReader();
      reader.onload = () => {
        const imageDataUrl = reader.result;
        setProfileImage(imageDataUrl);
        setStoreImage(imageDataUrl);
      };
      reader.readAsDataURL(file);
    }
  };

  const [isBtnDisabled1, setIsBtnDisabled1] = useState(false);
  const [isBtnDisabled2, setIsBtnDisabled2] = useState(false);

  const handleFileUpload = async (event) => {
    event.preventDefault();
    setLoading(true);
    if (!selectedFile) {
      toast.error("Please select a file");
      setIsBtnDisabled1(true);
      setTimeout(() => {
        setIsBtnDisabled1(false);
      }, 4000);
      return;
    }
    const formData = new FormData();
    formData.append("files[]", selectedFile);
    const url = `${process.env.REACT_APP_POLICY_BACKEND}auth/updateProfile`;
    const submitPromise1 = customFetchWithAuth(url, "POST", 3, formData)
      .then((response) => {
        return response.json();
      })
      .then((data) => {
        if (data.status) {
          setIsBtnDisabled1(true);
          setTimeout(() => {
            setIsBtnDisabled1(false);
          }, 4000);
          setSelectedFile(null);
          const img = data.image;
          if (img) {
            dispatch(setUserData({ profile_pic: img }));
          }
        }
        setLoading(false);
      })
      .catch((error) => {
        console.error("Submission error:", error);
        setIsBtnDisabled2(true);
        setTimeout(() => {
          setIsBtnDisabled2(false);
        }, 4000);
        setLoading(false);
      });
    toast.promise(submitPromise1, {
      loading: "Uploading...",
      success: (data) => `Profile Image Uploaded Successfully`,
      error: (err) => `Error while Uploading`
    });
  };

  const handlePasswordUpdate = async (event) => {
    event.preventDefault();
    setLoading(true);
    if (!newpassword || !confirmnewpassword) {
      toast.error("Please fill in all the required fields");
      setIsBtnDisabled2(true);
      setTimeout(() => {
        setIsBtnDisabled2(false);
      }, 4000);
      return;
    }
    if (newpassword.length < 6 || confirmnewpassword.length < 6) {
      toast.error("New password must be atleast 6 characters long");
      setIsBtnDisabled2(true);
      setTimeout(() => {
        setIsBtnDisabled2(false);
      }, 4000);
      return;
    }
    if (newpassword !== confirmnewpassword) {
      toast.error("New password must match with Confirm new password");
      setIsBtnDisabled2(true);
      setTimeout(() => {
        setIsBtnDisabled2(false);
      }, 4000);
      return;
    }
    const url = `${process.env.REACT_APP_POLICY_BACKEND}auth/updatePassword`;
    const requestData = {
      newPassword: newpassword
    };
    const submitPromise2 = customFetchWithAuth(url, "POST", 2, JSON.stringify(requestData))
      .then((response) => {
        return response.json();
      })
      .then((data) => {
        if (data.status) {
          setIsBtnDisabled2(true);
          setTimeout(() => {
            setIsBtnDisabled2(false);
          }, 4000);
          setNewPassword("");
          setConfirmNewPassword("");
          setShowFields(false);
        } else {
          throw new Error("Updation failed");
        }
        setLoading(false);
      })
      .catch((error) => {
        console.error("Submission error:", error);
        setIsBtnDisabled2(false);
        setLoading(false);
      });
    toast.promise(submitPromise2, {
      loading: "Updating...",
      success: (data) => `New password updated successfully`,
      error: (err) => `Error while updating`
    });
  };

  return (
    <>
      <Grid container sx={{ ml: 0, p: { lg: 4, md: 4, sm: 4, xs: 4 }, mr: 1 }}>
        <Grid container sx={{ display: "flex", justifyContent: "center", alignItems: "center", maxWidth: '100%' }}>
          <Grid item xs={12}>
            <Box sx={{ display: "flex", flexDirection: { xs: "column", sm: "column", md: "row", lg: "row" }, alignItems: "space-between", justifyContent: { md: "space-between", lg: "space-between" }, border: "1px solid #e0e0e0", boxShadow: "0px 0px 8px 2px rgba(0, 0, 0, 0.1)", p: 4, textAlign: "center", width: "fit-content", margin: "0 auto", gap: 4 }}>
              <form onSubmit={handleFileUpload} encType="multipart/form-data">
                <Box sx={{ display: "flex", flexDirection: "column", justifyContent: "center", alignItems: "center" }}>
                  <Avatar src={profileImage} sx={{ width: 160, height: 162, borderRadius: "50%", border: "1px solid #000" }} />
                  <input
                    accept=".jpeg,.jpg,.png"
                    id="upload-button-file"
                    type="file"
                    style={{ display: "none" }}
                    onChange={handleFileChange}
                  />
                  <label htmlFor="upload-button-file">
                    <IconButton sx={{ color: "rgb(27,28,54)" }} component="span">
                      <CameraIcon />
                    </IconButton>
                  </label>
                  <Button variant="contained" disabled={isBtnDisabled1} type="submit" sx={{ marginTop: 1, marginBottom: 1, padding: "4px 8px", fontSize: "0.75rem", backgroundColor: "#ee8812", "&:hover": { backgroundColor: "rgb(249, 83, 22)" } }}>
                    Upload
                  </Button>
                  <Grid item xs={12} sx={{ textAlign: "right" }}>
                    <Typography variant="body2" sx={{ fontFamily: "sans-serif", fontSize: "0.7rem" }}>
                      Max image size 5MB
                    </Typography>
                  </Grid>
                  <Grid item xs={12} sx={{ textAlign: "right" }}>
                    <Typography variant="body2" sx={{ fontFamily: "sans-serif", fontSize: "0.7rem" }}>
                      .jpg/.jpeg/.png allowed
                    </Typography>
                  </Grid>
                </Box>
              </form>

              <Box sx={{ p: 2, display: "flex", justifyContent: "center", alignItems: "center", mt: { sm: -4, xs: -2 } }}>
                <Table sx={{ width: "auto" }}>
                  <TableBody>
                    <TableRow sx={{ display: { xs: "flex", sm: "table-row" }, flexDirection: { xs: "column", sm: "row" } }}>
                      <TableCell>
                        <Typography variant="h6" sx={{ fontFamily: "sans-serif", fontSize: "0.875rem", marginRight: { sm: "40px", xs: 0 } }}>
                          <b>Employee ID:</b>
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Typography variant="h6" sx={{ fontFamily: "sans-serif", fontSize: "0.875rem" }}>
                          {empId}
                        </Typography>
                      </TableCell>
                    </TableRow>
                    <TableRow sx={{ display: { xs: "flex", sm: "table-row" }, flexDirection: { xs: "column", sm: "row" }, }}>
                      <TableCell>
                        <Typography variant="h6" sx={{ fontFamily: "sans-serif", fontSize: "0.875rem", marginRight: { sm: "40px", xs: 0 }, }}>
                          <b>Name:</b>
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Typography variant="h6" sx={{ fontFamily: "sans-serif", fontSize: "0.875rem" }}>
                          {empName}
                        </Typography>
                      </TableCell>
                    </TableRow>
                    <TableRow sx={{ display: { xs: "flex", sm: "table-row" }, flexDirection: { xs: "column", sm: "row" }, }}>
                      <TableCell>
                        <Typography variant="h6" sx={{ fontFamily: "sans-serif", fontSize: "0.875rem", marginRight: { sm: "40px", xs: 0 }, }}>
                          <b>Email ID:</b>
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Typography variant="h6" sx={{ fontFamily: "sans-serif", fontSize: "0.875rem" }}>
                          {empEmail}
                        </Typography>
                      </TableCell>
                    </TableRow>
                    <TableRow sx={{ display: { xs: "flex", sm: "table-row" }, flexDirection: { xs: "column", sm: "row" }, }}>
                      <TableCell>
                        <Typography variant="h6" sx={{ fontFamily: "sans-serif", fontSize: "0.875rem", marginRight: { sm: "40px", xs: 0 }, }}>
                          <b>Mobile No.:</b>
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Typography variant="h6" sx={{ fontFamily: "sans-serif", fontSize: "0.875rem" }}>
                          {empMobile}
                        </Typography>
                      </TableCell>
                    </TableRow>
                  </TableBody>
                </Table>
              </Box>

              <form onSubmit={handlePasswordUpdate} encType="multipart/form-data">
                <Box sx={{ display: "flex", flexDirection: "column", justifyContent: "center", alignItems: "center", marginTop: "50px", marginRight: "20px", mt: { lg: 4, md: 4, sm: -3, xs: -2 } }}>
                  <Typography sx={{ mb: 2, fontFamily: "sans-serif", fontSize: "16px", fontWeight: "bold" }}>
                    Update your password
                  </Typography>
                  <>
                    <TextField
                      id="newpassword"
                      type={showPassword ? "text" : "password"}
                      rows={1}
                      maxRows={1}
                      variant="outlined"
                      fullWidth
                      value={newpassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      placeholder="Enter the new password"
                      InputProps={{
                        style: { fontFamily: "sans-serif", fontSize: "0.875rem", height: "30px", marginBottom: "10px" },
                        endAdornment: (
                          <InputAdornment position="end">
                            <IconButton onClick={handleTogglePasswordVisibility} edge="end" aria-label="toggle password visibility">
                              {showPassword ? <VisibilityOff /> : <Visibility />}
                            </IconButton>
                          </InputAdornment>
                        )
                      }}
                    />
                    <TextField
                      id="newpassword"
                      type={showConfirmPassword ? "text" : "password"}
                      rows={1}
                      maxRows={1}
                      variant="outlined"
                      fullWidth
                      value={confirmnewpassword}
                      onChange={(e) => setConfirmNewPassword(e.target.value)}
                      placeholder="Confirm the new password"
                      InputProps={{
                        style: { fontFamily: "sans-serif", fontSize: "0.875rem", height: "30px", marginBottom: "10px" },
                        endAdornment: (
                          <InputAdornment position="end">
                            <IconButton onClick={handleToggleConfirmPasswordVisibility} edge="end" aria-label="toggle password visibility">
                              {showConfirmPassword ? <VisibilityOff /> : <Visibility />}
                            </IconButton>
                          </InputAdornment>
                        )
                      }}
                    />
                    <Button variant="contained" disabled={isBtnDisabled2} type="submit" sx={{ padding: "4px 8px", fontSize: "0.75rem", backgroundColor: "#ee8812", "&:hover": { backgroundColor: "rgb(249, 83, 22)" } }}>
                      Submit
                    </Button>
                  </>
                </Box>
              </form>
            </Box>
          </Grid>
        </Grid>
      </Grid>
    </>
  );
};

export default Profile;
