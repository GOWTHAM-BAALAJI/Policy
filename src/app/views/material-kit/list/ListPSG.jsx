import { useState } from "react";
import AddIcon from '@mui/icons-material/Add';
import { Box, Button, Grid, Icon, MenuItem, Select, Table, styled, TableRow, TableBody, TableCell, TableHead, IconButton, TablePagination, Typography } from "@mui/material";
import { useForm, Controller } from 'react-hook-form';
import { useNavigate } from 'react-router-dom';
import DataTable from 'react-data-table-component';

// STYLED COMPONENT
const StyledTable = styled(Table)(() => ({
  whiteSpace: "pre",
  "& thead": {
    "& tr": { "& th": { paddingLeft: 0, paddingRight: 0 } }
  },
  "& tbody": {
    "& tr": { "& td": { paddingLeft: 0, textTransform: "capitalize" } }
  }
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

const psgList = [
  {
    sno: "1",
    title: "Policy 1",
    type: "Policy",
    status: "Approval pending",
    lastupdated: "01/01/2024",
  },
  {
    sno: "2",
    title: "Policy 2",
    type: "Policy",
    status: "Approved",
    lastupdated: "02/01/2024",
  },
  {
    sno: "3",
    title: "SOP 1",
    type: "SOP",
    status: "Pending",
    lastupdated: "03/01/2024",
  },
  {
    sno: "4",
    title: "Policy 3",
    type: "Policy",
    status: "Approval pending",
    lastupdated: "04/01/2024",
  },
  {
    sno: "5",
    title: "Guidance Note 1",
    type: "Guidance Note",
    status: "Approval pending",
    lastupdated: "05/01/2024",
  },
  {
    sno: "6",
    title: "Policy 4",
    type: "Policy",
    status: "Pending",
    lastupdated: "06/01/2024",
  },
  {
    sno: "7",
    title: "SOP 2",
    type: "SOP",
    status: "Review raised",
    lastupdated: "07/01/2024",
  },
  {
    sno: "8",
    title: "SOP 3",
    type: "SOP",
    status: "Rejected",
    lastupdated: "08/01/2024",
  }
];

export default function PSGTable() {
  const { control } = useForm();
  const navigate = useNavigate();

  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(5);
  const [sortColumn, setSortColumn] = useState(''); // Column being sorted
  const [sortDirection, setSortDirection] = useState('asc');

  const handleSort = (column, sortDirection) => {
    setSortColumn(column.selector); // Store column to be sorted
    setSortDirection(sortDirection); // Store sort direction
  };

  const sortedData = sortColumn ? customSort(psgList, sortColumn, sortDirection) : psgList;

  const startIndex = page * rowsPerPage;
  const endIndex = startIndex + rowsPerPage;
  const paginatedData = sortedData.slice(startIndex, endIndex);

  const columns = [
    {
      name: 'S.No.',
      selector: (row, index) => index + 1 + page * rowsPerPage, // Create a serial number based on page and rowsPerPage
      sortable: true,
      center: true,
      width: '10%',
    },
    {
      name: 'Document Title',
      selector: row => row.title || 'N/A', // Add fallback value
      sortable: true,
      center: true,
      width: '40%',
    },
    {
      name: 'Document Type',
      selector: row => row.type || 'N/A', // Add fallback value
      sortable: true,
      center: true,
      width: '18%',
    },
    {
      name: 'Status',
      selector: row => row.status || 'N/A', // Add fallback value
      // sortable: true,
      center: true,
      width: '15%',
    },
    {
      name: 'Last Updated on',
      selector: row => row.lastupdated || 'N/A', // Add fallback value
      sortable: true,
      center: true,
      width: '17%',
    },
  ];

  // const handleChangePage = (_, newPage) => {
  //   setPage(newPage);
  // };
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

  return (
    <Grid container spacing={2}>
    <Grid item lg={6} md={6} sm={6} xs={6}>
        <Typography variant="h5" sx={{fontFamily: 'sans-serif', fontSize: '1.4rem', marginLeft: {sm: 2, xs: 2}, marginTop: {sm: 2, xs: 2}, marginRight: {sm: 2, xs: 2}}}>
            List of Policies, SOPs and Guidance notes
        </Typography>
    </Grid>
    <Grid item lg={3} md={3} sm={3} xs={3}>
    <Button
      variant="contained"
      startIcon={<AddIcon />} // Adding the "+" icon
      sx={{
        fontFamily: 'sans-serif',
        fontSize: '0.875rem',
        textTransform: 'none',
        marginTop: {sm: 2, xs: 2},
        height: '30px',
      }}
      onClick={() => navigate('/initiate/psg')} // Navigate to the desired path
    >
      Initiate New
    </Button>
    </Grid>
    <Grid item lg={3} md={3} sm={3} xs={3}>
    <Grid container alignItems="center" spacing={2}>
        <Grid item xs={6} sm={6} md={6} lg={6}>
        <Typography variant="h5" sx={{fontFamily: 'sans-serif', fontSize: '0.875rem', marginTop: {sm: 2.5, xs: 2.5}}}>
            Document Type
        </Typography>
        </Grid>
        <Grid item xs={6} sm={6} md={6} lg={6} sx={{ mt: 2 }}>
        <Controller
            name="documentType"
            control={control}
            render={({ field }) => (
                <StyledSelect
                labelId="document-type-label"
                id="documentType"
                {...field}
                onChange={(e) => {
                    field.onChange(e);
                }}
                sx={{ ml:-2 }}
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
    </Grid>
    <Grid item lg={12} md={12} sm={12} xs={12}>
      <Box width="100%" overflow="auto">
        <DataTable
          columns={columns}
          data={paginatedData} // Use paginated and sorted data
          pagination
          paginationServer
          paginationTotalRows={psgList.length}
          paginationRowsPerPageOptions={[5, 10, 25]}
          paginationPerPage={rowsPerPage}
          onChangePage={handlePageChange}
          onChangeRowsPerPage={handleRowsPerPageChange}
          onSort={handleSort} // Enable sorting
          sortServer={false} // Ensure this is false since sorting is handled locally
          defaultSortFieldId={1} // Optional: Default sorting column
          defaultSortAsc={true} // Optional: Default sorting direction
          customStyles={{
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
  );
}
