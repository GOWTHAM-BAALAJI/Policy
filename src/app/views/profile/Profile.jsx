import React, { useState, useEffect }  from 'react';
import { useNavigate } from "react-router-dom";
import { useForm, Controller } from 'react-hook-form';
import * as Yup from 'yup';
import { LoadingButton } from "@mui/lab";
import { Formik } from "formik";
import UpdatePassword from './UpdatePassword';
import { useDispatch, useSelector } from 'react-redux';
import toast from "react-hot-toast";
import { jwtDecode } from "jwt-decode";
import { Visibility, VisibilityOff } from '@mui/icons-material';

import axios from 'axios';
import {
  Box,
  Button,
  Table,
  TableRow,
  TableCell,
  TableBody,
  TableContainer,
  // Checkbox,
  // FormControlLabel,
  Grid,
  // Radio,
  // RadioGroup,
  styled,
  TextField as MuiTextField,
  Select as MuiSelect, 
  MenuItem,
  FormControl,
  InputLabel,
  InputAdornment,
  Typography,
  TextField,
  IconButton
} from '@mui/material';
import Avatar from '@mui/material/Avatar';
import { CameraAlt as CameraIcon } from '@mui/icons-material';
import { Span } from '../../../app/components/Typography';
// import '../../../src/App.css';

const StyledTextField = styled(MuiTextField)(() => ({
  width: '100%',
  marginBottom: '16px',
  '& .MuiInputLabel-root': {
    textAlign: 'center',
    position: 'absolute',
    top: '-40%'
  },
  '& .MuiInputBase-root': {     
  height: 28 // Adjust the height as needed 
},
}));

const validationSchema = Yup.object().shape({
  oldpw: Yup.string().required("Old Password is required"),
  newpw: Yup.string().required("New Password is required"),
  confirmnewpw: Yup.string().required("Confirm New Password is required"),
});

