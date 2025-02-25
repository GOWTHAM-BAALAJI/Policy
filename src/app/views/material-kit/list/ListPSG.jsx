import React, { useState, useEffect } from "react";
import AddIcon from '@mui/icons-material/Add';
import { Box, Button, Card, Grid, IconButton, MenuItem, Select, styled, Tabs, Tab, TextField, Typography } from "@mui/material";
import { useForm, Controller } from 'react-hook-form';
import { useSelector } from 'react-redux';
import { useNavigate, useLocation } from 'react-router-dom';
import DataTable from 'react-data-table-component';
import { jwtDecode } from "jwt-decode";
import CloseIcon from '@mui/icons-material/Close';
import useCustomFetch from "../../../hooks/useFetchWithAuth";
import { useMediaQuery } from '@mui/material';
import useDebouce from "app/hooks/useDebouce";

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
    top: "2px",
    fontSize: "0.75rem",
  },
  '& .MuiInputBase-root': {
    height: 30,
    fontFamily: 'sans-serif',
    fontSize: '0.875rem',
    backgroundColor: 'transparent',
  },

  "& .MuiOutlinedInput-root": {
    position: "relative",
  },

  "& .MuiInputBase-input": {
    backgroundColor: "transparent",
    height: "100%",
    boxSizing: "border-box",
  },
}));

const StyledSelect = styled(Select)(() => ({
    width: '100%',
    height: '25px',
    fontFamily: 'sans-serif',
    fontSize: '0.875rem',
    '& .MuiInputBase-root': {
      height: '30px',
      alignItems: 'center',
      fontFamily: 'sans-serif',
      fontSize: '1.10rem'
    },
    '& .MuiInputLabel-root': {
      lineHeight: '30px',
      top: '40',
      transform: 'none',
      left: '20px',
      fontFamily: 'sans-serif',
      fontSize: '0.875rem'
    },
    '& .MuiInputLabel-shrink': {
      top: '-6px',
    },
}));

