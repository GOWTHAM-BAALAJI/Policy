import React, { useState, useEffect } from "react";
import { Box, styled, Typography, useTheme,TextField, Dialog, DialogActions, DialogContent, DialogTitle, Button } from "@mui/material";
import { LoadingButton } from "@mui/lab";
import { Formik } from "formik";
import * as Yup from "yup";
import { useNavigate } from "react-router-dom";
import {IconButton, InputAdornment } from '@mui/material';
import Visibility from '@mui/icons-material/Visibility';
import VisibilityOff from '@mui/icons-material/VisibilityOff';
// import { StyledTextField} from "./StyledComponentsLogin";
import PersonOutlineIcon from '@mui/icons-material/PersonOutline';
import PhoneIcon from '@mui/icons-material/Phone';
import LockIcon from '@mui/icons-material/Lock';

const StyledTextField = styled(TextField)(({ theme }) => ({
  "& .MuiInputBase-input": {
    padding: theme.spacing(1.5),
  },
  "& .MuiFormLabel-root": {
    marginLeft: theme.spacing(0),
  },
  "& .MuiOutlinedInput-root": {
    borderRadius: theme.shape.borderRadius,
    "& fieldset": {
      borderColor: theme.palette.grey[300],
    },
    "&:hover fieldset": {
      borderColor: theme.palette.primary.main,
    },
    "&.Mui-focused fieldset": {
      borderColor: theme.palette.primary.main,
    },
  },
}));

const StyledTextFieldupdate = StyledTextField;

const Container = styled(Box)(({ theme }) => ({
  display: "flex",
  flexDirection: "column",
  alignItems: "center",
  justifyContent: "center",
  width: "100%",
  height: "100%",
  padding: theme.spacing(2),
  background: "white",
}));

const ContentBox1 = styled("div")(({ theme }) => ({
  width: "100%",
  maxWidth: 420,
  padding: theme.spacing(4),
  borderRadius: theme.shape.borderRadius,
  display: "flex",
  flexDirection: "column",
  alignItems: "center",
  boxSizing: "border-box",
}));

const DialogStyled = styled(Dialog)(({ theme }) => ({
  "& .MuiDialog-paper": {
    padding: theme.spacing(1), 
    borderRadius: theme.shape.borderRadius * 0.5, 
    maxWidth: 300, 
    backgroundColor: 'rgb(249, 115, 22)',
  },
  "& .MuiDialogTitle-root": {
    fontSize: '1.1rem', 
    fontWeight: 'bold',
    paddingBottom: theme.spacing(1), 
    color: 'white'
  },
  "& .MuiDialogContent-root": {
    padding: theme.spacing(1), 
    color: 'white'
  },
  "& .MuiButton-text": {
    color: 'white'
  }
}));

 
// initial form values
const initialValues = {
  employeeIdOrEmail: "",
  otp: "",
  oldPassword: "",
  newPassword: "",
  confirmPassword: "",
};
 
// form field validation schema
const validationSchema = Yup.object().shape({
  employeeIdOrEmail: Yup.string().required("Employee ID or Email is required!"),
  otp: Yup.string().when('stage', {
    is: 'verify',
    then: Yup.string().required("OTP is required!"),
  }),
  oldPassword: Yup.string().when('stage', {
    is: 'verify',
    then: Yup.string().required("Old password is required!"),
  }),
  newPassword: Yup.string().when('stage', {
    is: 'reset',
    then: Yup.string().min(6, "Password must be at least 6 characters long").required("New password is required!"),
  }),
  confirmPassword: Yup.string().when('stage', {
    is: 'reset',
    then: Yup.string()
      .oneOf([Yup.ref('newPassword')], "Passwords must match")
      .required("Confirm password is required!")
      .min(6, "Password must be at least 6 characters long"),
  }),
});
 
