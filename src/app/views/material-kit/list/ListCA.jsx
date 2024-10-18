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

export default function CATable() {
  const { control } = useForm();
  const navigate = useNavigate();
  const location = useLocation();

  const queryParams = new URLSearchParams(location.search);
  const initialTab = queryParams.get('tab') || '4';

  const [activeTab, setActiveTab] = useState(initialTab);
  const [tabledata, setTableData] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);

  const [psgList, setPsgList] = useState([]);
  const [userId, setUserId] = useState(null);
  const [roleId, setRoleId] = useState(null);

  const [loading, setLoading] = useState(true);
  const [rowsPerPage, setRowsPerPage] = useState(5);
  const [selectedRow, setSelectedRow] = useState(null);
  const [selectedDocument, setSelectedDocument] = useState(null);

  const userToken = useSelector((state)=>{
    return state.token;//.data;
  });
  console.log("UserToken:",userToken);

  const fetchData = async () => {
    setLoading(true);
    try {
      const response = await fetch('http://localhost:3000/circular-advisories/', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${userToken}`, // Include JWT token in the headers
        },
      });
      const data = await response.json();
      setPsgList(data.data); // Adjust this based on your API response structure
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
    console.log('Current roleId:', roleId); // Log the roleId
    console.log('Current userId:', userId); // Log the roleId
  }, [roleId, userId]);

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
      width: '10%',
    },
    {
      name: 'Document Title',
      selector: row => row.title || 'N/A',
      sortable: true,
      // center: true,
      width: '30%',
      cell: (row) => (
        <Typography
          variant="body2"
          sx={{ textAlign: 'left', cursor: 'pointer', color: '#ee8812', textDecoration: 'none', paddingLeft: '8px', fontWeight: 'bold', fontSize: '16px' }}
          onClick={() => handleRowClick(row)}
        >
          {row.title}
        </Typography>
      ),
    },
    {
      name: 'Document Description',
      selector: row => row.description || 'N/A',
      sortable: true,
      // center: true,
      width: '60%',
      cell: (row) => (
        <div style={{ textAlign: 'left', width: '100%', paddingLeft: '8px' }}>
          {row.description || 'N/A'}
        </div>
      ),
    },
  ];

  const columns = columns1;

  const handlePageChange = (page) => {
    setCurrentPage(page);
    fetchData(activeTab, page, rowsPerPage);
  };

  const handleRowsPerPageChange = (newRowsPerPage, page) => {
    setRowsPerPage(newRowsPerPage);
    setCurrentPage(1);
    fetchData(activeTab, 1, newRowsPerPage);
  };

  useEffect(() => {
    fetchData(activeTab, currentPage, rowsPerPage);
  }, [activeTab, currentPage, rowsPerPage]);

  const handleRowClick = async (row) => {
    setSelectedDocument(row.title);
    setSelectedRow(row);
  
    try {
      const response = await fetch(`http://localhost:3000/circular-advisories/${row.id}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${userToken}`,
        },
      });
  
      const data = await response.json();
  
      if (data.status && data.data.file_name) {
        const fileResponse = await fetch(`http://localhost:3000/CA_document/${data.data.file_name}`, {
          method: 'GET',
          headers: {
            Authorization: `Bearer ${userToken}`,
          },
        });
        const blob = await fileResponse.blob();  
        const url = window.URL.createObjectURL(new Blob([blob]));  
        const link = document.createElement('a');
        link.href = url;
        link.setAttribute('download', data.data.file_name);  
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);  
        window.URL.revokeObjectURL(url);
      } else {
        console.error('File not found or invalid response');
      }
    } catch (error) {
      console.error('Error fetching document:', error);
    }
  };    


  return (
    <ContentBox className="analytics">
    <Card sx={{ px: 3, py: 3, height: '100%', width: '100%' }}>
    <Grid container spacing={2}>
      <Grid item lg={6} md={6} sm={6} xs={6}>
        <Typography variant="h5" sx={{ fontFamily: 'sans-serif', fontWeight: 'bold', fontSize: '1.4rem', marginLeft: { sm: 2, xs: 2 }, marginTop: { sm: 2, xs: 2 }, marginRight: { sm: 2, xs: 2 } }}>
          Circulars and Advisories
        </Typography>
      </Grid>
      {(roleId === 1 || roleId === 3) && (
        <Grid item lg={6} md={6} sm={6} xs={6} sx={{ display: 'flex', justifyContent: 'flex-end', alignItems: 'flex-end' }}>
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
            onClick={() => navigate('/initiate/ca')}
          >
            Create New
          </Button>
        </Grid>
      )}
      <Grid item lg={12} md={12} sm={12} xs={12}>
        <Box width="100%" overflow="auto">
          <DataTable
            columns={columns}
            data={psgList}
            progressPending={loading}
            pagination
            paginationServer
            paginationTotalRows={psgList.length} // Adjust to the total records returned by your API
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