export default function PSGTable() {
  const { control } = useForm();
  const navigate = useNavigate();
  const location = useLocation();
  const queryParams = new URLSearchParams(location.search);
  const initialTab = Number(queryParams.get("tab")) || 4;
  const [activeTab, setActiveTab] = useState(initialTab);
  const [currentPage, setCurrentPage] = useState(1);
  const customFetchWithAuth=useCustomFetch();

  const handleTabChange = (event, newValue) => {
    setActiveTab(newValue);
    setCurrentPage(1);
    handleSearchType(newValue, currentPage, rowsPerPage, searchValue, selectedType);
  };

  const [psgList, setPsgList] = useState([]);
  const [userId, setUserId] = useState(null);
  const [roleId, setRoleId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [rowsPerPage, setRowsPerPage] = useState(5);
  const [selectedRow, setSelectedRow] = useState(null);
  const [sortColumn, setSortColumn] = useState('');
  const [sortDirection, setSortDirection] = useState('asc');
  const [selectedDocument, setSelectedDocument] = useState(null);
  const [approvedCount, setApprovedCount] = useState(0);
  const [rejectedCount, setRejectedCount] = useState(0);
  const [pendingCount, setPendingCount] = useState(0);
  const [waitingForActionCount, setWaitingForActionCount] = useState(0);
  const [count, setCount] = useState(waitingForActionCount);

  useEffect(() => {
    if (waitingForActionCount > 0) {
      setCount(waitingForActionCount);
      setActiveTab(4);
    } else if (approvedCount > 0) {
      setCount(approvedCount);
      setActiveTab(1);
    } else if (rejectedCount > 0) {
      setCount(rejectedCount);
      setActiveTab(2);
    } else if (pendingCount > 0) {
      setCount(pendingCount);
      setActiveTab(3);
    }
  }, [waitingForActionCount, approvedCount, rejectedCount, pendingCount]);

  const [selectedType, setSelectedType] = useState('');
  const filteredData = selectedType ? psgList.filter(record => record.type === Number(selectedType)) : psgList;

  const userToken = useSelector((state)=>{
    return state.token;
  });

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await customFetchWithAuth(`${process.env.REACT_APP_POLICY_BACKEND}policy/user/count`, "GET",1,{});
        const data =await response.json();
        if (data && data.status) {
          const approvedCount = data.approved;
          const rejectedCount = data.rejected;
          const pendingCount = data.pending;
          const waitingForActionCount = data.waitingForAction;
          setApprovedCount(approvedCount || 0);
          setRejectedCount(rejectedCount || 0);
          setPendingCount(pendingCount || 0);
          setWaitingForActionCount(waitingForActionCount || 0);
        }
      } catch (error) {
        console.error('Error fetching data', error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const fetchData = async (tab, page, rows) => {
    setLoading(true);
    try {
      let url = `${process.env.REACT_APP_POLICY_BACKEND}policy/user?tab=${tab}&page=${page}&rows=${rows}`;
      const response = await customFetchWithAuth(url,"GET",1,{});
      const data = await response.json();
      setPsgList(data);
      if (tab == 1){
        setCount(approvedCount || 0);
      }
      else if (tab == 2){
        setCount(rejectedCount || 0);
      }
      else if (tab == 3){
        setCount(pendingCount || 0);
      }
      else if (tab == 4){
        setCount(waitingForActionCount || 0);
      }
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  const [searchValue, setSearchValue] = useState('');
  let deboucedSearchValue = useDebouce(searchValue, 200);
  const [isSearching, setIsSearching] = useState(false);
  const [isSelectingType, setIsSelectingType] = useState(false);
  const handleInputChange = (event) => {
    setSearchValue(event.target.value);
  };

  const handleSearchType = async (tab, page, rows, searchValue, selectedType) => {
    setLoading(true);
    setIsSearching(true);
    setIsSelectingType(true);
    setSelectedType(selectedType);
    try {
      const response = await customFetchWithAuth(`${process.env.REACT_APP_POLICY_BACKEND}policy/user?tab=${tab}&page=${page}&rows=${rows}&search=${searchValue}&type=${selectedType}`,"GET",1,{});
      const data =await response.json();
      setPsgList(data);
  
      const countResponse = await customFetchWithAuth(`${process.env.REACT_APP_POLICY_BACKEND}policy/user/count?search=${searchValue}&type=${selectedType}`, "GET",1,{});
      if (!countResponse.status) {
        throw new Error('Failed to fetch count data');
      }
      const countData = await countResponse.json();
      if (tab == 1) setCount(countData.approved);
      if (tab == 2) setCount(countData.rejected);
      if (tab == 3) setCount(countData.pending);
      if (tab == 4) setCount(countData.waitingForAction);
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  }; 

  const handleSearchData = async (tab, page, rows, searchValue, selectedType) => {
    setLoading(true);
    setIsSearching(true);
    setSearchValue(searchValue.trimStart());
    try {
      const response = await customFetchWithAuth(`${process.env.REACT_APP_POLICY_BACKEND}policy/user?tab=${tab}&page=${page}&rows=${rows}&search=${searchValue}&type=${selectedType}`, "GET",1,{});
      const data = await  response.json();
      setPsgList(data);
  
      const countResponse = await customFetchWithAuth(`${process.env.REACT_APP_POLICY_BACKEND}policy/user/count?search=${searchValue}&type=${selectedType}`,"GET",1,{});
      if (!countResponse.status) {
        throw new Error('Failed to fetch count data');
      }
      const countData =await  countResponse.json();
      if (tab == 1) setCount(countData.approved);
      if (tab == 2) setCount(countData.rejected);
      if (tab == 3) setCount(countData.pending);
      if (tab == 4) setCount(countData.waitingForAction);
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };  

  const getDisplayPolicyId = (policy_id) => {
    return "PL" + String(policy_id).padStart(7, "0");
  };

  const isXs = useMediaQuery((theme) => theme.breakpoints.down('sm'));

  const columns1 = [
    {
      name: 'Document ID',
      selector: row => row.id || 'N/A',
      cell: (row) => (
        <div style={{ textAlign: 'left', width: '100%', paddingLeft: '8px' }}>
          {getDisplayPolicyId(row.id) || 'N/A'}
        </div>
      ),
      width: isXs ? '30%' : '15%',
    },
    {
      name: 'Document Title',
      selector: row => row.title || 'N/A',
      width: isXs ? '50%' : '40%',
      cell: (row) => (
        <Typography variant="body2" sx={{ textAlign: 'left', cursor: 'pointer', color: '#ee8812', textDecoration: 'none', paddingLeft: '8px', fontWeight: 'bold', fontSize: '16px' }} onClick={() => handleRowClick(row)}>
          {row.title}
        </Typography>
      ),
    },
    {
      name: 'Type',
      selector: row => row.type || 'N/A',
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
      name: activeTab == 3 ? 'Pending At' : activeTab == 1 ? 'Approved On' : 'Updated On',
      cell: (row) => {
        return (
          <div style={{ textAlign: 'left', width: '100%', paddingLeft: '8px' }}>
            {activeTab == 3 ? (row.pending_at_details?.emp_name || 'N/A') : activeTab == 1 ? new Date(row.approvedAt).toLocaleDateString() || 'N/A' : new Date(row.updatedAt).toLocaleDateString() || 'N/A'}
          </div>
        );
      },
      width: isXs ? '30%' : '25%',
    },
  ];

  const isInitiator = (role_id) => {
    let temp = Number(role_id);
    const bin = temp.toString(2);
    return bin[bin.length - 1] == "1";
  };

  const columns = columns1;

  const handlePageChange = (newPage) => {
    if (isSearching || isSelectingType) {
      setCurrentPage(newPage);
      handleSearchType(activeTab, newPage, rowsPerPage, searchValue, selectedType);
    } else {
      setCurrentPage(newPage);
      fetchData(activeTab, newPage, rowsPerPage);
    }
  };

  const handleRowsPerPageChange = (newRowsPerPage) => {
    if (isSearching || isSelectingType) {
      setRowsPerPage(newRowsPerPage);
      handleSearchType(activeTab, currentPage, newRowsPerPage, searchValue, selectedType);
    } else {
      setRowsPerPage(newRowsPerPage);
      fetchData(activeTab, currentPage, newRowsPerPage);
    }
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

  useEffect(() => {
    if(!isSearching){
      fetchData(activeTab, currentPage, rowsPerPage);
    }
  }, [activeTab, currentPage, rowsPerPage]);

  // useEffect(() => {
  //   handleSearchType(activeTab, currentPage, rowsPerPage, searchValue, selectedType);
  // }, [selectedType, activeTab, currentPage, rowsPerPage, searchValue]);

  useEffect(() => {
    handleSearchType(activeTab, currentPage, rowsPerPage, deboucedSearchValue, selectedType);
  }, [selectedType, activeTab, currentPage, rowsPerPage, deboucedSearchValue]);

  const handleRowClick = (row) => {
    setSelectedDocument(row.title);
    setSelectedRow(row);
    navigate(`/policy/${row.id}`, { state: { title: row.title, status: row.status, activeTab, fromHandleRowClick: true }});
  };

  return (
    <ContentBox className="analytics">
    <Card sx={{ px: 1, py: 1, height: '100%', width: '100%', flexDirection: { lg: 'row', md: 'row', sm: 'column', xs: 'column' } }}>
    <Grid container spacing={2} sx={{ width: '100%', height: '100%' }}>
      <Grid item lg={6} md={6} sm={12} xs={12} sx={{ mb: {sm:-2, xs:-2} }}>
        <Typography variant="h5" sx={{ fontFamily: 'sans-serif', fontWeight: 'bold', fontSize: '1rem', marginLeft: 2, marginTop: 2, marginRight: 2 }}>
          Policies, SOPs & Guidance notes
        </Typography>
      </Grid>
      {(isInitiator(roleId)) && (
        <Grid item lg={3} md={3} sm={6} xs={6} sx={{ml: {sm: 1, xs: 1}}}>
          <Button variant="contained" startIcon={<AddIcon />} sx={{ fontFamily: 'sans-serif', fontSize: '0.875rem', textTransform: 'none', marginTop: { sm: 2, xs: 2 }, height: '25px', backgroundColor: '#ee8812', '&:hover': { backgroundColor: 'rgb(249, 83, 22)', }, }} onClick={() => navigate('/initiate/psg')}>
            New
          </Button>
        </Grid>
      )}
      <Grid item lg={(isInitiator(roleId)) ? 2.9 : 6} md={(isInitiator(roleId)) ? 2.7 : 6} sm={(isInitiator(roleId)) ? 5.7 : 12} xs={(isInitiator(roleId)) ? 5.5 : 12}>
        <Grid item xs={12} sx={{ display: 'flex', justifyContent: 'flex-end', alignItems: 'center', mt: 2, mr: 2 }}>
          <Typography variant="h5" sx={{ fontFamily: 'sans-serif', fontSize: '0.875rem', mr: 2, mt: 0.5 }}>
            <b>Type</b>
          </Typography>
          <Controller
            name="documentType"
            control={control}
            defaultValue={selectedType}
            render={({ field }) => (
              <StyledSelect
                labelId="document-type-label"
                id="documentType"
                {...field}
                value={field.value ?? selectedType}
                displayEmpty
                sx={{ width: '160px', }}
                onChange={(e) => {
                  field.onChange(e);
                  setSelectedType(e.target.value);
                }}
              >
                <MenuItem value="">All</MenuItem>
                <MenuItem value={1}>Policy</MenuItem>
                <MenuItem value={2}>SOP</MenuItem>
                <MenuItem value={3}>Guidance Note</MenuItem>
              </StyledSelect>
            )}
          />
        </Grid>
      </Grid>
      <Grid item lg={12} md={12} sm={12} xs={12} sx={{ marginTop: -2, marginLeft: 2, display: 'flex', flexDirection: { xs: 'column', sm: 'column', md: 'row', lg: 'row' }, alignItems: 'center' }}>
      <Box sx={{ overflowX: 'auto', width: '100%' }}>
        <Tabs value={activeTab} onChange={handleTabChange} textColor="inherit" indicatorColor="secondary" variant="scrollable" scrollButtons="auto" sx={{ whiteSpace: 'nowrap' }}>
          <Tab label="Waiting for Action" value={4} sx={{ minWidth: 0, padding: '6px 0px', margin: 0, fontFamily: "sans-serif", fontSize: '0.875rem', fontWeight: 100, textTransform: "none", mr: 1, }} />
          <Tab label="Approved" value={1} sx={{ minWidth: 0, padding: '6px 0px', margin: 0, fontFamily: "sans-serif", fontSize: '0.875rem', fontWeight: 100, textTransform: "none", mr: 1, ml: 1, }} />
          <Tab label="Rejected" value={2} sx={{ minWidth: 0, padding: '6px 0px', margin: 0, fontFamily: "sans-serif", fontSize: '0.875rem', fontWeight: 100, textTransform: "none", mr: 1, ml: 1, }} />
          <Tab label="Pending" value={3} sx={{ minWidth: 0, padding: '6px 0px', margin: 0, fontFamily: "sans-serif", fontSize: '0.875rem', fontWeight: 100, textTransform: "none", ml: 1, }} />
        </Tabs>
      </Box>
      </Grid>
      <Grid item lg={12} md={12} sm={12} xs={12} sx={{ marginLeft: 2, display: 'flex', alignItems: 'center' }}>
        <StyledTextField value={searchValue} onChange={handleInputChange} placeholder="Search Document ID or Title" sx={{ width: '300px', marginRight: 2 }}/>
        {searchValue && (
          <IconButton
            onClick={() => {
              setSearchValue('');
              setIsSearching(false);
              fetchData(activeTab, currentPage, rowsPerPage);
            }}
            sx={{ marginRight: 1, marginLeft: -2, marginTop: -2 }}
          >
            <CloseIcon />
          </IconButton>
        )}
      </Grid>
      <Grid item lg={12} md={12} sm={12} xs={12} sx={{ marginTop: -2 }}>
        <Box width="100%" height="100%" overflow="auto">
          <div style={{ overflowX: 'auto', position: 'relative', }}>
            <div style={{ content: '""', position: 'absolute', bottom: 0, left: 0, width: '100%', height: '1px', backgroundColor: '#ddd', zIndex: 1, transform: 'scaleX(1)', }}/>
              <DataTable
                columns={columns}
                data={psgList}
                // progressPending={loading}
                pagination
                paginationServer
                paginationTotalRows={count}
                paginationRowsPerPageOptions={[5, 10, 25]}
                paginationPerPage={rowsPerPage}
                onChangePage={handlePageChange}
                onChangeRowsPerPage={handleRowsPerPageChange}
                customStyles={{
                  table: {
                    style: {
                      minWidth: isXs ? '130%' : '100%',
                      width: '100%',
                      tableLayout: 'fixed',
                      borderBottom: '1px solid #ddd',
                    },
                  },
                  headCells: {
                    style: {
                      fontSize: '0.875rem',
                      fontFamily: 'sans-serif',
                      fontWeight: 'bold',
                      textAlign: 'center',
                      borderBottom: '1px solid #ddd',
                    },
                  },
                  cells: {
                    style: {
                      fontFamily: 'sans-serif',
                      fontSize: '0.875rem',
                      textAlign: 'center',
                      padding: '8px',
                      borderBottom: '1px solid #ddd',
                    },
                  },
                }}
              />
          </div>
        </Box>
      </Grid>
    </Grid>
    </Card>
    </ContentBox>
  );
};
