import { useState } from "react";
import { Box, Grid, Icon, MenuItem, Select, Table, styled, TableRow, TableBody, TableCell, TableHead, IconButton, TablePagination, Typography } from "@mui/material";
import { useForm, Controller } from 'react-hook-form';

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

const psgList = [
  {
    sno: "1",
    title: "Policy 1",
    lastupdated: "01/01/2024",
    remarks: "wsretdfygijopugydtrsetdgui"
  },
  {
    sno: "2",
    title: "Policy 2",
    lastupdated: "02/01/2024",
    remarks: "wsretdfygijopugydtrsetdgui"
  },
  {
    sno: "3",
    title: "SOP 1",
    lastupdated: "03/01/2024",
    remarks: "wsretdfygijopugydtrsetdgui"
  },
  {
    sno: "4",
    title: "Policy 3",
    lastupdated: "04/01/2024",
    remarks: "wsretdfygijopugydtrsetdgui"
  },
  {
    sno: "5",
    title: "Guidance Note 1",
    lastupdated: "05/01/2024",
    remarks: "wsretdfygijopugydtrsetdgui"
  },
  {
    sno: "6",
    title: "Policy 4",
    lastupdated: "06/01/2024",
    remarks: "wsretdfygijopugydtrsetdgui"
  },
  {
    sno: "7",
    title: "SOP 2",
    lastupdated: "07/01/2024",
    remarks: "wsretdfygijopugydtrsetdgui"
  },
  {
    sno: "8",
    title: "SOP 3",
    lastupdated: "08/01/2024",
    remarks: "wsretdfygijopugydtrsetdgui"
  }
];

export default function ApprovalPendingTable() {
  const { control } = useForm();

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
        <Typography variant="h5" sx={{fontFamily: 'sans-serif', fontSize: '1.4rem', marginLeft: {sm: 2, xs: 2}, marginTop: {sm: 2, xs: 2}, marginRight: {sm: 2, xs: 2}}}>
            Approval pending
        </Typography>
        <Typography variant="h6" sx={{fontFamily: 'sans-serif', fontSize: '1rem', marginLeft: {sm: 2, xs: 2}, marginTop: {sm: 2, xs: 2}, marginRight: {sm: 2, xs: 2}}}>
            Policy/SOP/Guidance Note
        </Typography>
    </Grid>
    <Grid item lg={12} md={12} sm={12} xs={12}>
    <Box width="100%" overflow="auto">
      <StyledTable>
        <TableHead>
          <TableRow sx={{ '& th': { fontSize: '1rem', fontFamily: 'sans-serif', fontWeight: 'bold' } }}>
            <TableCell align="center" sx={{ width: '10%' }}>S.No.</TableCell>
            <TableCell align="center" sx={{ width: '50%' }}>Document Title</TableCell>
            <TableCell align="center" sx={{ width: '20%' }}>Last Updated on</TableCell>
            <TableCell align="center" sx={{ width: '20%' }}>Remarks</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {psgList
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
                <TableCell align="center" sx={{ width: '20%' }}>{subscriber.remarks}</TableCell>
              </TableRow>
            ))}
        </TableBody>
      </StyledTable>

      <TablePagination
        sx={{ px: 2, marginRight: 6 }}
        page={page}
        component="div"
        rowsPerPage={rowsPerPage}
        count={psgList.length}
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
