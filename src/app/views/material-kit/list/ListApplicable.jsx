import React, { useState, useEffect } from "react";
import AddIcon from '@mui/icons-material/Add';
import { Box, Button, Card, Grid, Icon, MenuItem, Select, Table, styled, Typography } from "@mui/material";
import { useForm, Controller } from 'react-hook-form';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
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

const ApplicableTable = () => {
    const showRowsPerPageOptions = true;
    const { control } = useForm();
    const navigate = useNavigate();

    const [psgList2, setPsgList2] = useState([]);
    const [userId, setUserId] = useState(null);
    const [roleId, setRoleId] = useState(null);

    const [loading, setLoading] = useState(true);
    const [page, setPage] = useState(0);
    const [currentPage, setCurrentPage] = useState(1);
    const [rowsPerPage, setRowsPerPage] = useState(5);
    const [selectedRow, setSelectedRow] = useState(null);
    const [sortColumn, setSortColumn] = useState(''); // Column being sorted
    const [sortDirection, setSortDirection] = useState('asc');
    const [selectedDocument, setSelectedDocument] = useState(null);
    const [selectedDocumentTitle, setSelectedDocumentTitle] = useState(null);
    const [error, setError] = useState(null);

    const handleSort = (column, sortDirection) => {
        setSortColumn(column.selector); // Store column to be sorted
        setSortDirection(sortDirection); // Store sort direction
    };

    const userToken = useSelector((state)=>{
        return state.token;//.data;
    });
    console.log("UserToken:",userToken);

    const fetchData = async (page, rows) => {
      setLoading(true);
      try {
        const response = await fetch(`http://localhost:3000/policy/user?display=true&page=${page}&rows=${rows}`, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${userToken}`, // Include JWT token in the headers
          },
        });
        const data = await response.json();
        setPsgList2(data); // Adjust this based on your API response structure
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
  
    useEffect(() => {
      fetchData(currentPage, rowsPerPage);
    }, [currentPage, rowsPerPage]);

    useEffect(() => {
        console.log('Current roleId:', roleId); // Log the roleId
        console.log('Current userId:', userId); // Log the roleId
    }, [roleId, userId]);

    const columns2 = [
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
        width: '10%',
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
            sx={{ textAlign: 'center', cursor: 'pointer', color: 'blue', textDecoration: 'underline', paddingLeft: '8px' }}
            onClick={() => handleRowClick(row)}
            >
            {row.title}
            </Typography>
        ),
        },
        {
        name: 'Description',
        selector: row => row.description || 'N/A',
        sortable: true,
        // center: true,
        width: '50%',
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

  const handlePageChange = (newPage) => {
    setPage(newPage - 1);
  };

  // const handleChangeRowsPerPage = (event) => {
  //   setRowsPerPage(+event.target.value);
  //   setPage(0);
  // };
  const handleRowsPerPageChange = (newRowsPerPage) => {
    setRowsPerPage(newRowsPerPage);
    setPage(0);
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
    <Card sx={{ px: 3, py: 3, height: '100%', width: '100%' }}>
    <Grid container spacing={2}>
    <Grid item lg={6} md={6} sm={6} xs={6}>
        <Typography variant="h5" sx={{fontFamily: 'sans-serif', fontWeight: 'bold', fontSize: '1.4rem', marginLeft: {sm: 2, xs: 2}, marginTop: {sm: 2, xs: 2}, marginRight: {sm: 2, xs: 2}}}>
            Policies, SOPs and Guidance notes
        </Typography>
    </Grid>
    {/* {roleId === 1 && (
    <Grid item lg={3} md={3} sm={3} xs={3}>
      <Button
        variant="contained"
        startIcon={<AddIcon />} // Adding the "+" icon
        sx={{
          fontFamily: 'sans-serif',
          fontSize: '0.875rem',
          textTransform: 'none',
          marginTop: { sm: 2, xs: 2 },
          height: '30px',
        }}
        onClick={() => navigate('/initiate/psg')} // Navigate to the desired path
      >
        Create New
      </Button>
    </Grid>
    )} */}
    <Grid item lg={6} md={6} sm={6} xs={6}>
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
      <Box width="100%" overflow="auto">
        <DataTable
          columns={columns2}
          data={psgList2} // Use paginated and sorted data
          progressPending={loading}
          pagination
          paginationServer
          paginationTotalRows={psgList2.length}
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

export default ApplicableTable;