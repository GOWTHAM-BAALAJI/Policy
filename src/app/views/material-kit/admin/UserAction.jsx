import React, { useState, useEffect } from "react";
import AddIcon from "@mui/icons-material/Add";
import { Box, Button, Card, Grid, IconButton, MenuItem, Select, styled, Tabs, Tab, TextField, Typography } from "@mui/material";
import { useForm, Controller } from "react-hook-form";
import { useSelector } from "react-redux";
import { useNavigate, useLocation } from "react-router-dom";
import DataTable from "react-data-table-component";
import { jwtDecode } from "jwt-decode";
import toast from "react-hot-toast";
import CloseIcon from "@mui/icons-material/Close";
import EditIcon from "@mui/icons-material/Edit";
import CheckIcon from '@mui/icons-material/Check';
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
    transition: "top 0.2s ease-out, font-size 0.2s ease-out"
  },
  "& .MuiInputLabel-shrink": {
    top: "2px",
    fontSize: "0.75rem"
  },
  "& .MuiInputBase-root": {
    height: 30,
    fontFamily: "sans-serif",
    fontSize: "0.875rem",
    backgroundColor: "transparent"
  },
  "& .MuiOutlinedInput-root": {
    position: "relative"
  },
  "& .MuiInputBase-input": {
    backgroundColor: "transparent",
    height: "100%",
    boxSizing: "border-box"
  }
}));

const StyledSelect = styled(Select)(() => ({
  width: "100%",
  height: "25px",
  fontFamily: "sans-serif",
  fontSize: "0.875rem",
  "& .MuiInputBase-root": {
    height: "30px",
    alignItems: "center",
    fontFamily: "sans-serif",
    fontSize: "1.10rem"
  },
  "& .MuiInputLabel-root": {
    lineHeight: "30px",
    top: "40",
    transform: "none",
    left: "20px",
    fontFamily: "sans-serif",
    fontSize: "0.875rem"
  },
  "& .MuiInputLabel-shrink": {
    top: "-6px"
  }
}));

