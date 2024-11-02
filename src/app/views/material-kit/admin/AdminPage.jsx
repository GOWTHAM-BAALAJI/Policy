import React, { useState, useEffect } from "react";
import AddIcon from '@mui/icons-material/Add';
import { Box, Button, Card, Grid, IconButton, MenuItem, Select, styled, Tabs, Tab, TextField, Typography } from "@mui/material";
import { useForm, Controller } from 'react-hook-form';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate, useLocation } from 'react-router-dom';
import DataTable from 'react-data-table-component';
import { jwtDecode } from "jwt-decode";
import axios from 'axios';
import toast from "react-hot-toast";
import CloseIcon from '@mui/icons-material/Close';

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
    transition: "top 0.2s ease-out, font-size 0.2s ease-out",
  },
  "& .MuiInputLabel-shrink": {
    top: "2px", // Adjust this value to move the label to the border of the box outline
    fontSize: "0.75rem", // Optional: Reduce font size when the label is shrunk
  },
  '& .MuiInputBase-root': {
    height: 30, // Adjust the height as needed
    fontFamily: 'sans-serif',
    fontSize: '0.875rem',
    backgroundColor: 'transparent', // Default background color
  },

  "& .MuiOutlinedInput-root": {
    position: "relative", // Ensure the label is positioned relative to the input
  },

  "& .MuiInputBase-input": {
    backgroundColor: "transparent", // Input remains transparent
    height: "100%", // Ensure input takes full height
    boxSizing: "border-box",
  },
}));

const StyledSelect = styled(Select)(() => ({
    width: '100%',
    height: '30px', // Ensure the select component itself has a defined height
    fontFamily: 'sans-serif',
    fontSize: '0.875rem',
    '& .MuiInputBase-root': {
      height: '30px', // Apply the height to the input base
      alignItems: 'center', // Align the content vertically
      fontFamily: 'sans-serif',
      fontSize: '1.10rem'
    },
    '& .MuiInputLabel-root': {
      lineHeight: '30px', // Set the line height to match the height of the input
      top: '40', // Align the label at the top of the input
      transform: 'none', // Ensure there's no unwanted transformation
      left: '20px', // Add padding for better spacing
      fontFamily: 'sans-serif',
      fontSize: '0.875rem'
    },
    '& .MuiInputLabel-shrink': {
      top: '-6px', // Move the label when focused or with content
    },
}));

const customSort = (data, column, direction) => {
  return [...data].sort((a, b) => {
    const aValue = a[column] || ''; // Handle undefined values
    const bValue = b[column] || ''; // Handle undefined values
    if (aValue < bValue) {
      return direction === 'asc' ? -1 : 1;
    }
    if (aValue > bValue) {
      return direction === 'asc' ? 1 : -1;
    }
    return 0;
  });
};

