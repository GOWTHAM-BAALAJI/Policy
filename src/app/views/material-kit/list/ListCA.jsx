import React, { useState, useEffect } from "react";
import AddIcon from "@mui/icons-material/Add";
import { Box, Button, Card, Grid, IconButton, styled, TextField, Typography } from "@mui/material";
import { useForm } from "react-hook-form";
import { useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import DataTable from "react-data-table-component";
import { jwtDecode } from "jwt-decode";
import CloseIcon from "@mui/icons-material/Close";
import useCustomFetch from "../../../hooks/useFetchWithAuth";
import { useMediaQuery } from '@mui/material';

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

export default function CATable() {
  const { control } = useForm();
  const navigate = useNavigate();
  const customFetchWithAuth=useCustomFetch();
  const [currentPage, setCurrentPage] = useState(1);
  const [count, setCount] = useState(0);
  const [psgList, setPsgList] = useState([]);
  const [userId, setUserId] = useState(null);
  const [roleId, setRoleId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [rowsPerPage, setRowsPerPage] = useState(5);
  const [selectedRow, setSelectedRow] = useState(null);
  const [selectedDocument, setSelectedDocument] = useState(null);

  const userToken = useSelector((state) => {
    return state.token;
  });

  const fetchData = async (page, rows) => {
    setLoading(true);
    try {
      const response = await customFetchWithAuth(
        `https://policyuat.spandanasphoorty.com/policy_apis/circular-advisories?page=${page}&rows=${rows}`,"GET",1,{});
      const data = await response.json();
      setPsgList(data.data);

      const countResponse = await customFetchWithAuth(`https://policyuat.spandanasphoorty.com/policy_apis/circular-advisories/count`,"GET",1,{});
      if (!countResponse.ok) {
        throw new Error("Failed to fetch count data");
      }
      const countData = await countResponse.json();
      setCount(countData.count);
    } catch (error) {
      console.error("Error fetching data:", error);
    } finally {
      setLoading(false);
    }
  };

  const [searchValue, setSearchValue] = useState("");
  const [isSearching, setIsSearching] = useState(false);
  const handleInputChange = (event) => {
    setSearchValue(event.target.value);
  };

  const handleSearchData = async (page, rows, searchValue) => {
    setLoading(true);
    setIsSearching(true);
    setSearchValue(searchValue.trimStart());
    try {
      const response = await customFetchWithAuth(
        `https://policyuat.spandanasphoorty.com/policy_apis/circular-advisories?page=${page}&rows=${rows}&search=${searchValue}`,"GET",1,{});
      const data = await response.json();
      setPsgList(data.data);

      const countResponse = await customFetchWithAuth(
        `https://policyuat.spandanasphoorty.com/policy_apis/circular-advisories/count?search=${searchValue}`,"GET",1,{});
      if (!countResponse.ok) {
        throw new Error("Failed to fetch count data");
      }
      const countData = await countResponse.json();
      setCount(countData.count);
    } catch (error) {
      console.error("Error fetching data:", error);
    } finally {
      setLoading(false);
    }
  };

  const getDisplayCircularId = (policy_id) => {
    return "CA" + String(policy_id).padStart(7, "0");
  };

  const isXs = useMediaQuery((theme) => theme.breakpoints.down('sm'));
  const isMd = useMediaQuery((theme) => theme.breakpoints.down('md'));

  const columns1 = [
    {
      name: "Circular ID",
      selector: (row) => row.id || "N/A",
      sortable: true,
      cell: (row) => (
        <div style={{ textAlign: "left", width: "100%", paddingLeft: "8px" }}>
          {getDisplayCircularId(row.id) || "N/A"}
        </div>
      ),
      width: isXs ? "22%" : isMd ? "22%" : "15%"
    },
    {
      name: "Circular Title",
      selector: (row) => row.title || "N/A",
      sortable: true,
      width: "25%",
      cell: (row) => (
        <Typography variant="body2" sx={{ textAlign: "left", cursor: "pointer", color: "#ee8812", textDecoration: "none", paddingLeft: "8px", fontWeight: "bold", fontSize: "16px" }} onClick={() => handleRowClick(row)}>
          {row.title}
        </Typography>
      )
    },
    {
      name: "Published On",
      selector: row => new Date(row.createdAt).toLocaleDateString() || 'N/A',
      width: isXs ? "25%" : isMd ? "25%" : "17%",
      sortable: true,
      cell: (row) => {
        return (
          <div style={{ textAlign: 'left', width: '100%', paddingLeft: '8px' }}>
            {new Date(row.createdAt).toLocaleDateString() || 'N/A'}
          </div>
        );
      },
    },
    {
      name: "Circular Description",
      selector: (row) => row.description || "N/A",
      width: "43%",
      cell: (row) => (
        <div style={{ textAlign: "left", width: "100%", paddingLeft: "8px" }}>
          {row.description || "N/A"}
        </div>
      )
    }
  ];

  const isInitiator = (role_id) => {
    let temp = Number(role_id);
    const bin = temp.toString(2);
    return bin[bin.length - 1] == "1";
  };

  const columns = columns1;

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
    fetchData(currentPage, rowsPerPage);
  }, [currentPage, rowsPerPage]);

  useEffect(() => {
    handleSearchData(currentPage, rowsPerPage, searchValue);
  }, [currentPage, rowsPerPage, searchValue]);

  const handleRowClick = async (row) => {
    setSelectedDocument(row.title);
    setSelectedRow(row);
    try {
      const response = await customFetchWithAuth(`https://policyuat.spandanasphoorty.com/policy_apis/circular-advisories/${row.id}`,"GET",1,{});
      const data = await response.json();
      if (data.status && data.data.file_name) {
        const fileResponse = await customFetchWithAuth(
          `https://policyuat.spandanasphoorty.com/policy_apis/CA_document/${data.data.file_name}`,"GET",1,{});
        const blob = await fileResponse.blob();
        const url = window.URL.createObjectURL(new Blob([blob]));
        const link = document.createElement("a");
        link.href = url;
        link.setAttribute("download", data.data.file_name);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        window.URL.revokeObjectURL(url);
      } else {
        console.error("File not found or invalid response");
      }
    } catch (error) {
      console.error("Error fetching document:", error);
    }
  };

  return (
    <ContentBox className="analytics">
      <Card sx={{ px: 1, py: 1, height: "100%", width: "100%" }}>
        <Grid container spacing={2}>
          <Grid item lg={isInitiator(roleId) ? 6 : 12} md={isInitiator(roleId) ? 6 : 12} sm={isInitiator(roleId) ? 6 : 12} xs={12}>
            <Typography variant="h5" sx={{ fontFamily: "sans-serif", fontWeight: "bold", fontSize: "1rem", marginLeft: { sm: 2, xs: 2 }, marginTop: { sm: 2, xs: 2 }, marginRight: { sm: 2, xs: 2 } }}>
              Circulars and Advisories
            </Typography>
          </Grid>
          {(isInitiator(roleId)) && (
            <Grid item lg={6} md={6} sm={6} xs={12} sx={{ display: "flex", justifyContent: {lg:"flex-end", md:"flex-end", sm:"flex-end", xs:"center",}, alignItems: "flex-end", mb: {sm:1, xs:1.5} }}>
              <Button variant="contained" startIcon={<AddIcon />} sx={{ fontFamily: "sans-serif", fontSize: "0.875rem", textTransform: "none", marginTop: { sm: 2, xs: 0 }, marginRight: { sm: 2, xs: 0 }, height: "25px", backgroundColor: "#ee8812", "&:hover": { backgroundColor: "rgb(249, 83, 22)" }}} onClick={() => navigate("/initiate/ca")}>
                New
              </Button>
            </Grid>
          )}
          <Grid item lg={12} md={12} sm={12} xs={12} sx={{ marginLeft: 2, display: "flex", alignItems: "center" }}>
            <StyledTextField value={searchValue} onChange={handleInputChange} placeholder="Search Circular ID or Title" sx={{ width: "300px", marginRight: 2 }}/>
            {searchValue && (
              <IconButton
                onClick={() => {
                  setSearchValue("");
                  setIsSearching(false);
                  fetchData(currentPage, rowsPerPage);
                }}
                sx={{ marginRight: 1, marginLeft: -2, marginTop: -2 }}
              >
                <CloseIcon />
              </IconButton>
            )}
          </Grid>
          <Grid item lg={12} md={12} sm={12} xs={12}>
            <Box width="100%" overflow="auto" style={{ overflowX: 'auto' }}>
              <div style={{ overflowX: 'auto', position: 'relative', }}>
                <div style={{ content: '""', position: 'absolute', bottom: 0, left: 0, width: '100%', height: '1px', backgroundColor: '#ddd', zIndex: 1, transform: 'scaleX(1)', }}/>
                  <DataTable
                    columns={columns}
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
                        style: {
                          minWidth: isXs ? '115%' : isMd ? '115%' : '100%',
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
}