export default function UpdatePassword() {
  const theme = useTheme();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [stage, setStage] = useState("request"); // stages: "request", "verify", "reset"
  const [dialogOpen, setDialogOpen] = useState(false);
  const [dialogContent, setDialogContent] = useState("");
  const [dialogMessage, setDialogMessage] = useState("");
  const [passwordError, setPasswordError] = useState("");
  const [resendCooldown, setResendCooldown] = useState(0); // State for cooldown
  const [otpResentDialogOpen, setOtpResentDialogOpen] = useState(false); // State for OTP resent dialog

  useEffect(() => {
    let timer;
    if (resendCooldown > 0) {
      timer = setInterval(() => {
        setResendCooldown((prev) => prev - 1);
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [resendCooldown]);
 
  // Handle form submission
  const handleSubmit = async (values, { resetForm }) => {
    setLoading(true);
 
    try {
        // Check for empty fields
        if (
            !values.employeeIdOrEmail ||
            (stage === "verify" && (!values.otp || !values.oldPassword)) ||
            (stage === "reset" && (!values.newPassword || !values.confirmPassword))
        ) {
            setDialogContent("Please fill all fields.");
            setDialogOpen(true);
            return;
        }
 
        if (stage === "verify") {
            // Validation for new and old passwords
            if (values.oldPassword === values.newPassword) {
                setDialogContent("New password cannot be the same as the old password.");
                setDialogOpen(true);
                return;
            }
            if (values.confirmPassword !== values.newPassword) {
                setDialogContent("Confirmation password must be the same as the new password.");
                setDialogOpen(true);
                return;
            }
        }
 
        if (stage === "request") {
            // Send OTP request
            const url = process.env.REACT_APP_BACKEND+'auth/resetPassword';
            const data = {
                empRef: values.employeeIdOrEmail,
                mobileNo: values.mobileNumber,
            };
            const customHeaders = { "Content-Type": "application/json" };
 
            const response = await fetch(url, {
                method: 'POST',
                headers: customHeaders,
                body: JSON.stringify(data),
            });
            const result = await response.json();
 
            if (response.ok && result.status) {
                // Set the stage to verify
                setStage("verify");
                setDialogContent(result.msg || "OTP sent successfully!");
                setDialogOpen(true); // Show success message
            } else {
                setDialogContent(result.msg || "Error sending OTP. Please check your details.");
                setDialogOpen(true);
            }
        } else if (stage === "verify") {
            // Verify OTP and reset password
            const url = process.env.REACT_APP_BACKEND+'auth/resetPassword'; // Same endpoint for verification and reset
            const data = {
                empRef: values.employeeIdOrEmail,
                otp: values.otp,
                old_password: values.oldPassword,
                new_password: values.newPassword,
                confirm_new_password: values.confirmPassword,
            };
            const customHeaders = { "Content-Type": "application/json" };
 
            const response = await fetch(url, {
                method: 'PUT',
                headers: customHeaders,
                body: JSON.stringify(data),
            });
            const result = await response.json();
 
            if (response.ok && result.status) {
                // Password reset successful
                setDialogContent(result.msg || "Password reset successful!");
                setDialogOpen(true); // Show success message
                resetForm();
                setStage("request");
                // Delay navigation to ensure dialog is shown
                setTimeout(() => navigate("/login"), 1000); // Adjust delay as needed
            } else {
                if (result.msg.includes("old password")) {
                    setDialogContent("The old password you entered is incorrect.");
                } else if (result.msg.includes("OTP")) {
                    setDialogContent("Invalid OTP.");
                } else {
                    setDialogContent(result.msg || "An error occurred. Please try again.");
                }
                setDialogOpen(true);
            }
        }
    } catch (error) {
        setDialogContent("An error occurred. Please try again.");
        setDialogOpen(true);
    } finally {
        setLoading(false);
    }
};

const handleResendOTP = async (values) => {
  if (resendCooldown > 0) return; // Prevent resend if cooldown is active

  setLoading(true);
  const url = process.env.REACT_APP_BACKEND+'auth/reSendOTP';
  const data = {
    "empRef": values.employeeIdOrEmail
  };
  const customHeaders = {
    "Content-Type": "application/json",
  };

  try {
    const response = await fetch(url, {
      method: "POST",
      headers: customHeaders,
      body: JSON.stringify(data),
    });

    const result = await response.json();
    if (response.ok && result?.status) {
      setDialogMessage("OTP has been resent to your email.");
      setOtpResentDialogOpen(true); // Open OTP resent dialog
      setResendCooldown(30); // Set cooldown to 30 seconds
    } else {
      setDialogMessage("Failed to resend OTP.");
      setOtpResentDialogOpen(true); // Show failure message
    }
  } catch (error) {
    console.error(error);
    setDialogMessage("Failed to resend OTP.");
    setOtpResentDialogOpen(true); // Show failure message
  } finally {
    setLoading(false);
  }
};


const handleDialogClose = () => {
  setDialogOpen(false);
  setOtpResentDialogOpen(false);
};
  const [showOldPassword, setShowOldPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const handleClickShowOldPassword = () => setShowOldPassword(!showOldPassword);
  const handleClickShowNewPassword = () => setShowNewPassword(!showNewPassword);
  const handleClickShowConfirmPassword = () => setShowConfirmPassword(!showConfirmPassword);

  const handleMouseDownPassword = (event) => {
    event.preventDefault();
  };




 
 
  return (
    <Container>
      <ContentBox1>
        <Formik
          initialValues={initialValues}
          validationSchema={validationSchema}
          onSubmit={handleSubmit}
          enableReinitialize
        >
          {({ values, errors, touched, handleChange, handleBlur, handleSubmit }) => (
            <form onSubmit={handleSubmit}>
              {stage === "request" && (
                <>
                  <StyledTextFieldupdate
                    fullWidth
                    size="small"
                    name="employeeIdOrEmail"
                    type="text"
                    label="Employee ID or Email"
                    variant="outlined"
                    onBlur={handleBlur}
                    value={values.employeeIdOrEmail}
                    onChange={handleChange}
                    helperText={touched.employeeIdOrEmail && errors.employeeIdOrEmail}
                    error={Boolean(touched.employeeIdOrEmail && errors.employeeIdOrEmail)}
                    sx={{ mb: 2, pb: 1 }}
                    InputProps={{
                      endAdornment: (
                        <InputAdornment position="end">
                          <IconButton edge="end">
                            <PersonOutlineIcon />
                          </IconButton>
                        </InputAdornment>
                      ),
                    }}
                  />
                  <StyledTextFieldupdate
                    fullWidth
                    size="small"
                    name="mobileNumber"
                    type="text"
                    label="Mobile Number"
                    variant="outlined"
                    onBlur={handleBlur}
                    value={values.mobileNumber}
                    onChange={(e) => {
                      // Only keep numeric values and enforce maximum length of 10
                      const value = e.target.value.replace(/[^\d]/g, '').slice(0, 10);
                      handleChange(e);
                      e.target.value = value; // Update the value in the input field
                    }}
                    onKeyPress={(e) => {
                      // Allow only numeric characters
                      if (!/[\d]/.test(e.key)) {
                        e.preventDefault();
                      }
                    }}
                    inputProps={{ maxLength: 10 }} // Restrict input to 10 characters
                    helperText={touched.mobileNumber && errors.mobileNumber}
                    error={Boolean(touched.mobileNumber && errors.mobileNumber)}
                    sx={{ mb: 2, pb: 1 }}
                    InputProps={{
                      endAdornment: (
                        <InputAdornment position="end">
                          <IconButton edge="end">
                          <PhoneIcon />
                          </IconButton>
                        </InputAdornment>
                      ),
                    }}
                  />
 
                  <LoadingButton
                    type="submit"
                    color="primary"
                    loading={loading}
                    variant="contained"
                    fullWidth
                    sx={{ mb: 2, fontFamily: 'sans-serif', fontSize: '0.875rem', bgcolor: 'rgb(27,28,54)', '&:hover': { bgcolor: '#e64a19' } }}
                  >
                    Send OTP
                  </LoadingButton>
                </>
              )}
 
              {stage === "verify" && (
                <>
                  <StyledTextFieldupdate
                    fullWidth
                    size="small"
                    name="employeeIdOrEmail"
                    type="text"
                    label="Employee ID or Email"
                    variant="outlined"
                    onBlur={handleBlur}
                    value={values.employeeIdOrEmail}
                    onChange={handleChange}
                    helperText={touched.employeeIdOrEmail && errors.employeeIdOrEmail}
                    error={Boolean(touched.employeeIdOrEmail && errors.employeeIdOrEmail)}
                    sx={{ mb: 2, pb: 1 }}
                    InputProps={{
                      endAdornment: (
                        <InputAdornment position="end">
                          <IconButton edge="end">
                            <PersonOutlineIcon />
                          </IconButton>
                        </InputAdornment>
                      ),
                    }}
                  />
                  <StyledTextFieldupdate
                    fullWidth
                    size="small"
                    name="otp"
                    type="text"
                    label="OTP"
                    variant="outlined"
                    onBlur={handleBlur}
                    value={values.otp}
                    onChange={(e) => {
                      let input = e.target.value;
                      // Allow only digits and enforce maximum length of 4 digits
                      if (/^\d{0,4}$/.test(input)) {
                        handleChange(e);
                      } else {
                        e.target.value = values.otp;  // Revert to the last valid state
                      }
                    }}
                    onKeyPress={(e) => {
                      // Allow only numeric characters
                      if (!/[\d]/.test(e.key)) {
                        e.preventDefault();
                      }
                    }}
                    helperText={touched.otp && errors.otp}
                    error={Boolean(touched.otp && errors.otp)}
                    sx={{ mb: 2, pb: 1 }}
                    InputProps={{
                      endAdornment: (
                        <InputAdornment position="end">
                           <IconButton edge="end">
                          <LockIcon />
                          </IconButton>
                        </InputAdornment>
                      ),
                    }}
                  />
 
                  <StyledTextFieldupdate
                    fullWidth
                    size="small"
                    name="oldPassword"
                    type="password"
                    label="Old Password"
                    variant="outlined"
                    onBlur={handleBlur}
                    value={values.oldPassword}
                    onChange={handleChange}
                    helperText={touched.oldPassword && errors.oldPassword}
                    error={Boolean(touched.oldPassword && errors.oldPassword)}
                    sx={{ mb: 2, pb: 1 }}
                    InputProps={{
                      endAdornment: (
                        <InputAdornment position="end">
                          <IconButton
                            aria-label="toggle old password visibility"
                            onClick={handleClickShowOldPassword}
                            onMouseDown={handleMouseDownPassword}
                            edge="end"
                          >
                            {showOldPassword ? <VisibilityOff /> : <Visibility />}
                          </IconButton>
                        </InputAdornment>
                      ),
                    }}
                  />
                  <StyledTextFieldupdate
                    fullWidth
                    size="small"
                    name="newPassword"
                    type="password"
                    label="New Password"
                    variant="outlined"
                    onBlur={handleBlur}
                    value={values.newPassword}
                    onChange={handleChange}
                    helperText={touched.newPassword && errors.newPassword}
                    error={Boolean(touched.newPassword && errors.newPassword)}
                    sx={{ mb: 2, pb: 1 }}
                    inputProps={{ minLength: 6 }}
                    InputProps={{
                      endAdornment: (
                        <InputAdornment position="end">
                          <IconButton
                            aria-label="toggle new password visibility"
                            onClick={handleClickShowNewPassword}
                            onMouseDown={handleMouseDownPassword}
                            edge="end"
                          >
                            {showNewPassword ? <VisibilityOff /> : <Visibility />}
                          </IconButton>
                        </InputAdornment>
                      ),
                    }}
                  />
                  <StyledTextFieldupdate
                    fullWidth
                    size="small"
                    name="confirmPassword"
                    type="password"
                    label="Confirm New Password"
                    variant="outlined"
                    onBlur={handleBlur}
                    value={values.confirmPassword}
                    onChange={handleChange}
                    helperText={touched.confirmPassword && errors.confirmPassword}
                    error={Boolean(touched.confirmPassword && errors.confirmPassword)}
                    sx={{ mb: 2, pb: 1 }}
                    inputProps={{ minLength: 6 }}
                    InputProps={{
                      endAdornment: (
                        <InputAdornment position="end">
                          <IconButton
                            aria-label="toggle confirm password visibility"
                            onClick={handleClickShowConfirmPassword}
                            onMouseDown={handleMouseDownPassword}
                            edge="end"
                          >
                            {showConfirmPassword ? <VisibilityOff /> : <Visibility />}
                          </IconButton>
                        </InputAdornment>
                      ),
                    }}
                  />
                  <LoadingButton
                    type="submit"
                    color="primary"
                    loading={loading}
                    variant="contained"
                    fullWidth
                    sx={{ mb: 2, fontFamily: 'sans-serif', fontSize: '0.875rem', bgcolor: 'rgb(27,28,54)', '&:hover': { bgcolor: '#e64a19' } }}
                  >
                    Verify OTP and Update Password
                  </LoadingButton>
                  <Box display="flex" alignItems="center" justifyContent="center">
                  <Typography
                    component="a"
                    href="#"
                    onClick={() => handleResendOTP(values)}
                    sx={{
                      color: theme.palette.primary.main,
                      cursor: resendCooldown > 0 ? 'not-allowed' : 'pointer',
                      textDecoration: 'none',
                      '&:hover': {
                        color: resendCooldown > 0 ? theme.palette.primary.main : '#e64a19',
                      },
                    }}
                  >
                    {resendCooldown > 0
                      ? `Resend OTP (${resendCooldown}s)`
                      : 'Resend OTP'}
                  </Typography>
                </Box>
                </>
              )}
            </form>
          )}
        </Formik>
      </ContentBox1>
 
      {/* Dialog for alerts */}
      <DialogStyled open={dialogOpen} onClose={() => setDialogOpen(false)}>
        <DialogTitle>Notification</DialogTitle>
        <DialogContent>{dialogContent}</DialogContent>
        <DialogActions>
          <Button onClick={() => setDialogOpen(false)} variant="text">OK</Button>
        </DialogActions>
      </DialogStyled>

      <DialogStyled open={otpResentDialogOpen} onClose={handleDialogClose}>
      <DialogTitle>OTP Resent</DialogTitle>
      <DialogContent>{dialogMessage}</DialogContent>
      <DialogActions>
        <Button onClick={handleDialogClose} variant="text">OK</Button>
      </DialogActions>
    </DialogStyled>
    </Container>
  );
}