export default function AdminTable() {
  const { control } = useForm();
  const navigate = useNavigate();
  const location = useLocation();
  const customFetchWithAuth = useCustomFetch();

  const [currentPage, setCurrentPage] = useState(1);
  const [psgList, setPsgList] = useState([]);
  const [userId, setUserId] = useState(null);
  const [roleId, setRoleId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [rowsPerPage, setRowsPerPage] = useState(5);
  const [selectedRow, setSelectedRow] = useState(null);
  const [selectedDocument, setSelectedDocument] = useState(null);
  const [userCount, setUserCount] = useState(0);
  const [policyCount, setPolicyCount] = useState(0);
  const [circularCount, setCircularCount] = useState(0);
  const [count, setCount] = useState(userCount);

  const userToken = useSelector((state) => {
    return state.token;
  });

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response1 = await customFetchWithAuth(`${process.env.REACT_APP_POLICY_BACKEND}admin/get-user-count`, "GET", 1, {});
        const data1 = await response1.json();
        if (data1 && data1.status) {
          const userCount = data1.count;
          setUserCount(userCount || 0);
        }
      } catch (error) {
        console.error("Error fetching data", error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [userCount, policyCount, circularCount]);

  const fetchData = async (page, rows) => {
    setLoading(true);
    try {
      let url = `${process.env.REACT_APP_POLICY_BACKEND}admin/get-all-user?page=${page}&rows=${rows}`;
      const response = await customFetchWithAuth(url, "GET", 1, {});
      const data = await response.json();
      setPsgList(data.data);
      setCount(userCount || 0);
    } catch (error) {
      console.error("Error fetching data:", error);
    } finally {
      setLoading(false);
    }
  };

  const [searchValue, setSearchValue] = useState("");
  let deboucedSearchValue = useDebouce(searchValue, 200);
  const [isSearching, setIsSearching] = useState(false);

  const handleInputChange = (event) => {
    setSearchValue(event.target.value);
  };

  const handleSearchData = async (page, rows, searchValue) => {
    setLoading(true);
    setIsSearching(true);
    setSearchValue(searchValue.trimStart());
    try {
      const response1 = await customFetchWithAuth(
        `${process.env.REACT_APP_POLICY_BACKEND}admin/get-all-user?page=${page}&rows=${rows}&search=${searchValue}`, "GET", 1, {});
      const data1 = await response1.json();
      setPsgList(data1.data);

      const countResponse1 = await customFetchWithAuth(
        `${process.env.REACT_APP_POLICY_BACKEND}admin/get-user-count?search=${searchValue}`, "GET", 1, {},);
      if (!countResponse1.ok) {
        throw new Error("Failed to fetch count data");
      }
      const countData1 = await countResponse1.json();
      setCount(countData1.count);
    } catch (error) {
      console.error("Error fetching data:", error);
    } finally {
      setLoading(false);
    }
  };

  const isXs = useMediaQuery((theme) => theme.breakpoints.down('sm'));
  const isMd = useMediaQuery((theme) => theme.breakpoints.down('md'));

  const columns1 = [
    {
      name: "Employee ID",
      selector: (row) => row.emp_id || "N/A",
      width: isXs ? "30%" : isMd ? "30%" : "20%",
      cell: (row) => (
        <Typography variant="body2" sx={{ textAlign: "left", textDecoration: "none", paddingLeft: "8px", fontSize: "14px" }}>
          {row.emp_id}
        </Typography>
      )
    },
    {
      name: "Employee Name",
      selector: (row) => row.emp_name || "N/A",
      width: isXs ? "35%" : "30%",
      cell: (row) => (
        <Typography variant="body2" sx={{ textAlign: "left", textDecoration: "none", paddingLeft: "8px", fontSize: "14px" }} >
          {row.emp_name}
        </Typography>
      )
    },
    {
      name: "Employee Email",
      selector: (row) => row.emp_email || "N/A",
      width: "35%",
      cell: (row) => (
        <Typography variant="body2" sx={{ textAlign: "left", textDecoration: "none", paddingLeft: "8px", fontSize: "14px" }}>
          {row.emp_email}
        </Typography>
      )
    },
    {
      name: "Action",
      selector: () => null,
      width: isXs ? "20%" : isMd ? "15%" : "10%",
      center: "true",
      cell: (row) => (
        <Box sx={{ display: "flex", justifyContent: "center", alignItems: "center", height: "100%" }}>
          <EditIcon sx={{ cursor: "pointer", color: "#ee8812", justifyContent: "center", alignItems: "center" }} onClick={() => handleRowClick(row)} />
        </Box>
      ),
      style: { textAlign: 'center', width: '100%' }
    }
  ];

  const handlePageChange = (newPage) => {
    if (isSearching) {
      setCurrentPage(newPage);
      handleSearchData(newPage, rowsPerPage, searchValue);
    } else {
      setCurrentPage(newPage);
      fetchData(newPage, rowsPerPage);
    }
  };

  const handleRowsPerPageChange = (newRowsPerPage) => {
    if (isSearching) {
      setRowsPerPage(newRowsPerPage);
      handleSearchData(currentPage, newRowsPerPage, searchValue);
    } else {
      setRowsPerPage(newRowsPerPage);
      fetchData(currentPage, newRowsPerPage);
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
      fetchData(currentPage, rowsPerPage);
    }
  }, [currentPage, rowsPerPage]);

  // useEffect(() => {
  //   handleSearchData(currentPage, rowsPerPage, searchValue, searchValue2, searchValue3, selectedType, selectedStatus, selectedCAStatus);
  // }, [currentPage, rowsPerPage, searchValue, searchValue2, searchValue3, selectedType, selectedStatus, selectedCAStatus]);

  useEffect(() => {
    handleSearchData(currentPage, rowsPerPage, deboucedSearchValue);
  }, [currentPage, rowsPerPage, deboucedSearchValue]);

  const handleRowClick = (row) => {
    setSelectedDocument(row.user_id);
    setSelectedRow(row);
    navigate(`/admin/create-user/${row.user_id}`, {
      state: { user_id: row.user_id, emp_id: row.emp_id, emp_name: row.emp_name }
    });
  };

  return (
    <ContentBox className="analytics">
      <Card sx={{ px: 1, py: 1, height: '100%', width: '100%' }}>
        <Grid container spacing={2} sx={{ width: '100%', height: '100%' }}>
          <Grid item lg={12} md={12} sm={12} xs={12} sx={{ display: 'flex', justifyContent: { xs: 'flex-start', sm: 'space-between', md: 'space-between', lg: 'space-between' }, alignItems: 'center', flexDirection: { xs: 'column', sm: 'row', md: 'row', lg: 'row' }, mt: 2 }}>
            <Typography variant="h5" sx={{ fontFamily: 'sans-serif', fontWeight: 'bold', fontSize: '1rem', ml: 2 }}>
              Action on Newly Created Users
            </Typography>
          </Grid>
          {/* <Grid item lg={12} md={12} sm={12} xs={12} sx={{ marginTop: -2, display: 'flex', flexDirection: { xs: 'column', sm: 'row', md: 'row', lg: 'row' }, justifyContent: 'space-between', alignItems: 'center' }}>
            <Box sx={{ overflowX: 'auto', width: '100%' }}>
              <Tabs value={activeTab} onChange={handleTabChange} textColor="inherit" indicatorColor="secondary" variant="scrollable" scrollButtons="auto" sx={{ whiteSpace: 'nowrap' }}>
                <Tab label="From HRMS request" value={1} sx={{ fontFamily: "sans-serif", fontSize: '0.875rem', fontWeight: 100, textTransform: "none" }} />
                <Tab label="From Internal Request" value={2} sx={{ fontFamily: "sans-serif", fontSize: '0.875rem', fontWeight: 100, textTransform: "none" }} />
              </Tabs>
            </Box>
          </Grid> */}
          <Grid item lg={12} md={12} sm={12} xs={12} sx={{ marginLeft: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexDirection: { xs: 'column', sm: 'row', md: 'row', lg: 'row' } }}>
            <Grid item sx={{ display: 'flex', alignItems: 'flex-start' }}>
              <StyledTextField value={searchValue} onChange={handleInputChange} placeholder="Search..." sx={{ width: '300px', marginRight: 2 }} />
              {searchValue && (
                <IconButton
                  onClick={() => {
                    setSearchValue('');
                    setIsSearching(false);
                    fetchData(currentPage, rowsPerPage);
                  }}
                  sx={{ marginRight: 1, marginLeft: -2, marginTop: -0.5 }}
                >
                  <CloseIcon />
                </IconButton>
              )}
            </Grid>
          </Grid>
          <Grid item lg={12} md={12} sm={12} xs={12} sx={{ marginTop: -2 }}>
            <Box width="100%" height="100%" overflow="auto">
              <DataTable
                columns={columns1}
                data={psgList}
                progressPending={loading}
                pagination
                paginationServer
                paginationTotalRows={count}
                paginationRowsPerPageOptions={[5, 10, 25]}
                paginationPerPage={rowsPerPage}
                onChangePage={handlePageChange}
                onChangeRowsPerPage={handleRowsPerPageChange}
                customStyles={{
                  table: {
                    style: { width: "100%", autowidth: false, scrollX: true, responsive: true, tableLayout: "fixed" }
                  },
                  headCells: {
                    style: { fontSize: "0.875rem", fontFamily: "sans-serif", fontWeight: "bold", textAlign: "center" }
                  },
                  cells: {
                    style: { fontFamily: "sans-serif", fontSize: "0.875rem", textAlign: "center", padding: "8px" }
                  }
                }}
              />
            </Box>
          </Grid>
        </Grid>
      </Card>
    </ContentBox>
  );
}