const Profile = () => {

  const {
    control,
    watch,
    setValue,
    formState: { errors },
    reset,
    // setValue,
    getValues
  } = useForm({});

  const [showFields, setShowFields] = useState(false);

  const handleUpdatePasswordClick = () => {
    setShowFields((prev) => !prev);
  };

  const navigate = useNavigate();

  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [profileImage, setProfileImage] = useState("");
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
  const [empDesignation, setEmpDesignation] = useState(null);

  const userProfile = useSelector((state) => state.userData);
  // const [profileImage, setProfileImage] = useState(localStorage.getItem('userData.profile_pic') || "");

  const userToken = useSelector((state)=>{
    return state.token;//.data;
    });
  console.log("UserToken:",userToken);

  useEffect(() => {
    if (!userToken) {
      console.log("UserToken is missing.");
      navigate('/');
    }
  }, [userToken]);

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
        if (decodedToken.designation) {
          setEmpDesignation(decodedToken.designation);
        }
        if (decodedToken.profile_pic) {
          setProfileImage(`https://policyuat.spandanasphoorty.com/policy_apis/profile_image/${decodedToken.profile_pic}`);
        }
      } catch (error) {
        console.error('Invalid token:', error);
      }
    }
  }, [userToken]);

  const handleFileChange = (event) => {
    const file = event.target.files[0];
    setSelectedFile(file);
    const reader = new FileReader();
    reader.onload = () => {
      setProfileImage(reader.result);
    };
    reader.readAsDataURL(file);
  };

  const [isBtnDisabled1, setIsBtnDisabled1] = useState(false);
  const [isBtnDisabled2, setIsBtnDisabled2] = useState(false);
  
  const handleFileUpload = async (event) => {
    event.preventDefault();
    setLoading(true);

    setIsBtnDisabled1(true);
        setTimeout(() => {
            setIsBtnDisabled1(false);
        }, 4000);

    if (!selectedFile) {
      toast.error("Please select a file");
      setIsBtnDisabled1(true);
        setTimeout(() => {
            setIsBtnDisabled1(false);
        }, 4000);
      return;
    }

    // Prepare the form data for the API call
    const formData = new FormData();
    formData.append('files[]', selectedFile);

    const url = "https://policyuat.spandanasphoorty.com/policy_apis/auth/updateProfile";

    const submitPromise1=fetch(url, {
      method: "POST",
      headers: {
          'Authorization': `Bearer ${userToken}`, // Example header for token authentication
          // Note: Do not include 'Content-Type: application/json' when sending FormData
      },
      body: formData,
    })
    .then((response) => {
        return response.json();
    })
    .then((data) => {
        console.log("Server Response: ", data);
        if (data.status) {
            console.log("Successfully uploaded");
            // setTimeout(() => {
            //     navigate('/list/psg');
            // }, 1000);
        } else {
            console.log("Error");
        }
        setLoading(false); // Reset loading state
    })
    .catch((error) => {
        console.error("Submission error:", error);
        setLoading(false); // Reset loading state
    });

    toast.promise(submitPromise1, {
      loading: 'Uploading...',
      success: (data) => `Profile Image Uploaded Successfully`, // Adjust based on your API response
      error: (err) => `Error while Uploading`,
    });
  };

  const handlePasswordUpdate = async (event) => {
    event.preventDefault();
    setLoading(true);

    setIsBtnDisabled2(true);
        setTimeout(() => {
            setIsBtnDisabled2(false);
        }, 4000);

    if (!newpassword || !confirmnewpassword) {
      toast.error("Please fill in all the required fields");
      setIsBtnDisabled2(true);
        setTimeout(() => {
            setIsBtnDisabled2(false);
        }, 4000);
      return;
    }

    if(newpassword.length < 6 || confirmnewpassword.length < 6) {
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

    const url = "https://policyuat.spandanasphoorty.com/policy_apis/auth/updatePassword";
    const requestData = {
      newPassword: event.target.newpassword.value,
    };

    const submitPromise2=fetch(url, {
      method: "POST",
      headers: {
          'Authorization': `Bearer ${userToken}`, // Example header for token authentication
          // Note: Do not include 'Content-Type: application/json' when sending FormData
      },
      body: JSON.stringify(requestData),
    })
    .then((response) => {
        return response.json();
    })
    .then((data) => {
        console.log("Server Response: ", data);
        if (data.status) {
            console.log("Successfully updated");
            setNewPassword("");
            setConfirmNewPassword("");
            setShowFields(false);
            // setTimeout(() => {
            //     navigate('/list/psg');
            // }, 1000);
        } else {
            console.log("Error");
        }
        setLoading(false); // Reset loading state
    })
    .catch((error) => {
        console.error("Submission error:", error);
        setLoading(false); // Reset loading state
    });

    toast.promise(submitPromise2, {
      loading: 'Updating...',
      success: (data) => `New password updated successfully`, // Adjust based on your API response
      error: (err) => `Error while updating`,
    });
  };

  return (
    <>
    <Grid container sx={{ ml:1, p: 4 }}>
    <Grid container
      sx={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        // minHeight: '100vh', // Center vertically
      }}
    >
      <Grid item xs={12}>
        <Box
          sx={{
            display: 'flex', // Use flex to arrange components horizontally
            flexDirection: { xs: 'column', sm: 'column', md: 'row', lg: 'row' }, // Stack vertically on sm and xs, horizontally on md and lg
            justifyContent: { md: 'space-between', lg: 'space-between' }, // Space between items for larger screens
            // alignItems: { xs: 'center', sm: 'center', md: 'flex-start', lg: 'flex-start' },
            border: '1px solid #e0e0e0',
            boxShadow: '0px 0px 8px 2px rgba(0, 0, 0, 0.1)',
            p: 4,
            textAlign: 'center',
            width: 'fit-content', // Border adjusts to content width
            margin: '0 auto', // Centers the box horizontally
            gap: 4
          }}
        >
        {/* Left Half: Profile Image and Upload Button */}
        <form onSubmit={handleFileUpload} encType="multipart/form-data">
        <Box sx={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center' }}>
          <Avatar
            src={profileImage} // Use the state for the image URL
            alt="Profile Picture"
            sx={{ width: 160, height: 162, borderRadius: '50%', border: '1px solid #000' }}
          />
          <input
            accept="image/*"
            id="upload-button-file"
            type="file"
            style={{ display: 'none' }}
            onChange={handleFileChange}
          />
          <label htmlFor="upload-button-file">
            <IconButton sx={{ color: "rgb(27,28,54)" }} component="span">
              <CameraIcon />
            </IconButton>
          </label>
          <Button variant="contained" disabled={isBtnDisabled1} type="submit" sx={{ marginTop: 1, marginBottom: 1, padding: '4px 8px', fontSize: '0.75rem', backgroundColor: '#ee8812', '&:hover': { backgroundColor: 'rgb(249, 83, 22)' }, }}>
            Upload
          </Button>
        </Box>
        </form>

        {/* Middle Section: Employee Details Table */}
        <Box sx={{ p: 2, display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
          <Table sx={{ width: 'auto' }}>
            <TableBody>
              <TableRow>
                <TableCell>
                  <Typography variant="h6" sx={{ fontFamily: 'sans-serif', fontSize: '0.875rem', marginRight: '40px' }}><b>Employee ID:</b></Typography>
                </TableCell>
                <TableCell>
                  <Typography variant="h6" sx={{ fontFamily: 'sans-serif', fontSize: '0.875rem' }}>{empId}</Typography>
                </TableCell>
              </TableRow>
              <TableRow>
                <TableCell>
                  <Typography variant="h6" sx={{ fontFamily: 'sans-serif', fontSize: '0.875rem', marginRight: '40px' }}><b>Name:</b></Typography>
                </TableCell>
                <TableCell>
                  <Typography variant="h6" sx={{ fontFamily: 'sans-serif', fontSize: '0.875rem' }}>{empName}</Typography>
                </TableCell>
              </TableRow>
              <TableRow>
                <TableCell>
                  <Typography variant="h6" sx={{ fontFamily: 'sans-serif', fontSize: '0.875rem', marginRight: '40px' }}><b>Designation:</b></Typography>
                </TableCell>
                <TableCell>
                  <Typography variant="h6" sx={{ fontFamily: 'sans-serif', fontSize: '0.875rem' }}>{empDesignation}</Typography>
                </TableCell>
              </TableRow>
              <TableRow>
                <TableCell>
                  <Typography variant="h6" sx={{ fontFamily: 'sans-serif', fontSize: '0.875rem', marginRight: '40px' }}><b>Email:</b></Typography>
                </TableCell>
                <TableCell>
                  <Typography variant="h6" sx={{ fontFamily: 'sans-serif', fontSize: '0.875rem' }}>{empEmail}</Typography>
                </TableCell>
              </TableRow>
              <TableRow>
                <TableCell>
                  <Typography variant="h6" sx={{ fontFamily: 'sans-serif', fontSize: '0.875rem', marginRight: '40px' }}><b>Mobile:</b></Typography>
                </TableCell>
                <TableCell>
                  <Typography variant="h6" sx={{ fontFamily: 'sans-serif', fontSize: '0.875rem' }}>{empMobile}</Typography>
                </TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </Box>

        {/* Right Half: Update Password Section */}
        <form onSubmit={handlePasswordUpdate} encType="multipart/form-data">
        <Box sx={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', marginTop: '50px', marginRight: '20px' }}>
          <Button
            variant="contained"
            sx={{ marginBottom: 2, padding: '4px 8px', fontSize: '0.75rem', backgroundColor: '#ee8812', '&:hover': { backgroundColor: 'rgb(249, 83, 22)' }, }}
            onClick={handleUpdatePasswordClick}
          >
            Update Password
          </Button>
          {showFields && (
            <>
              <TextField
                id="newpassword"
                type={showPassword ? 'text' : 'password'}
                rows={1}
                maxRows={1}
                variant="outlined"
                fullWidth
                value={newpassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="Enter the new password"
                InputProps={{
                  style: {
                    fontFamily: 'sans-serif',
                    fontSize: '0.875rem',
                    height: '30px',
                    marginBottom: '10px',
                  },
                  endAdornment: (
                    <InputAdornment position="end">
                      <IconButton
                        onClick={handleTogglePasswordVisibility}
                        edge="end"
                        aria-label="toggle password visibility"
                      >
                        {showPassword ? <VisibilityOff /> : <Visibility />}
                      </IconButton>
                    </InputAdornment>
                  ),
                }}
              />
              <TextField
                id="newpassword"
                type={showConfirmPassword ? 'text' : 'password'}
                rows={1}
                maxRows={1}
                variant="outlined"
                fullWidth
                value={confirmnewpassword}
                onChange={(e) => setConfirmNewPassword(e.target.value)}
                placeholder="Confirm the new password"
                InputProps={{
                  style: {
                    fontFamily: 'sans-serif',
                    fontSize: '0.875rem',
                    height: '30px',
                    marginBottom: '10px',
                  },
                  endAdornment: (
                    <InputAdornment position="end">
                      <IconButton
                        onClick={handleToggleConfirmPasswordVisibility}
                        edge="end"
                        aria-label="toggle password visibility"
                      >
                        {showConfirmPassword ? <VisibilityOff /> : <Visibility />}
                      </IconButton>
                    </InputAdornment>
                  ),
                }}
              />
              <Button variant="contained" disabled={isBtnDisabled2} type="submit" sx={{ padding: '4px 8px', fontSize: '0.75rem', backgroundColor: '#ee8812', '&:hover': { backgroundColor: 'rgb(249, 83, 22)' }, }}>
                Submit
              </Button>
            </>
          )}
        </Box>
        </form>
      </Box>
    </Grid>
    </Grid>
    </Grid></>
  );
}

export default Profile;












{/* <div className='flex justify-center p-4'>
      <div className='p-6 bg-orange-500 mt-10 w-full max-w-4xl flex flex-col md:flex-row md:items-center border border-gray-300 shadow-lg rounded-xl'>
        <img 
          src={"/assets/avatar.jpg"} 
          alt="profile picture" 
          className='h-[180px] w-[180px] rounded-full border-4 border-white shadow-md mb-4 md:mb-0 md:mr-6 mx-auto'
        />
        <div className='text-xs md:text-sm flex-1 md:mx-6 mx-4'>
          <p className='my-1'><span className='font-bold'>Employee ID :</span> SF00XXXXX</p>
          <p className='my-1'><span className='font-bold'>Name :</span> XXXXXXXXXXX</p>
          <p className='my-1'><span className='font-bold'>Email ID :</span> XXXXXXXXX@spandanasphoorty.com</p>
        </div>
        <div className='text-xs md:text-sm flex-1 md:ml-4 ml-6'>
          <p className='my-1'><span className='font-bold'>Mobile :</span> XXXXXXXXXX</p>
          <p className='my-1'><span className='font-bold'>Designation :</span> XXXXXXXXXXX</p>
          <p className='my-1'><span className='font-bold'>Status :</span> Active</p>
        </div>
      </div>
    </div> */}