export default function PSGTable() {
  const { control } = useForm();
  const navigate = useNavigate();
  const location = useLocation();

  const queryParams = new URLSearchParams(location.search);
  const initialTab = queryParams.get('tab') || '1';

  const [activeTab, setActiveTab] = useState(initialTab);
  const [tabledata, setTableData] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);

  const handleTabChange = (event, newValue) => {
    setActiveTab(newValue);
    setCurrentPage(1);
    if(newValue == 1){
        fetchData(currentPage, rowsPerPage);
    }
    else if(newValue == 2){
        fetchPolicyData(currentPage, rowsPerPage);
    }
    // fetchData(newValue, currentPage, rowsPerPage);
    // handleSearchType(newValue, currentPage, rowsPerPage, searchValue, selectedType);
  };

  const [psgList, setPsgList] = useState([]);
  const [psgList2, setPsgList2] = useState([]);
  const [userId, setUserId] = useState(null);
  const [roleId, setRoleId] = useState(null);

  const [loading, setLoading] = useState(true);
  const [rowsPerPage, setRowsPerPage] = useState(5);
  const [selectedRow, setSelectedRow] = useState(null);
  const [sortColumn, setSortColumn] = useState(''); // Column being sorted
  const [sortDirection, setSortDirection] = useState('asc');
  const [selectedDocument, setSelectedDocument] = useState(null);

  const [userCount, setUserCount] = useState(0);
  const [policyCount, setPolicyCount] = useState(0);
  const [count, setCount] = useState(userCount);

  useEffect(() => {
    if (userCount > 0) {
      setCount(userCount);
      setActiveTab('1');
    } else if (policyCount > 0) {
      setCount(policyCount);
      setActiveTab('2');
    }
  }, [userCount, policyCount]);

  const [selectedType, setSelectedType] = useState('');

  let filteredData;
  if(activeTab == 1){
    filteredData = psgList;
  } else if(activeTab == 2){
    filteredData = psgList2;
  }

  const handleSort = (column, sortDirection) => {
    setSortColumn(column.selector); // Store column to be sorted
    setSortDirection(sortDirection); // Store sort direction
  };

  const userToken = useSelector((state)=>{
    return state.token;//.data;
  });

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch('https://policyuat.spandanasphoorty.com/policy_apis/admin/get-user-count', {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${userToken}`, // Include JWT token in the headers
          },
        });
        const data = await response.json();

        if (data && data.status) {
          const userCount = data.count;
        //   const policyCount = data.policy;
          setUserCount(userCount || 0);
        //   setPolicyCount(policyCount || 0);
        }

        const response1 = await fetch('https://policyuat.spandanasphoorty.com/policy_apis/admin/get-policy-count', {
            method: 'GET',
            headers: {
              'Content-Type': 'application/json',
              Authorization: `Bearer ${userToken}`, // Include JWT token in the headers
            },
          });
          const data1 = await response1.json();
  
          if (data1 && data1.status) {
            // const userCount1 = data1.count;
            const policyCount1 = data1.count;
            // setUserCount(userCount1 || 0);
            setPolicyCount(policyCount1 || 0);
          }

        // setPsgList(formattedData);
      } catch (error) {
        console.error('Error fetching data', error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const fetchData = async (page, rows) => {
    setLoading(true);
    try {
        let url = `https://policyuat.spandanasphoorty.com/policy_apis/admin/get-all-user?page=${page}&rows=${rows}`;
        const response = await fetch(url, {
            method: 'GET',
            headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${userToken}`, // Include JWT token in the headers
            },
        });
        const data = await response.json();
        setPsgList(data.data); // Adjust this based on your API response structure
        let urlcount = `https://policyuat.spandanasphoorty.com/policy_apis/admin/get-user-count`;
        const responsecount = await fetch(urlcount, {
            method: 'GET',
            headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${userToken}`, // Include JWT token in the headers
            },
        });
        const datacount = await responsecount.json();
    
        if (datacount && datacount.status) {
            const usercount = datacount.count;
            setUserCount(usercount || 0);
        }
        setCount(userCount);
        console.log("User count: ",userCount);
        console.log("Count: ",count);
        const decodedToken = jwtDecode(userToken);
        if (decodedToken.role_id) {
            setRoleId(decodedToken.role_id);
        }
        if (decodedToken.user_id) {
            setUserId(decodedToken.user_id);
        }
    } catch (error) {
        console.error('Error fetching data:', error);
    } finally {
        setLoading(false);
    }
  };

  const fetchPolicyData = async (page, rows) => {
    setLoading(true);
    try {
      let url = `https://policyuat.spandanasphoorty.com/policy_apis/admin/get-all-policy?page=${page}&rows=${rows}`;
      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${userToken}`, // Include JWT token in the headers
        },
      });
      const data = await response.json();
      setPsgList2(data.data); // Adjust this based on your API response structure
      let urlcount = `https://policyuat.spandanasphoorty.com/policy_apis/admin/get-policy-count`;
        const responsecount = await fetch(urlcount, {
            method: 'GET',
            headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${userToken}`, // Include JWT token in the headers
            },
        });
        const datacount = await responsecount.json();
    
        if (datacount && datacount.status) {
            const policycount = datacount.count;
            setPolicyCount(policycount || 0);
        }
      setCount(policyCount);
      console.log("Policy count: ",policyCount);
      console.log("Count: ",count);
      const decodedToken = jwtDecode(userToken);
      if (decodedToken.role_id) {
        setRoleId(decodedToken.role_id);
      }
      if (decodedToken.user_id) {
        setUserId(decodedToken.user_id);
      }
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

//   useEffect(() => {
//     console.log("Updated count:", count);
//   }, [count]);

  const [searchValue, setSearchValue] = useState('');
  const [isSearching, setIsSearching] = useState(false);

  const handleInputChange = (event) => {
    setSearchValue(event.target.value);
  };

  const [isBtnDisabled, setIsBtnDisabled] = useState(false);

//   const handleSearchType = async (tab, page, rows, searchValue, selectedType) => {
//     setLoading(true);

//     setIsBtnDisabled(true);
//         setTimeout(() => {
//             setIsBtnDisabled(false);
//         }, 1000);

//     setIsSearching(true);
//     setSelectedType(selectedType);
  
//     try {
//       const response = await fetch(`https://policyuat.spandanasphoorty.com/policy_apis/policy/user?tab=${tab}&page=${page}&rows=${rows}&search=${searchValue}&type=${selectedType}`, {
//         method: 'GET',
//         headers: {
//           'Content-Type': 'application/json',
//           Authorization: `Bearer ${userToken}`,
//         },
//       });
//       const data = await response.json();
//       setPsgList(data);
  
//       const countResponse = await fetch(`https://policyuat.spandanasphoorty.com/policy_apis/policy/user/count?search=${searchValue}&type=${selectedType}`, {
//         method: 'GET',
//         headers: {
//           'Content-Type': 'application/json',
//           Authorization: `Bearer ${userToken}`,
//         },
//       });
  
//       if (!countResponse.ok) {
//         throw new Error('Failed to fetch count data');
//       }
  
//       const countData = await countResponse.json();
  
//       if (tab === "1") setCount(countData.approved);
//       if (tab === "2") setCount(countData.rejected);
//       if (tab === "3") setCount(countData.pending);
//       if (tab === "4") setCount(countData.waitingForAction);
  
//     } catch (error) {
//       console.error('Error fetching data:', error);
//     } finally {
//       setLoading(false);
//     }
//   }; 

  const handleSearchData = async (page, rows, searchValue) => {
    setLoading(true);

    setIsBtnDisabled(true);
        setTimeout(() => {
            setIsBtnDisabled(false);
        }, 1000);
  
    // Check for empty search value and return early if invalid
    // if (!(searchValue.trimStart())) {
    //   toast.error("Please provide some search words");
    //   setLoading(false);
    //   setIsBtnDisabled(true);
    //     setTimeout(() => {
    //         setIsBtnDisabled(false);
    //     }, 1000);
    //   return;
    // }

    setIsSearching(true);
    setSearchValue(searchValue.trimStart());
  
    try {
      // First API call: Fetch data based on searchValue
      const response = await fetch(`https://policyuat.spandanasphoorty.com/policy_apis/policy/user?page=${page}&rows=${rows}&search=${searchValue}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${userToken}`,
        },
      });
      const data = await response.json();
      setPsgList(data);
  
      // Second API call: Fetch the count data based on searchValue
      const countResponse = await fetch(`https://policyuat.spandanasphoorty.com/policy_apis/policy/user/count?search=${searchValue}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${userToken}`,
        },
      });
  
      if (!countResponse.ok) {
        throw new Error('Failed to fetch count data');
      }
  
      const countData = await countResponse.json();
  
      // Check tab values and set the count based on the tab
    //   if (tab === "1") setCount(countData.user);
    //   if (tab === "2") setCount(countData.policy);
  
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };  

  const getDisplayPolicyId = (policy_id) => {
    return "PL" + String(policy_id).padStart(7, "0");
  };

  const columns1 = [
    {
      name: 'S.No.',
      selector: (row, index) => (currentPage - 1) * rowsPerPage + index + 1,
      width: '15%',
    },
    {
      name: 'Employee ID',
      selector: row => row.emp_id || 'N/A',
      sortable: true,
      // center: true,
      width: '20%',
      cell: (row) => (
        <Typography
          variant="body2"
          sx={{ textAlign: 'left', cursor: 'pointer', color: '#ee8812', textDecoration: 'none', paddingLeft: '8px', fontWeight: 'bold', fontSize: '16px' }}
          onClick={() => handleRowClick(row)}
        >
          {row.emp_id}
        </Typography>
      ),
    },
    {
        name: 'Employee Name',
        selector: row => row.emp_name || 'N/A',
        sortable: true,
        // center: true,
        width: '30%',
        cell: (row) => (
          <Typography
            variant="body2"
            sx={{ textAlign: 'left', cursor: 'pointer', color: '#ee8812', textDecoration: 'none', paddingLeft: '8px', fontWeight: 'bold', fontSize: '16px' }}
            onClick={() => handleRowClick(row)}
          >
            {row.emp_name}
          </Typography>
        ),
    },
    {
        name: 'Employee Email',
        selector: row => row.emp_email || 'N/A',
        sortable: true,
        // center: true,
        width: '35%',
        cell: (row) => (
          <Typography
            variant="body2"
            sx={{ textAlign: 'left', cursor: 'pointer', color: '#ee8812', textDecoration: 'none', paddingLeft: '8px', fontWeight: 'bold', fontSize: '16px' }}
            onClick={() => handleRowClick(row)}
          >
            {row.emp_email}
          </Typography>
        ),
    },
  ];

  const columns2 = [
    {
    name: 'Policy ID',
    selector: row => row.id || 'N/A',
    sortable: true,
    // center: true,
    cell: (row) => (
        <div style={{ textAlign: 'left', width: '100%', paddingLeft: '8px' }}>
          {getDisplayPolicyId(row.id) || 'N/A'}
        </div>
    ),
    width: '15%',
    },
    {
    name: 'Document Title',
    selector: row => row.title || 'N/A',
    sortable: true,
    // center: true,
    width: '35%',
    cell: (row) => (
        <Typography
        variant="body2"
        sx={{ textAlign: 'center', cursor: 'pointer', color: '#ee8812', textDecoration: 'none', paddingLeft: '8px', fontWeight: 'bold', fontSize: '16px' }}
        onClick={() => handleRowClick(row)}
        >
        {row.title}
        </Typography>
    ),
    },
    {
      name: 'Type',
      selector: row => row.type || 'N/A',
      // sortable: true,
      // center: true,
      width: '20%',
      cell: (row) => {
        const typeMapping = {
          1: 'Policy',
          2: 'SOP',
          3: 'Guidance Note'
        };
        const displayType = typeMapping[row.type] || 'N/A';
        return (
          <div style={{ textAlign: 'left', width: '100%', paddingLeft: '8px' }}>
            {displayType}
          </div>
        );
      }
    },
    {
    name: 'Description',
    selector: row => row.description || 'N/A',
    sortable: true,
    // center: true,
    width: '30%',
    cell: (row) => (
        <Typography
        variant="body2"
        sx={{
            whiteSpace: 'nowrap',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            maxWidth: '600px',
            textAlign: 'center',
            paddingLeft: '8px'
        }}
        title={row.description} // Shows full text on hover
        >
        {row.description}
        </Typography>
    ),
    },
  ];

  let columns;
  if(activeTab == 1){
    columns = columns1;
  } else if(activeTab == 2) {
    columns = columns2;
  }

  const handlePageChange = (newPage) => {
    if (isSearching) {
      setCurrentPage(newPage);
      handleSearchData(newPage, rowsPerPage, searchValue);
    } else {
        if(activeTab == 1){
            setCurrentPage(newPage);
            fetchData(activeTab, newPage, rowsPerPage);
        } else{
            setCurrentPage(newPage);
            fetchPolicyData(newPage, rowsPerPage);
        }
    }
  };

  // const handlePageChange = (page) => {
  //   setCurrentPage(page);
  //   fetchData(activeTab, page, rowsPerPage);
  // };

  const handleRowsPerPageChange = (newRowsPerPage) => {
    if (isSearching) {
      setRowsPerPage(newRowsPerPage);
      handleSearchData(currentPage, newRowsPerPage, searchValue);  // Search API with updated rows per page
    } else {
        if(activeTab == 1){
            setRowsPerPage(newRowsPerPage);
            fetchData(activeTab, currentPage, newRowsPerPage);
        } else{
            setRowsPerPage(newRowsPerPage);
            fetchPolicyData(currentPage, newRowsPerPage);
        }
    }
  };

  // const handleRowsPerPageChange = (newRowsPerPage, page) => {
  //   setRowsPerPage(newRowsPerPage);
  //   setCurrentPage(1);
  //   fetchData(activeTab, 1, newRowsPerPage);
  // };

  useEffect(() => {
    fetchData(activeTab, currentPage, rowsPerPage);
    // fetchPolicyData(currentPage, rowsPerPage);
  }, [currentPage, rowsPerPage]);

//   useEffect(() => {
//     handleSearchType(activeTab, currentPage, rowsPerPage, searchValue, selectedType);
//   }, [selectedType, activeTab, currentPage, rowsPerPage, searchValue]);

  const handleRowClick = (row) => {
    setSelectedDocument(row.title);
    setSelectedRow(row);
    // setDecision('');
    // setRemarks('');
    // setUploadedFile(null);
    navigate(`/policy/${row.id}`, { state: { title: row.title, status: row.status, activeTab }});
  };


  return (
    <ContentBox className="analytics">
    <Card sx={{ px: 1, py: 1, height: '100%', width: '100%' }}>
    <Grid container spacing={2} sx={{ width: '100%', height: '100%' }}>
      <Grid item lg={12} md={12} sm={12} xs={12}>
        <Typography variant="h5" sx={{ fontFamily: 'sans-serif', fontWeight: 'bold', fontSize: '1rem', marginLeft: 2, marginTop: 2, marginRight: 2 }}>
          Admin Portal
        </Typography>
      </Grid>
      <Grid item lg={12} md={12} sm={12} xs={12} sx={{ marginTop: -2, display: 'flex', flexDirection: { xs: 'column', sm: 'column', md: 'row', lg: 'row' }, alignItems: 'center', overflowX: 'auto', whiteSpace: 'nowrap' }}>
        <Tabs
          value={activeTab}
          onChange={handleTabChange}
          textColor="inherit"
          indicatorColor="secondary"
        >
          <Tab label="User Management" value="1" sx={{ fontFamily: "sans-serif", fontSize: '1rem', fontWeight: 100, textTransform: "none" }} />
          <Tab label="Policy Management" value="2" sx={{ fontFamily: "sans-serif", fontSize: '1rem', fontWeight: 100, textTransform: "none" }} />
        </Tabs>
      </Grid>
      <Grid item lg={12} md={12} sm={12} xs={12} sx={{ marginLeft: 2, display: 'flex', alignItems: 'center' }}>
        <StyledTextField
          value={searchValue}
          onChange={handleInputChange}
          placeholder="Search..."
          sx={{ width: '300px', marginRight: 2 }}
        />
        {searchValue && (
          <IconButton
            onClick={() => {
              setSearchValue(''); // Clear the search field
              setIsSearching(false); // Reset isSearching state
              fetchData(activeTab, currentPage, rowsPerPage); // Fetch data without search
            }}
            sx={{ marginRight: 1, marginLeft: -2, marginTop: -2 }} // Adjust for proper spacing
          >
            <CloseIcon />
          </IconButton>
        )}
        {/* <Button
          variant="contained"
          color="primary"
          disabled={isBtnDisabled}
          sx={{ marginTop: -2, textTransform: 'none', height: '30px', backgroundColor: '#ee8812', '&:hover': { backgroundColor: 'rgb(249, 83, 22)', }, }}
          onClick={() => handleSearchData(activeTab, currentPage, rowsPerPage, searchValue)}
        >
          Search
        </Button> */}
      </Grid>
      <Grid item lg={12} md={12} sm={12} xs={12} sx={{ marginTop: -2 }}>
        <Box width="100%" height="100%" overflow="auto">
          <DataTable
            columns={columns}
            data={filteredData}
            progressPending={loading}
            pagination
            paginationServer
            paginationTotalRows={count} // Adjust to the total records returned by your API
            paginationRowsPerPageOptions={[5, 10, 25]}
            paginationPerPage={rowsPerPage}
            onChangePage={handlePageChange}
            onChangeRowsPerPage={handleRowsPerPageChange}
            customStyles={{
              table: {
                style: {
                  width: '100%',
                  autowidth: false,
                  scrollX: true,
                  responsive: true,
                  tableLayout: 'fixed',
                },
              },
              headCells: {
                style: {
                  fontSize: '0.875rem',
                  fontFamily: 'sans-serif',
                  fontWeight: 'bold',
                  textAlign: 'center',
                },
              },
              cells: {
                style: {
                  fontFamily: 'sans-serif',
                  fontSize: '0.875rem',
                  textAlign: 'center',
                  padding: '8px',
                },
              },
            }}
          />
        </Box>
      </Grid>
    </Grid>
    </Card>
    </ContentBox>
  );
};
