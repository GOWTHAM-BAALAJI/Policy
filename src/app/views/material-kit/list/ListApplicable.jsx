import React, { useState, useEffect } from "react";
import { Box, Card, Grid, IconButton, MenuItem, Select, styled, TextField, Typography } from "@mui/material";
import { useForm, Controller } from "react-hook-form";
import { useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import DataTable from "react-data-table-component";
import { jwtDecode } from "jwt-decode";
import CloseIcon from "@mui/icons-material/Close";
import useCustomFetch from "../../../hooks/useFetchWithAuth";
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

const ApplicableTable = () => {
  const showRowsPerPageOptions = true;
  const { control } = useForm();
  const navigate = useNavigate();
  const customFetchWithAuth = useCustomFetch();
  const [psgList2, setPsgList2] = useState([]);
  const [userId, setUserId] = useState(null);
  const [roleId, setRoleId] = useState(null);
  const [count, setCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(5);
  const [selectedRow, setSelectedRow] = useState(null);
  const [sortColumn, setSortColumn] = useState("");
  const [sortDirection, setSortDirection] = useState("asc");
  const [selectedDocument, setSelectedDocument] = useState(null);
  const [selectedType, setSelectedType] = useState("");

  const handleSort = (column, sortDirection) => {
    setSortColumn(column.selector);
    setSortDirection(sortDirection);
  };

  const userToken = useSelector((state) => {
    return state.token;
  });

  const fetchData = async (page, rows) => {
    setLoading(true);
    try {
      let url = `${process.env.REACT_APP_POLICY_BACKEND}policy/user?display=true&page=${page}&rows=${rows}`;
      const response = await customFetchWithAuth(url, "GET", 1, {});
      const data = await response.json();
      setPsgList2(data);

      const count_response = await customFetchWithAuth(`${process.env.REACT_APP_POLICY_BACKEND}policy/user/count?display=true`, "GET", 1, {});
      const count_data = await count_response.json();
      if (count_data && count_data.status) {
        setCount(count_data.count);
      }
    } catch (error) {
      console.error("Error fetching data:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if(!isSearching){
      fetchData(currentPage, rowsPerPage);
    }
  }, [currentPage, rowsPerPage]);

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

  const [searchValue, setSearchValue] = useState("");
  let deboucedSearchValue = useDebouce(searchValue, 200);

  const [isSearching, setIsSearching] = useState(false);
  const handleInputChange = (event) => {
    setSearchValue(event.target.value);
  };

  const handleSearchType = async (page, rows, searchValue, selectedType) => {
    setLoading(true);
    setIsSearching(true);
    setSelectedType(selectedType);
    try {
      const response = await customFetchWithAuth(
        `${process.env.REACT_APP_POLICY_BACKEND}policy/user?display=true&page=${page}&rows=${rows}&search=${searchValue}&type=${selectedType}`, "GET", 1, {});
      const data = await response.json();
      setPsgList2(data);

      const countResponse = await customFetchWithAuth(
        `${process.env.REACT_APP_POLICY_BACKEND}policy/user/count?display=true&search=${searchValue}&type=${selectedType}`, "GET", 1, {});
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

  const handleSearchData = async (page, rows, searchValue) => {
    setLoading(true);
    setIsSearching(true);
    setSearchValue(searchValue.trimStart());

    try {
      const response = await customFetchWithAuth(
        `${process.env.REACT_APP_POLICY_BACKEND}policy/user?display=true&page=${page}&rows=${rows}&search=${searchValue}`, "GET", 1, {});
      const data = await response.json();
      setPsgList2(data);

      const countResponse = await customFetchWithAuth(
        `${process.env.REACT_APP_POLICY_BACKEND}policy/user/count?display=true&search=${searchValue}`, "GET", 1, {});
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

  const getDisplayPolicyId = (policy_id) => {
    return "PL" + String(policy_id).padStart(7, "0");
  };

  const columns2 = [
    {
      name: "Document ID",
      selector: (row) => row.id || "N/A",
      cell: (row) => (
        <div style={{ textAlign: "left", width: "100%", paddingLeft: "8px" }}>
          {getDisplayPolicyId(row.id) || "N/A"}
        </div>
      ),
      width: "20%"
    },
    {
      name: "Document Title",
      selector: (row) => row.title || "N/A",
      width: "25%",
      cell: (row) => (
        <Typography
          variant="body2"
          sx={{
            textAlign: "left",
            cursor: "pointer",
            color: "#ee8812",
            textDecoration: "none",
            paddingLeft: "8px",
            fontWeight: "bold",
            fontSize: "16px"
          }}
          onClick={() => handleRowClick(row)}
        >
          {row.title}
        </Typography>
      )
    },
    {
      name: "Type",
      selector: (row) => row.type || "N/A",
      width: "15%",
      cell: (row) => {
        const typeMapping = {
          1: "Policy",
          2: "SOP",
          3: "Guidance Note"
        };
        const displayType = typeMapping[row.type] || "N/A";
        return (
          <div style={{ textAlign: "left", width: "100%", paddingLeft: "8px" }}>{displayType}</div>
        );
      }
    },
    {
      name: "Approved On",
      width: "20%",
      cell: (row) => {
        return (
          <div style={{ textAlign: 'left', width: '100%', paddingLeft: '8px' }}>
            {new Date(row.approvedAt).toLocaleDateString() || 'N/A'}
          </div>
        );
      },
    },
    {
      name: "Description",
      selector: (row) => row.description || "N/A",
      width: "20%",
      cell: (row) => (
        <Typography variant="body2" sx={{ whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis", maxWidth: "600px", textAlign: "center", paddingLeft: "8px" }} title={row.description}>
          {row.description}
        </Typography>
      )
    }
  ];

  // useEffect(() => {
  //   handleSearchType(currentPage, rowsPerPage, searchValue, selectedType);
  // }, [selectedType, currentPage, rowsPerPage, searchValue]);

  // const handlePageChange = (newPage) => {
  //   if (isSearching) {
  //     setCurrentPage(newPage);
  //     handleSearchData(newPage, rowsPerPage, searchValue);
  //   } else {
  //     setCurrentPage(newPage);
  //     fetchData(newPage, rowsPerPage);
  //   }
  // };

  // const handleRowsPerPageChange = (newRowsPerPage) => {
  //   if (isSearching) {
  //     setRowsPerPage(newRowsPerPage);
  //     handleSearchData(currentPage, newRowsPerPage, searchValue);
  //   } else {
  //     setRowsPerPage(newRowsPerPage);
  //     fetchData(currentPage, newRowsPerPage);
  //   }
  // };

  // useEffect(() => {
  //   if(isSearching){
  //     handleSearchType(currentPage, rowsPerPage, deboucedSearchValue, selectedType);
  //   } else{
  //     fetchData(currentPage, rowsPerPage);
  //   }
  // }, [selectedType, currentPage, rowsPerPage, deboucedSearchValue]);

  useEffect(() => {
    handleSearchType(currentPage, rowsPerPage, deboucedSearchValue, selectedType);
  }, [selectedType, currentPage, rowsPerPage, deboucedSearchValue]);

  const handlePageChange = (newPage) => {
    if (isSearching) {
      setCurrentPage(newPage);
      handleSearchType(newPage, rowsPerPage, deboucedSearchValue, selectedType);
    } else {
      setCurrentPage(newPage);
      fetchData(newPage, rowsPerPage);
    }
  };

  const handleRowsPerPageChange = (newRowsPerPage) => {
    if (isSearching) {
      setRowsPerPage(newRowsPerPage);
      handleSearchType(currentPage, newRowsPerPage, deboucedSearchValue, selectedType);
    } else {
      setRowsPerPage(newRowsPerPage);
      fetchData(currentPage, newRowsPerPage);
    }
  };

  const handleRowClick = (row) => {
    setSelectedDocument(row.title);
    setSelectedRow(row);
    navigate(`/policy/${row.id}`, { state: { title: row.title, status: row.status } });
  };

  return (
    <ContentBox className="analytics">
      <Card sx={{ px: 1, py: 1, height: "100%", width: "100%" }}>
        <Grid container spacing={2}>
          <Grid item lg={6} md={6} sm={6} xs={12}>
            <Typography variant="h5" sx={{ fontFamily: "sans-serif", fontWeight: "bold", fontSize: "1rem", marginLeft: { sm: 2, xs: 2 }, marginTop: { sm: 2, xs: 2 }, marginRight: { sm: 2, xs: 2 } }}>
              Policies, SOPs & Guidance notes
            </Typography>
          </Grid>
          <Grid item lg={6} md={6} sm={6} xs={12}>
            <Grid item xs={12} sx={{ display: "flex", justifyContent: { lg: "flex-end", md: "flex-end", sm: "flex-end", xs: "center" }, alignItems: "center", mt: { lg: 2, md: 2, sm: 2, xs: 0 }, mr: { lg: 2, md: 2, sm: 2, xs: 0 } }}>
              <Typography variant="h5" sx={{ fontFamily: "sans-serif", fontSize: "0.875rem", mr: 2, mt: 0.5 }}>
                Type
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
                    sx={{ width: "160px" }}
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
          <Grid item lg={12} md={12} sm={12} xs={12} sx={{ marginLeft: 2, display: "flex", alignItems: "center" }}>
            <StyledTextField value={searchValue} onChange={handleInputChange} placeholder="Search Document ID or Title" sx={{ width: "300px", marginRight: 2 }} />
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
          <Grid item lg={12} md={12} sm={12} xs={12} sx={{ marginTop: -2 }}>
            <Box width="100%" overflow="auto">
              <div style={{ overflowX: 'auto', position: 'relative', }}>
                <div style={{ content: '""', position: 'absolute', bottom: 0, left: 0, width: '100%', height: '1px', backgroundColor: '#ddd', zIndex: 1, transform: 'scaleX(1)', }} />
                <DataTable
                  columns={columns2}
                  data={psgList2}
                  progressPending={loading}
                  pagination
                  paginationServer
                  paginationTotalRows={count}
                  paginationRowsPerPageOptions={showRowsPerPageOptions ? [5, 10, 25] : []}
                  paginationPerPage={rowsPerPage}
                  onChangePage={handlePageChange}
                  onChangeRowsPerPage={handleRowsPerPageChange}
                  onSort={handleSort}
                  sortServer={false}
                  customStyles={{
                    table: {
                      style: {
                        minWidth: '100%',
                        width: '100%',
                        tableLayout: 'fixed',
                        borderBottom: '1px solid #ddd',
                      },
                    },
                    headCells: {
                      style: {
                        fontSize: "0.875rem",
                        fontFamily: "sans-serif",
                        fontWeight: "bold",
                        textAlign: "center",
                        borderBottom: '1px solid #ddd',
                      }
                    },
                    cells: {
                      style: {
                        fontFamily: "sans-serif",
                        fontSize: "0.875rem",
                        textAlign: "center",
                        padding: "8px",
                        borderBottom: '1px solid #ddd',
                      }
                    }
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

export default ApplicableTable;
