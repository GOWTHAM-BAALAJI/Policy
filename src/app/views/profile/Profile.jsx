import React, { useState, useEffect }  from 'react';
import { useForm, Controller } from 'react-hook-form';
import * as Yup from 'yup';
import { LoadingButton } from "@mui/lab";
import { Formik } from "formik";
import UpdatePassword from './UpdatePassword';
import { useDispatch, useSelector } from 'react-redux';

import axios from 'axios';
import {
  Box,
  useTheme,
  Button,
  Dialog,
  DialogTitle,
  DialogActions,
  DialogContent,
  DialogContentText,
  useMediaQuery,
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
  height: 30 // Adjust the height as needed 
},
}));

const validationSchema = Yup.object().shape({
  oldpw: Yup.string().required("Old Password is required"),
  newpw: Yup.string().required("New Password is required"),
  confirmnewpw: Yup.string().required("Confirm New Password is required"),
});

// const handleSubmit = async (values) => {
//   setLoading(true);

//   // console.log('--Alegation--', allegations);
//   // console.log('--Here--', getValues());
//   //return false;
//   const url = process.env.REACT_APP_BACKEND+'complaint';
//   const complainFrmData = {
//     "emp_id": getValues('empId'),
//     "raisedby_emp_id": getValues('byempId'),
//     "case_type": getValues('caseType'),
//     "case_nature": getValues('caseNature'),
//     "misappropriationamount": getValues('misappropriationamount'),
//     "amountrecovered": getValues('amountrecovered'),
//     "misappropriationamountdue": getValues('misappropriationamountdue'),
//     "allegations":allegations
//   };



//   const customHeaders = {
//     "Content-Type": "application/json",
//   };

//   fetch(url, {
//     method: "POST",
//     headers: customHeaders,
//     body: JSON.stringify(complainFrmData),
//   })
//     .then((response) => response.json())
//     .then((data) => {
      
//       console.log(data);
//       // setLoading(false);
//       if (data?.status) {
//         navigate('/list');
//       } else {
//         // Handle any error response or invalid status
//         console.error("Error: Invalid response");
//       }
//     })
//     .catch((error) => {
//       console.error(error);
//     });

