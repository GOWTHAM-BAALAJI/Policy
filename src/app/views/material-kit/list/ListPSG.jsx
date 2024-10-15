import React, { useState, useEffect } from "react";
import AddIcon from '@mui/icons-material/Add';
import { Box, Button, Card, Grid, MenuItem, Select, styled, Tabs, Tab, Typography } from "@mui/material";
import { useForm, Controller } from 'react-hook-form';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate, useLocation } from 'react-router-dom';
import DataTable from 'react-data-table-component';
import { jwtDecode } from "jwt-decode";

const ContentBox = styled("div")(({ theme }) => ({
  margin: "20px",
  [theme.breakpoints.down("sm")]: { margin: "16px" }
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
  const initialTab = queryParams.get('tab') || '4';

  const [activeTab, setActiveTab] = useState(initialTab);
  const [tabledata, setTableData] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);

  const handleTabChange = (event, newValue) => {
    setActiveTab(newValue);
    setCurrentPage(1);
    fetchData(newValue, currentPage, rowsPerPage);
  };

  const [psgList, setPsgList] = useState([]);
  const [userId, setUserId] = useState(null);
  const [roleId, setRoleId] = useState(null);

  const [loading, setLoading] = useState(true);
  const [rowsPerPage, setRowsPerPage] = useState(5);
  const [selectedRow, setSelectedRow] = useState(null);
  const [sortColumn, setSortColumn] = useState(''); // Column being sorted
  const [sortDirection, setSortDirection] = useState('asc');
  const [selectedDocument, setSelectedDocument] = useState(null);

  const [approvedCount, setApprovedCount] = useState(0);
  const [rejectedCount, setRejectedCount] = useState(0);
  const [pendingCount, setPendingCount] = useState(0);
  const [waitingForActionCount, setWaitingForActionCount] = useState(0);
  const [count, setCount] = useState(0);
  // console.log("Count: ",count);

  const handleSort = (column, sortDirection) => {
    setSortColumn(column.selector); // Store column to be sorted
    setSortDirection(sortDirection); // Store sort direction
  };

  const userToken = useSelector((state)=>{
    return state.token;//.data;
  });
  console.log("UserToken:",userToken);

  // useEffect(() => {
  //   console.log("Initial tab: ", initialTab);
  
  //   if (initialTab == '1'){
  //     console.log("Initial tab: ",initialTab);
  //     console.log("Approved count: ", approvedCount);
  //     setCount(approvedCount || 0);
  //   }
  //   else if (initialTab == 2){
  //     console.log("Rejected count: ", rejectedCount);
  //     setCount(rejectedCount || 0);
  //   }
  //   else if (initialTab == 3){
  //     console.log("Pending count: ", pendingCount);
  //     setCount(pendingCount || 0);
  //   }
  //   else if (initialTab == 4){
  //     console.log("Initial tab: ",initialTab);
  //     console.log("Waiting count: ", waitingForActionCount);
  //     setCount(waitingForActionCount || 0);
  //   }
  // }, [initialTab, approvedCount, rejectedCount, pendingCount, waitingForActionCount]);

  // if (initialTab === 1){
  //   console.log("Initial tab: ",initialTab);
  //   setCount(approvedCount || 0);
  // }
  // else if (initialTab === 2){
  //   setCount(rejectedCount || 0);
  // }
  // else if (initialTab === 3){
  //   setCount(pendingCount || 0);
  // }
  // else if (initialTab === 4){
  //   console.log("Initial tab: ",initialTab);
  //   setCount(waitingForActionCount || 0);
  // }
  // console.log('Count for Tab:', count);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch('http://localhost:3000/policy/user/count', {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${userToken}`, // Include JWT token in the headers
          },
        });
        console.log(response);
        const data = await response.json();
        console.log("Data:",data);

        if (data && data.status) {
          const approvedCount = data.approved;
          const rejectedCount = data.rejected;
          const pendingCount = data.pending;
          const waitingForActionCount = data.waitingForAction;
          setApprovedCount(approvedCount || 0);
          setRejectedCount(rejectedCount || 0);
          setPendingCount(pendingCount || 0);
          setWaitingForActionCount(waitingForActionCount || 0);
          console.log('Approved:', approvedCount);
          console.log('Rejected:', rejectedCount);
          console.log('Pending:', pendingCount);
          console.log('Waiting for Action:', waitingForActionCount);
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

  const totalLength = approvedCount + rejectedCount + pendingCount + waitingForActionCount;

  // useEffect(() => {
  //   const fetchData = async (tab, page, rows) => {
  //     try {
        // const response = await fetch(`http://localhost:3000/policy/user?tab=${tab}&page=${page}&rows=${rows}`, {
        //   method: 'GET',
        //   headers: {
        //     'Content-Type': 'application/json',
        //     Authorization: `Bearer ${userToken}`, // Include JWT token in the headers
        //   },
        // });
  //       console.log(response);
  //       const data = await response.json();
  //       console.log("Data:",data);
  //       // const { approved, rejected, pending, waitingForAction } = response.data;

  //       // Flatten the data and add the status field
  //       // const formattedData = [
  //       //   ...approved.map(item => ({ ...item, status: 'Approved' })),
  //       //   ...rejected.map(item => ({ ...item, status: 'Rejected' })),
  //       //   ...pending.map(item => ({ ...item, status: 'Pending' })),
  //       //   ...waitingForAction.map(item => ({ ...item, status: 'Waiting for Action' })),
  //       // ];
  //       // console.log("Formatted Data:",formattedData);

  //       const decodedToken = jwtDecode(userToken);
  //       console.log('Decoded Token:', decodedToken.role_id);
  //       if (decodedToken.role_id) {
  //         setRoleId(decodedToken.role_id);
  //       }
  //       if (decodedToken.user_id) {
  //         setUserId(decodedToken.user_id);
  //       }
  //       // console.log("Role ID:",roleId);

  //       if (data && data.status) {
  //         if (data.approved || data.rejected || data.pending || data.waitingForAction) {
  //           // Combine approved, rejected, and pending data into a single array
  //           const combinedData = [
  //             ...data.waitingForAction.map(item => ({ ...item, status: 'Waiting for Action' })),
  //             ...data.approved.map(item => ({ ...item, status: 'Approved' })),
  //             ...data.rejected.map(item => ({ ...item, status: 'Rejected' })),
  //             ...data.pending.map(item => ({ ...item, status: 'Pending' })),
  //           ];
  //           console.log("Combined Data:",combinedData);

  //           const statusOrder = {
  //             'Waiting for Action': 1,
  //             'Approved': 2,
  //             'Rejected': 3,
  //             'Pending': 4,
  //           };
            
  //           // Sort the combined data first by status and then by descending ID
  //           const sortedCombinedData = combinedData.sort((a, b) => {
  //             // Compare by status using the defined order
  //             const statusComparison = statusOrder[a.status] - statusOrder[b.status];
            
  //             // If statuses are the same, compare by ID in descending order
  //             if (statusComparison === 0) {
  //               return b.id - a.id; // Assuming `id` is a numeric value
  //             }
            
  //             return statusComparison; // Return the status comparison result
  //           });
            
  //           // Now, sortedCombinedData will contain the data arranged as specified
  //           console.log("Sorted combined data:",sortedCombinedData);

  //           setPsgList(sortedCombinedData);
  //           setApprovedCount(approvedCount);
  //           setRejectedCount(rejectedCount);
  //           setPendingCount(pendingCount);
  //           setWaitingForActionCount(waitingForActionCount);
  //         }
  //       }

  //       // setPsgList(formattedData);
  //     } catch (error) {
  //       console.error('Error fetching data', error);
  //     } finally {
  //       setLoading(false);
  //     }
  //   };

  //   fetchData(currentPage, rowsPerPage);
  // }, [activeTab, currentPage, rowsPerPage]);

  const fetchData = async (tab, page, rows) => {
    setLoading(true);
    try {
      const response = await fetch(`http://localhost:3000/policy/user?tab=${tab}&page=${page}&rows=${rows}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${userToken}`, // Include JWT token in the headers
        },
      });
      console.log("Tab: ",tab);
      const data = await response.json();
      setPsgList(data); // Adjust this based on your API response structure
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
      // console.log('Count for Tab:', count);
      // console.log("Count: ",count);
      const decodedToken = jwtDecode(userToken);
      console.log('Decoded Token:', decodedToken.role_id);
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
//     // Filter the table data based on the active tab (status)
//     const filteredData = psgList.filter(item => {
//         if (activeTab === 'waitingforaction') return item.status === 'Waiting for Action';
//         if (activeTab === 'approved') return item.status === 'Approved';
//         if (activeTab === 'rejected') return item.status === 'Rejected';
//         if (activeTab === 'pending') return item.status === 'Pending';
//         return true;
//     });
//     setTableData(filteredData);
// }, [activeTab, psgList]);

  useEffect(() => {
    console.log('Current roleId:', roleId); // Log the roleId
    console.log('Current userId:', userId); // Log the roleId
  }, [roleId, userId]);

  // const sortedData = sortColumn ? customSort(psgList, sortColumn, sortDirection) : psgList;

  // const startIndex = currentPage * rowsPerPage;
  // const endIndex = startIndex + rowsPerPage;
  // const paginatedData = sortedData.slice(startIndex, endIndex);
  // console.log("Paginated data: ",paginatedData);

  const columns1 = [
    {
      name: 'ID',
      selector: row => row.id || 'N/A',
      sortable: true,
      // center: true,
      cell: (row) => (
        <div style={{ textAlign: 'left', width: '100%', paddingLeft: '8px' }}>
          {row.id || 'N/A'}
        </div>
      ),
      width: '15%',
    },
    {
      name: 'Document Title',
      selector: row => row.title || 'N/A',
      sortable: true,
      // center: true,
      width: '40%',
      cell: (row) => (
        <Typography
          variant="body2"
          sx={{ textAlign: 'left', cursor: 'pointer', color: 'blue', textDecoration: 'underline', paddingLeft: '8px' }}
          onClick={() => handleRowClick(row)}
        >
          {row.title}
        </Typography>
      ),
    },
    {
      name: 'Type',
      selector: row => row.type || 'N/A',
      sortable: true,
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
      name: 'Updated on',
      selector: row => new Date(row.updatedAt).toLocaleDateString() || 'N/A',
      sortable: true,
      // center: true,
      cell: (row) => (
        <div style={{ textAlign: 'left', width: '100%', paddingLeft: '8px' }}>
          {new Date(row.updatedAt).toLocaleDateString() || 'N/A'}
        </div>
      ),
      width: '25%',
    },
  ];

  const columns = columns1;
  // if (initialTab === 1){
  //   console.log("Initial tab: ",initialTab);
  //   setCount(approvedCount || 0);
  // }
  // else if (initialTab === 2){
  //   setCount(rejectedCount || 0);
  // }
  // else if (initialTab === 3){
  //   setCount(pendingCount || 0);
  // }
  // else if (initialTab === 4){
  //   console.log("Initial tab: ",initialTab);
  //   setCount(waitingForActionCount || 0);
  // }
  // console.log('Count for Tab:', count);
  // const tabledata1 = paginatedData;

  const handlePageChange = (page) => {
    setCurrentPage(page);
    fetchData(activeTab, page, rowsPerPage);
  };

  // const handleChangeRowsPerPage = (event) => {
  //   setRowsPerPage(+event.target.value);
  //   setPage(0);
  // };
  const handleRowsPerPageChange = (newRowsPerPage, page) => {
    setRowsPerPage(newRowsPerPage);
    setCurrentPage(1);
    fetchData(activeTab, 1, newRowsPerPage);
  };

  useEffect(() => {
    fetchData(activeTab, currentPage, rowsPerPage);
  }, [activeTab, currentPage, rowsPerPage]);

  const handleRowClick = (row) => {
    setSelectedDocument(row.title);
    setSelectedRow(row);
    // setDecision('');
    // setRemarks('');
    // setUploadedFile(null);
    navigate(`/policy/${row.id}`, { state: { title: row.title, status: row.status }});
  };


  return (
    <ContentBox className="analytics">
    <Card sx={{ px: 3, py: 3, height: '100%', width: '100%' }}>
    <Grid container spacing={2}>
      <Grid item lg={6} md={6} sm={6} xs={6}>
        <Typography variant="h5" sx={{ fontFamily: 'sans-serif', fontWeight: 'bold', fontSize: '1.4rem', marginLeft: { sm: 2, xs: 2 }, marginTop: { sm: 2, xs: 2 }, marginRight: { sm: 2, xs: 2 } }}>
          Policies, SOPs and Guidance notes
        </Typography>
      </Grid>
      {(roleId === 1 || roleId === 3) && (
        <Grid item lg={3} md={3} sm={3} xs={3}>
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            sx={{
              fontFamily: 'sans-serif',
              fontSize: '0.875rem',
              textTransform: 'none',
              marginTop: { sm: 2, xs: 2 },
              height: '30px',
            }}
            onClick={() => navigate('/initiate/psg')}
          >
            Create New
          </Button>
        </Grid>
      )}
      <Grid item lg={(roleId === 1 || roleId === 3) ? 3 : 6} md={(roleId === 1 || roleId === 3) ? 3 : 6} sm={(roleId === 1 || roleId === 3) ? 3 : 6} xs={(roleId === 1 || roleId === 3) ? 3 : 6}>
        <Grid item xs={12} sx={{ display: 'flex', justifyContent: 'flex-end', alignItems: 'center', mt: 2, mr: 2 }}>
          <Typography variant="h5" sx={{ fontFamily: 'sans-serif', fontSize: '0.875rem', mr: 2, mt: 0.5 }}>
            Type
          </Typography>
          <Controller
            name="documentType"
            control={control}
            render={({ field }) => (
              <StyledSelect
                labelId="document-type-label"
                id="documentType"
                {...field}
                sx={{
                  width: '160px',
                }}
                onChange={(e) => {
                  field.onChange(e);
                }}
              >
                <MenuItem value="">
                  <em>None</em>
                </MenuItem>
                <MenuItem value={1}>Policy</MenuItem>
                <MenuItem value={3}>SOP</MenuItem>
                <MenuItem value={2}>Guidance Note</MenuItem>
              </StyledSelect>
            )}
          />
        </Grid>
      </Grid>
      <Grid item lg={12} md={12} sm={12} xs={12}>
        <Tabs
          value={activeTab}
          onChange={handleTabChange}
          textColor="black"
          indicatorColor="primary"
        >
          <Tab label="Waiting for Action" value="4" sx={{ fontFamily: "sans-serif", fontSize: 20, fontWeight: 100, textTransform: "none" }} />
          <Tab label="Approved" value="1" sx={{ fontFamily: "sans-serif", fontSize: 20, fontWeight: 100, textTransform: "none" }} />
          <Tab label="Rejected" value="2" sx={{ fontFamily: "sans-serif", fontSize: 20, fontWeight: 100, textTransform: "none" }} />
          <Tab label="Pending" value="3" sx={{ fontFamily: "sans-serif", fontSize: 20, fontWeight: 100, textTransform: "none" }} />
        </Tabs>
      </Grid>
      <Grid item lg={12} md={12} sm={12} xs={12}>
        <Box width="100%" overflow="auto">
          <DataTable
            columns={columns}
            data={psgList}
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
                  fontSize: '1rem',
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
