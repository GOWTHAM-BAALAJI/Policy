import React, { useState, useEffect } from "react";
import AddIcon from '@mui/icons-material/Add';
import { Box, Button, Card, Grid, IconButton, MenuItem, Select, Table, styled, TextField, Typography } from "@mui/material";
import { useForm, Controller } from 'react-hook-form';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import DataTable from 'react-data-table-component';
import { jwtDecode } from "jwt-decode";
import toast from "react-hot-toast";
import CloseIcon from '@mui/icons-material/Close'

const ContentBox = styled("div")(({ theme }) => ({
  margin: "20px",
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

const ApplicableTable = () => {
    const showRowsPerPageOptions = true;
    const { control } = useForm();
    const navigate = useNavigate();

    const [psgList2, setPsgList2] = useState([]);
    const [userId, setUserId] = useState(null);
    const [roleId, setRoleId] = useState(null);
    const [count, setCount] = useState(0);

    const [loading, setLoading] = useState(true);
    const [page, setPage] = useState(0);
    const [currentPage, setCurrentPage] = useState(1);
    const [rowsPerPage, setRowsPerPage] = useState(5);
    const [selectedRow, setSelectedRow] = useState(null);
    const [sortColumn, setSortColumn] = useState(''); // Column being sorted
    const [sortDirection, setSortDirection] = useState('asc');
    const [selectedDocument, setSelectedDocument] = useState(null);
    const [selectedType, setSelectedType] = useState('');

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
          const response = await fetch('https://policyuat.spandanasphoorty.com/policy_apis/policy/user/count?display=true', {
            method: 'GET',
            headers: {
              'Content-Type': 'application/json',
              Authorization: `Bearer ${userToken}`, // Include JWT token in the headers
            },
          });
          const data = await response.json();
  
          if (data && data.status) {
            setCount(data.count);
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
        let url = `https://policyuat.spandanasphoorty.com/policy_apis/policy/user?display=true&page=${page}&rows=${rows}`;
        const response = await fetch(url, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${userToken}`, // Include JWT token in the headers
          },
        });
        const data = await response.json();
        setPsgList2(data); // Adjust this based on your API response structure
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
  
    useEffect(() => {
      fetchData(currentPage, rowsPerPage);
    }, [currentPage, rowsPerPage]);

    const [searchValue, setSearchValue] = useState('');
  const [isSearching, setIsSearching] = useState(false);

  const handleInputChange = (event) => {
    setSearchValue(event.target.value);
  };

  const [isBtnDisabled, setIsBtnDisabled] = useState(false);

  const handleSearchType = async (page, rows, searchValue, selectedType) => {
    setLoading(true);

    setIsBtnDisabled(true);
        setTimeout(() => {
            setIsBtnDisabled(false);
        }, 1000);

    setIsSearching(true);
    setSelectedType(selectedType);
    // setSearchValue(searchValue.trimStart());
  
    try {
      // First API call: Fetch data based on searchValue
      const response = await fetch(`https://policyuat.spandanasphoorty.com/policy_apis/policy/user?display=true&page=${page}&rows=${rows}&search=${searchValue}&type=${selectedType}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${userToken}`,
        },
      });
      const data = await response.json();
      setPsgList2(data);
  
      // Second API call: Fetch the count data based on searchValue
      const countResponse = await fetch(`https://policyuat.spandanasphoorty.com/policy_apis/policy/user/count?search=${searchValue}&type=${selectedType}`, {
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
  
      setCount(countData.count);
  
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  }; 

  const handleSearchData = async (page, rows, searchValue, selectedType) => {
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
    setSearchValue((searchValue.trimStart()));
  
    try {
      // First API call: Fetch data based on searchValue
      const response = await fetch(`https://policyuat.spandanasphoorty.com/policy_apis/policy/user?display=true&page=${page}&rows=${rows}&search=${searchValue}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${userToken}`,
        },
      });
      const data = await response.json();
      setPsgList2(data);
  
      // Second API call: Fetch the count data based on searchValue
      const countResponse = await fetch(`https://policyuat.spandanasphoorty.com/policy_apis/policy/user/count?display=true&search=${searchValue}`, {
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
      setCount(countData.count);
  
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  const getDisplayPolicyId = (policy_id) => {
    return "PL" + String(policy_id).padStart(7, "0");
  };

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

    useEffect(() => {
      handleSearchType(currentPage, rowsPerPage, searchValue, selectedType);
    }, [selectedType, currentPage, rowsPerPage, searchValue]);

    const handlePageChange = (newPage) => {
      if (isSearching) {
        setCurrentPage(newPage);
        handleSearchData(newPage, rowsPerPage, searchValue);
      } else {
        setCurrentPage(newPage);
        fetchData(newPage, rowsPerPage);
      }
    };

  // const handleChangeRowsPerPage = (event) => {
  //   setRowsPerPage(+event.target.value);
  //   setPage(0);
  // };
  const handleRowsPerPageChange = (newRowsPerPage) => {
    if (isSearching) {
      setRowsPerPage(newRowsPerPage);
      handleSearchData(currentPage, newRowsPerPage, searchValue);  // Search API with updated rows per page
    } else {
      setRowsPerPage(newRowsPerPage);
      fetchData(currentPage, newRowsPerPage);  // Default rows per page change
    }
  };

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
    <Card sx={{ px: 1, py: 1, height: '100%', width: '100%' }}>
    <Grid container spacing={2}>
    <Grid item lg={6} md={6} sm={6} xs={6}>
        <Typography variant="h5" sx={{fontFamily: 'sans-serif', fontWeight: 'bold', fontSize: '1rem', marginLeft: {sm: 2, xs: 2}, marginTop: {sm: 2, xs: 2}, marginRight: {sm: 2, xs: 2}}}>
            Policies, SOPs and Guidance notes
        </Typography>
    </Grid>
    <Grid item lg={6} md={6} sm={6} xs={6}>
    <Grid item xs={12} sx={{ display: 'flex', justifyContent: 'flex-end', alignItems: 'center', mt: 2, mr: 2 }}>
      <Typography variant="h5" sx={{ fontFamily: 'sans-serif', fontSize: '0.875rem', mr: 2, mt: 0.5 }}>
        Type
      </Typography>
      <Controller
        name="documentType"
        control={control}
        value={selectedType}
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
              setSelectedType(e.target.value);
            }}
          >
            <MenuItem value="">
              <em>None</em>
            </MenuItem>
            <MenuItem value={1}>Policy</MenuItem>
            <MenuItem value={2}>SOP</MenuItem>
            <MenuItem value={3}>Guidance Note</MenuItem>
          </StyledSelect>
        )}
      />
    </Grid>
    </Grid>
    <Grid item lg={12} md={12} sm={12} xs={12} sx={{ marginLeft: 2, display: 'flex', alignItems: 'center' }}>
        <StyledTextField
          value={searchValue}
          onChange={handleInputChange}
          placeholder="Search Policy ID or Title"
          sx={{ width: '300px', marginRight: 2 }}
        />
        {searchValue && (
          <IconButton
            onClick={() => {
              setSearchValue(''); // Clear the search field
              setIsSearching(false); // Reset isSearching state
              fetchData(currentPage, rowsPerPage); // Fetch data without search
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
          onClick={() => handleSearchData(currentPage, rowsPerPage, searchValue)}
        >
          Search
        </Button> */}
      </Grid>
    <Grid item lg={12} md={12} sm={12} xs={12} sx={{ marginTop: -2 }}>
      <Box width="100%" overflow="auto">
        <DataTable
          columns={columns2}
          data={psgList2} // Use paginated and sorted data
          progressPending={loading}
          pagination
          paginationServer
          paginationTotalRows={count}
          paginationRowsPerPageOptions={showRowsPerPageOptions ? [5, 10, 25] : []}
          paginationPerPage={rowsPerPage}
          onChangePage={handlePageChange}
          onChangeRowsPerPage={handleRowsPerPageChange}
          onSort={handleSort} // Enable sorting
          sortServer={false} // Ensure this is false since sorting is handled locally
          // defaultSortFieldId={1} // Optional: Default sorting column
          // defaultSortAsc={false} // Optional: Default sorting direction
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

export default ApplicableTable;