// };

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

  const [open, setOpen] = useState(false);
  const [profileImage, setProfileImage] = useState(null);

  const userDetails = useSelector((state) => state.userData);

  const handleFileChange = (event) => {
    const file = event.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setProfileImage(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <>
    <Grid container sx={{ ml:1, p: 4 }}>
    <Grid item xs={12}>
      <Typography variant="h4" sx={{ pb: 3, ml:-2, mt:-1, fontFamily: 'sans-serif', fontSize: '1.25rem', fontWeight: 'bold' }}>
        Profile
      </Typography>
    </Grid>
    <Grid container spacing={2} sx={{ p: 1, boxSizing: 'border-box', border: '1px solid #e0e0e0', boxShadow: '0px 0px 8px 2px rgba(0, 0, 0, 0.1)' }}>
      <Grid item lg={4} md={4} sm={12} xs={12}>
      <Grid item xs={12}>
        <Typography variant="h5" sx= {{ pb:1, fontFamily: 'sans-serif', fontSize: '0.875rem', fontWeight: 'bold', '& *': { fontFamily: 'sans-serif', fontSize: '0.875rem', fontWeight: 'bold'}}}>Employee ID:</Typography>
      </Grid>
      <Grid item xs={12}>
        <Typography variant="h5" sx= {{ pb:1, fontFamily: 'sans-serif', fontSize: '0.875rem', '& *': { fontFamily: 'sans-serif', fontSize: '0.875rem'}}}>{userDetails.EMPLOYEE_NUMBER}</Typography>
      </Grid>
      </Grid>
      <Grid item lg={4} md={4} sm={12} xs={12}>
      <Grid item xs={12}>
        <Typography variant="h5" sx= {{ pb:1, fontFamily: 'sans-serif', fontSize: '0.875rem', fontWeight: 'bold', '& *': { fontFamily: 'sans-serif', fontSize: '0.875rem', fontWeight: 'bold'}}}>Name:</Typography>
      </Grid>
      <Grid item xs={12}>
        <Typography variant="h5" sx= {{ pb:1, fontFamily: 'sans-serif', fontSize: '0.875rem', '& *': { fontFamily: 'sans-serif', fontSize: '0.875rem'}}}>{userDetails.LEGAL_NAME}</Typography>
      </Grid>
      </Grid>
      <Grid item lg={4} md={4} sm={12} xs={12}>
      <Grid item xs={12}>
        <Typography variant="h5" sx= {{ pb:1, fontFamily: 'sans-serif', fontSize: '0.875rem', fontWeight: 'bold', '& *': { fontFamily: 'sans-serif', fontSize: '0.875rem', fontWeight: 'bold'}}}>Designation:</Typography>
      </Grid>
      <Grid item xs={12}>
        <Typography variant="h5" sx= {{ pb:1, fontFamily: 'sans-serif', fontSize: '0.875rem', '& *': { fontFamily: 'sans-serif', fontSize: '0.875rem'}}}>{userDetails.emp_designation}</Typography>
      </Grid>
      </Grid>
      <Grid item lg={4} md={4} sm={12} xs={12}>
      <Grid item xs={12}>
        <Typography variant="h5" sx= {{ pb:1, fontFamily: 'sans-serif', fontSize: '0.875rem', fontWeight: 'bold', '& *': { fontFamily: 'sans-serif', fontSize: '0.875rem', fontWeight: 'bold'}}}>Email:</Typography>
      </Grid>
      <Grid item xs={12}>
        <Typography variant="h5" sx= {{ pb:1, fontFamily: 'sans-serif', fontSize: '0.875rem', '& *': { fontFamily: 'sans-serif', fontSize: '0.875rem'}}}>{userDetails.WORK_EMAILID}</Typography>
      </Grid>
      </Grid>
      <Grid item lg={4} md={4} sm={12} xs={12}>
      <Grid item xs={12}>
        <Typography variant="h5" sx= {{ pb:1, fontFamily: 'sans-serif', fontSize: '0.875rem', fontWeight: 'bold', '& *': { fontFamily: 'sans-serif', fontSize: '0.875rem', fontWeight: 'bold'}}}>Mobile:</Typography>
      </Grid>
      <Grid item xs={12}>
        <Typography variant="h5" sx= {{ pb:1, fontFamily: 'sans-serif', fontSize: '0.875rem', '& *': { fontFamily: 'sans-serif', fontSize: '0.875rem'}}}>{userDetails.WORK_MOBILE_NUMBER}</Typography>
      </Grid>
      </Grid>
      <Grid item lg={4} md={4} sm={12} xs={12}>
      <Grid item xs={12}>
        <Typography variant="h5" sx= {{ pb:1, fontFamily: 'sans-serif', fontSize: '0.875rem', fontWeight: 'bold', '& *': { fontFamily: 'sans-serif', fontSize: '0.875rem', fontWeight: 'bold'}}}>Status:</Typography>
      </Grid>
      <Grid item xs={12}>
        <Typography variant="h5" sx= {{ pb:1, fontFamily: 'sans-serif', fontSize: '0.875rem', '& *': { fontFamily: 'sans-serif', fontSize: '0.875rem'}}}>{userDetails.STATUS}</Typography>
      </Grid>
      </Grid>
    </Grid>
    <Grid container spacing={4}>
    <Grid item xs={6} sx={{pb:4, height: '49vh'}}>
    <Grid item xs={12} sx={{pt: 2}}>
      <Typography variant="h4" sx={{ pb: 3, ml:-2, fontFamily: 'sans-serif', fontSize: '1.25rem', fontWeight: 'bold' }}>
        Update Password
      </Typography>
    </Grid>
    <Grid container spacing={2} direction="column" justifyContent="center" alignItems="center" sx={{ pt: 2, height: '95%', boxSizing: 'border-box', border: '1px solid #e0e0e0', boxShadow: '0px 0px 8px 2px rgba(0, 0, 0, 0.1)' }}>
      <UpdatePassword/>
    </Grid>
    </Grid>
    <Grid item xs={6} sx={{pb:4}}>
    <Grid item xs={12} sx={{pt: 2}}>
      <Typography variant="h4" sx={{ pb: 3, ml:-2, fontFamily: 'sans-serif', fontSize: '1.25rem', fontWeight: 'bold' }}>
        Profile Image
      </Typography>
    </Grid>
    <Grid container spacing={2} direction="column" justifyContent="center" alignItems="center" sx={{ height: '95%', boxSizing: 'border-box', border: '1px solid #e0e0e0', boxShadow: '0px 0px 8px 2px rgba(0, 0, 0, 0.1)' }}>
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', width: '100%', height: '100%' }}>
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
            <IconButton sx={{color:"rgb(27,28,54)"}} component="span">
              <CameraIcon />
            </IconButton>
          </label>
      </Box>
    </Grid>
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