import { useState } from "react";
import AddIcon from '@mui/icons-material/Add';
import { Box, Button, Grid, Icon, MenuItem, Select, Table, styled, TableRow, TableBody, TableCell, TableHead, IconButton, TablePagination, Typography } from "@mui/material";
import { useForm, Controller } from 'react-hook-form';
import { useNavigate } from "react-router-dom";

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

const caList = [
  {
    sno: "1",
    title: "Circular 1",
    lastupdated: "01/05/2024",
  },
  {
    sno: "2",
    title: "Circular 2",
    lastupdated: "02/05/2024",
  },
  {
    sno: "3",
    title: "Advisory 1",
    lastupdated: "03/05/2024",
  },
  {
    sno: "4",
    title: "Circular 3",
    lastupdated: "04/05/2024",
  },
  {
    sno: "5",
    title: "Advisory 2",
    lastupdated: "05/05/2024",
  },
  {
    sno: "6",
    title: "Circular 4",
    lastupdated: "06/05/2024",
  },
  {
    sno: "7",
    title: "Circular 5",
    lastupdated: "07/05/2024",
  },
  {
    sno: "8",
    title: "Advisory 3",
    lastupdated: "08/05/2024",
  }
];

export default function CATable() {
  const navigate = useNavigate();

  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(5);

  const handleChangePage = (_, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(+event.target.value);
    setPage(0);
  };

  return (
    <Grid container spacing={2}>
    <Grid item lg={12} md={12} sm={12} xs={12}>
    <Grid container alignItems="center" justifyContent="space-between">
        <Typography variant="h5" sx={{fontFamily: 'sans-serif', fontSize: '1.4rem', marginLeft: {sm: 2, xs: 2}, marginTop: {sm: 2, xs: 2}, marginRight: {sm: 2, xs: 2}}}>
            List of Circulars and Advisories
        </Typography>
        <Button
          variant="contained"
          startIcon={<AddIcon />} // Adding the "+" icon
          sx={{
            fontFamily: 'sans-serif',
            fontSize: '0.875rem',
            textTransform: 'none',
            marginTop: 2,
            marginRight: 2,
            height: '30px',
          }}
          onClick={() => navigate('/initiate/ca')} // Navigate to the desired path
        >
          Initiate New
        </Button>
        </Grid>
    </Grid>
    <Grid item lg={12} md={12} sm={12} xs={12}>
    <Box width="100%" overflow="auto">
      <StyledTable>
        <TableHead>
          <TableRow sx={{ '& th': { fontSize: '1rem', fontFamily: 'sans-serif', fontWeight: 'bold' } }}>
            <TableCell align="center" sx={{ width: '10%' }}>S.No.</TableCell>
            <TableCell align="center" sx={{ width: '50%' }}>Document Title</TableCell>
            <TableCell align="center" sx={{ width: '20%' }}>Last Updated on</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {caList
            .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
            .map((subscriber, index) => (
              <TableRow 
                key={index}
                sx={{
                    '& td': {
                    padding: '8px',       // Decrease padding to reduce gap between rows
                    height: '10px',       // Adjust height if needed
                    },
                    fontFamily: 'sans-serif',
                    fontSize: '0.875rem'
                }}
              >
                <TableCell align="center" sx={{ width: '10%' }}>{subscriber.sno}</TableCell>
                <TableCell align="center" sx={{ width: '50%' }}>{subscriber.title}</TableCell>
                <TableCell align="center" sx={{ width: '20%' }}>{subscriber.lastupdated}</TableCell>
              </TableRow>
            ))}
        </TableBody>
      </StyledTable>

      <TablePagination
        sx={{ px: 2, marginRight: 6 }}
        page={page}
        component="div"
        rowsPerPage={rowsPerPage}
        count={caList.length}
        onPageChange={handleChangePage}
        rowsPerPageOptions={[5, 10, 25]}
        onRowsPerPageChange={handleChangeRowsPerPage}
        nextIconButtonProps={{ "aria-label": "Next Page" }}
        backIconButtonProps={{ "aria-label": "Previous Page" }}
      />
    </Box>
    </Grid>
    </Grid>
  );
}
