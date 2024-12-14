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

  const queryParams = new URLSearchParams(location.search);
  const initialTab = Number(queryParams.get("tab")) || 1;
  const [activeTab, setActiveTab] = useState(initialTab);
  const [currentPage, setCurrentPage] = useState(1);

  useEffect(() => {
    setActiveTab(Number(initialTab));
  }, [initialTab]);

  const handleTabChange = (event, newValue) => {
    setActiveTab(newValue);
    setCurrentPage(1);
    navigate(`?tab=${newValue}`, { replace: true });
    fetchData(newValue, currentPage, rowsPerPage);
  };

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
  const [selectedType, setSelectedType] = useState("");
  const [selectedStatus, setSelectedStatus] = useState("");
  const [selectedCAStatus, setSelectedCAStatus] = useState("");

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

        const response2 = await customFetchWithAuth(`${process.env.REACT_APP_POLICY_BACKEND}admin/get-policy-count`, "GET", 1, {});
        const data2 = await response2.json();
        if (data2 && data2.status) {
          const policyCount = data2.count;
          setPolicyCount(policyCount || 0);
        }

        const response3 = await customFetchWithAuth(`${process.env.REACT_APP_POLICY_BACKEND}admin/get-circular-count`, "GET", 1, {});
        const data3 = await response3.json();
        if (data3 && data3.status) {
          const circularCount = data3.count;
          setCircularCount(circularCount || 0);
        }
      } catch (error) {
        console.error("Error fetching data", error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [userCount, policyCount, circularCount]);

  const fetchData = async (tab, page, rows) => {
    setLoading(true);
    try {
      if (tab == 1) {
        let url = `${process.env.REACT_APP_POLICY_BACKEND}admin/get-all-user?page=${page}&rows=${rows}`;
        const response = await customFetchWithAuth(url, "GET", 1, {});
        const data = await response.json();
        setPsgList(data.data);
        setCount(userCount || 0);
      } else if (tab == 2) {
        let url = `${process.env.REACT_APP_POLICY_BACKEND}admin/get-all-policy?page=${page}&rows=${rows}`;
        const response = await customFetchWithAuth(url, "GET", 1, {});
        const data = await response.json();
        setPsgList(data.data);
        setCount(policyCount || 0);
      } else if (tab == 3) {
        let url = `${process.env.REACT_APP_POLICY_BACKEND}admin/get-all-circulars?page=${page}&rows=${rows}`;
        const response = await customFetchWithAuth(url, "GET", 1, {});
        const data = await response.json();
        setPsgList(data.data);
        setCount(circularCount || 0);
      }
    } catch (error) {
      console.error("Error fetching data:", error);
    } finally {
      setLoading(false);
    }
  };

  const [searchValue, setSearchValue] = useState("");
  let deboucedSearchValue = useDebouce(searchValue, 200);
  const [searchValue2, setSearchValue2] = useState("");
  let deboucedSearchValue2 = useDebouce(searchValue2, 200);
  const [searchValue3, setSearchValue3] = useState("");
  const [isSearching, setIsSearching] = useState(false);
  let deboucedSearchValue3 = useDebouce(searchValue3, 200);

  const handleInputChange = (event) => {
    if (activeTab == 1) setSearchValue(event.target.value);
    else if (activeTab == 2) setSearchValue2(event.target.value);
    else if (activeTab == 3) setSearchValue3(event.target.value);
  };

  const handleSearchData = async (tab, page, rows, searchValue, searchValue2, searchValue3, type, status, CAstatus) => {
    setLoading(true);
    setIsSearching(true);
    setSearchValue(searchValue.trimStart());
    setSearchValue2(searchValue2.trimStart());
    setSearchValue3(searchValue3.trimStart());
    try {
      if (tab == 1) {
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
      } else if (tab == 2) {
        const response2 = await customFetchWithAuth(
          `${process.env.REACT_APP_POLICY_BACKEND}admin/get-all-policy?page=${page}&rows=${rows}&search=${searchValue2}&type=${type}&status=${status}`, "GET", 1, {});
        const data2 = await response2.json();
        setPsgList(data2.data);

        const countResponse2 = await customFetchWithAuth(
          `${process.env.REACT_APP_POLICY_BACKEND}admin/get-policy-count?search=${searchValue2}&type=${type}&status=${status}`, "GET", 1, {});
        if (!countResponse2.ok) {
          throw new Error("Failed to fetch count data");
        }
        const countData2 = await countResponse2.json();
        setCount(countData2.count);
      } else if (tab == 3) {
        const response3 = await customFetchWithAuth(`${process.env.REACT_APP_POLICY_BACKEND}admin/get-all-circulars?page=${page}&rows=${rows}&search=${searchValue3}&status=${CAstatus}`, "GET", 1, {});
        const data3 = await response3.json();
        setPsgList(data3.data);

        const countResponse3 = await customFetchWithAuth(`${process.env.REACT_APP_POLICY_BACKEND}admin/get-circular-count?search=${searchValue3}&status=${CAstatus}`, "GET", 1, {});
        if (!countResponse3.ok) {
          throw new Error('Failed to fetch count data');
        }
        const countData3 = await countResponse3.json();
        setCount(countData3.count);
      }
    } catch (error) {
      console.error("Error fetching data:", error);
    } finally {
      setLoading(false);
    }
  };

  const getDisplayPolicyId = (policy_id) => {
    return "PL" + String(policy_id).padStart(7, "0");
  };

  const getDisplayCircularId = (circular_id) => {
    return "CA" + String(circular_id).padStart(7, "0");
  };

  const [action, setAction] = useState({});
  const [rowActions, setRowActions] = useState({});
  const [isCheckEnabled, setIsCheckEnabled] = useState({});

  useEffect(() => {
    if (psgList) {
      const initialActions = {};
      const initialCheckEnabled = {};
      psgList.forEach((row) => {
        if (row.status === 1) {
          initialActions[row.id] = "activate";
        } else if (row.status === 2) {
          initialActions[row.id] = "deprecate";
        }
        initialCheckEnabled[row.id] = false;
      });
      setRowActions(initialActions);
      setIsCheckEnabled(initialCheckEnabled);
    }
  }, [psgList]);

  const handleActionChange = (event, row) => {
    const action = event.target.value;
    setAction((prevActions) => ({
      ...prevActions,
      [row.id]: action,
    }));
    setRowActions((prevActions) => ({
      ...prevActions,
      [row.id]: action,
    }));
    setIsCheckEnabled((prevEnabled) => ({
      ...prevEnabled,
      [row.id]: true,
    }));
  };

  const handleOptionChange = (rowId, selectedValue) => {
    const row = psgList.find((r) => r.id === rowId);
    setRowActions((prev) => ({
      ...prev,
      [rowId]: selectedValue,
    }));
    const updatedCheckEnabled = {
      ...isCheckEnabled,
      [rowId]: (selectedValue === "deprecate" && row.status === 1) || 
               (selectedValue === "activate" && row.status === 2),
    };
    setIsCheckEnabled(updatedCheckEnabled);
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

  const columns2 = [
    {
      name: "Document ID",
      selector: (row) => row.id || "N/A",
      cell: (row) => (
        <div style={{ textAlign: "left", width: "100%", paddingLeft: "8px" }}>
          {getDisplayPolicyId(row.id) || "N/A"}
        </div>
      ),
      width: isXs ? "20%" : isMd ? "20%" : "17%"
    },
    {
      name: "Document Title",
      selector: (row) => row.title || "N/A",
      width: isXs ? "20%" : isMd ? "20%" : "23%",
      cell: (row) => (
        <Typography variant="body2" sx={{ textAlign: "left", textDecoration: "none", paddingLeft: "8px", fontSize: "14px" }}>
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
      name: "Description",
      selector: (row) => row.description || "N/A",
      width: "25%",
      cell: (row) => (
        <Typography variant="body2" sx={{ whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis", maxWidth: "600px", textAlign: "center", paddingLeft: "8px" }} title={row.description}>
          {row.description}
        </Typography>
      )
    },
    {
      name: "Status",
      selector: (row) => row.status || "N/A",
      width: "10%",
      cell: (row) => {
        const statusMapping = {
          0: "In review",
          1: "Approved",
          2: "Rejected",
          3: "Deprecated"
        };
        const displayStatus = statusMapping[row.status] || "N/A";
        return (
          <div style={{ textAlign: "left", width: "100%", paddingLeft: "8px" }}>{displayStatus}</div>
        );
      }
    },
    {
      name: "Action",
      selector: () => null,
      width: "10%",
      center: "true",
      cell: (row) => (
        <Box sx={{ display: "flex", justifyContent: "center", alignItems: "center", height: "100%" }}>
          <EditIcon sx={{ cursor: "pointer", color: "#ee8812", justifyContent: "center", alignItems: "center" }} onClick={() => handleRowClick(row)} />
        </Box>
      )
    }
  ];

  const columns3 = [
    {
      name: 'Circular ID',
      selector: row => row.id || 'N/A',
      cell: (row) => (
        <div style={{ textAlign: 'left', width: '100%', paddingLeft: '8px' }}>
          {getDisplayCircularId(row.id) || 'N/A'}
        </div>
      ),
      width: isXs ? '20%' : isMd ? '20%' : '13%',
    },
    {
      name: 'Circular Title',
      selector: row => row.title || 'N/A',
      width: '23%',
      cell: (row) => (
        <Typography variant="body2" sx={{ textAlign: 'left', textDecoration: 'none', paddingLeft: '8px', fontSize: '14px' }}>
          {row.title}
        </Typography>
      ),
    },
    {
      name: 'Circular Description',
      selector: row => row.description || 'N/A',
      width: '33%',
      cell: (row) => (
        <Typography variant="body2" sx={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', maxWidth: '600px', textAlign: 'center', paddingLeft: '8px' }} title={row.description}>
          {row.description}
        </Typography>
      ),
    },
    {
      name: "Status",
      selector: (row) => row.status || "N/A",
      width: "13%",
      cell: (row) => {
        const statusMapping = {
          1: "Active",
          2: "Deprecated",
        };
        const displayStatus = statusMapping[row.status] || "N/A";
        return (
          <div style={{ textAlign: "left", width: "100%", paddingLeft: "8px", paddingRight: "8px" }}>{displayStatus}</div>
        );
      }
    },
    {
      name: 'Action',
      selector: () => null,
      width: '15%',
      headerStyle: {
        textAlign: 'center',
      },
      center: "true",
      cell: (row) => (
        <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '40%' }}>
          <form>
            <StyledSelect value={rowActions[row.id] || ""} onChange={(event) => handleOptionChange(row.id, event.target.value)} displayEmpty sx={{ width: '120px' }}>
              <MenuItem value="activate">Activate</MenuItem>
              <MenuItem value="deprecate">Deprecate</MenuItem>
            </StyledSelect>
          </form>
          {isCheckEnabled[row.id] && (
            <Button onClick={() => handleCASubmit(row)} sx={{ ml: 1, backgroundColor: '#ee8812', color: '#fff', minWidth: '30px', height: '25px', borderRadius: '5px', '&:hover': { backgroundColor: 'rgb(249, 83, 22)', }, }}>
              <CheckIcon />
            </Button>
          )}
        </Box>
      ),
    }
  ];

  const columns = activeTab == 1 ? columns1 : activeTab == 2 ? columns2 : columns3;

  const handlePageChange = (newPage) => {
    if (isSearching) {
      setCurrentPage(newPage);
      handleSearchData(activeTab, newPage, rowsPerPage, searchValue, searchValue2, searchValue3, selectedType, selectedStatus, selectedCAStatus);
    } else {
      setCurrentPage(newPage);
      fetchData(activeTab, newPage, rowsPerPage);
    }
  };

  const handleRowsPerPageChange = (newRowsPerPage) => {
    if (isSearching) {
      setRowsPerPage(newRowsPerPage);
      handleSearchData(activeTab, currentPage, newRowsPerPage, searchValue, searchValue2, searchValue3, selectedType, selectedStatus, selectedCAStatus);
    } else {
      setRowsPerPage(newRowsPerPage);
      fetchData(activeTab, currentPage, newRowsPerPage);
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
      fetchData(activeTab, currentPage, rowsPerPage);
    }
  }, [activeTab, currentPage, rowsPerPage]);

  // useEffect(() => {
  //   handleSearchData(activeTab, currentPage, rowsPerPage, searchValue, searchValue2, searchValue3, selectedType, selectedStatus, selectedCAStatus);
  // }, [activeTab, currentPage, rowsPerPage, searchValue, searchValue2, searchValue3, selectedType, selectedStatus, selectedCAStatus]);

  useEffect(() => {
    handleSearchData(activeTab, currentPage, rowsPerPage, deboucedSearchValue, deboucedSearchValue2, deboucedSearchValue3, selectedType, selectedStatus, selectedCAStatus);
  }, [activeTab, currentPage, rowsPerPage, deboucedSearchValue, deboucedSearchValue2, deboucedSearchValue3, selectedType, selectedStatus, selectedCAStatus]);

  const handleRowClick = (row) => {
    if (activeTab == 1) {
      setSelectedDocument(row.user_id);
      setSelectedRow(row);
      navigate(`/admin/user/${row.user_id}`, {
        state: { user_id: row.user_id, emp_id: row.emp_id, emp_name: row.emp_name, activeTab }
      });
    } else if (activeTab == 2) {
      setSelectedDocument(row.title);
      setSelectedRow(row);
      navigate(`/admin/policy/${row.id}`, { state: { id: row.id, title: row.title, activeTab } });
    }
  };

  const handleCASubmit = (event) => {
    setLoading(true);
    const url = `${process.env.REACT_APP_POLICY_BACKEND}admin/CA-change-status`;
    const selectedAction = rowActions[event.id];
    let status = null;
    if (selectedAction === "activate") {
      status = 1;
    } else if (selectedAction === "deprecate") {
      status = 2;
    }
    const formData = {
      id: event.id,
      status: status
    }
    const submitForm = customFetchWithAuth(url, "POST", 2, JSON.stringify(formData))
      .then((response) => {
        if (!response.ok) {
          throw new Error(`Error: ${response.statusText}`);
        }
        return response.json();
      })
      .then((data) => {
        if (data.status) {
          setIsCheckEnabled((prevEnabled) => ({
            ...prevEnabled,
            [event.id]: false,
          }));
          setTimeout(() => {
            navigate("/admin");
          }, 1000);
        } else {
          throw new Error("Submission failed");
        }
        setLoading(false);
      })
      .catch((error) => {
        console.error("Submission error:", error);
        setLoading(false);
        throw error;
      });
    if (selectedAction === "activate") {
      toast.promise(submitForm, {
        loading: "Activating...",
        success: (data) => `Circular activated successfully`,
        error: (err) => `Error while activating the circular`
      });
    } else if (selectedAction === "deprecate") {
      toast.promise(submitForm, {
        loading: "Deprecating...",
        success: (data) => `Circular deprecated successfully`,
        error: (err) => `Error while deprecating the circular`
      });
    }
  };

  return (
    <ContentBox className="analytics">
      <Card sx={{ px: 1, py: 1, height: '100%', width: '100%' }}>
        <Grid container spacing={2} sx={{ width: '100%', height: '100%' }}>
          <Grid item lg={12} md={12} sm={12} xs={12} sx={{ display: 'flex', justifyContent: { xs: 'flex-start', sm: 'space-between', md: 'space-between', lg: 'space-between' }, alignItems: 'center', flexDirection: { xs: 'column', sm: 'row', md: 'row', lg: 'row' }, mt: 2 }}>
            <Typography variant="h5" sx={{ fontFamily: 'sans-serif', fontWeight: 'bold', fontSize: '1rem', ml: 2 }}>
              Admin Portal
            </Typography>
            {activeTab == 2 && (
              <Grid item xs="auto" sx={{ display: 'flex', alignItems: 'center', mt: { lg: 0, md: 0, sm: 0, xs: 2 } }}>
                <Typography variant="h5" sx={{ fontFamily: 'sans-serif', fontSize: '0.875rem', mr: 2 }}>
                  <b>Type</b>
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
                      sx={{ width: '160px', }}
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
            )}
          </Grid>
          <Grid item lg={12} md={12} sm={12} xs={12} sx={{ marginLeft: 2, marginTop: -2, display: 'flex', flexDirection: { xs: 'column', sm: 'row', md: 'row', lg: 'row' }, justifyContent: 'space-between', alignItems: 'center' }}>
            <Box sx={{ overflowX: 'auto', width: '100%' }}>
              <Tabs value={activeTab} onChange={handleTabChange} textColor="inherit" indicatorColor="secondary" variant="scrollable" scrollButtons="auto" sx={{ whiteSpace: 'nowrap' }}>
                <Tab label="User Management" value={1} sx={{ minWidth: 0, padding: '6px 0px', margin: 0, fontFamily: "sans-serif", fontSize: '0.875rem', fontWeight: 100, textTransform: "none", mr: 1 }} />
                <Tab label="Policy Management" value={2} sx={{ minWidth: 0, padding: '6px 0px', margin: 0, fontFamily: "sans-serif", fontSize: '0.875rem', fontWeight: 100, textTransform: "none", mr: 1, ml: 1 }} />
                <Tab label="Circular Management" value={3} sx={{ minWidth: 0, padding: '6px 0px', margin: 0, fontFamily: "sans-serif", fontSize: '0.875rem', fontWeight: 100, textTransform: "none", ml: 1 }} />
              </Tabs>
            </Box>
            {activeTab == 2 && (
              <Grid item xs="auto" sx={{ display: 'flex', alignItems: 'center', mt: { lg: -1, md: -1, sm: 0, xs: 2 } }}>
                <Typography variant="h5" sx={{ fontFamily: 'sans-serif', fontSize: '0.875rem', mr: 2 }}>
                  <b>Status</b>
                </Typography>
                <Controller
                  name="documentStatus"
                  control={control}
                  defaultValue=""
                  render={({ field }) => (
                    <StyledSelect
                      labelId="document-status-label"
                      id="documentStatus"
                      {...field}
                      value={field.value ?? selectedStatus}
                      displayEmpty
                      sx={{ width: '160px', }}
                      onChange={(e) => {
                        field.onChange(e);
                        if (e.target.value === "") {
                          setSelectedStatus("");
                        } else {
                          setSelectedStatus(e.target.value);
                        }
                      }}
                    >
                      <MenuItem value="">All</MenuItem>
                      <MenuItem value={0}>In review</MenuItem>
                      <MenuItem value={1}>Approved</MenuItem>
                      <MenuItem value={2}>Rejected</MenuItem>
                      <MenuItem value={3}>Deprecated</MenuItem>
                    </StyledSelect>
                  )}
                />
              </Grid>
            )}
            {activeTab == 3 && (
              <Grid item xs="auto" sx={{ display: 'flex', alignItems: 'center', mt: { lg: -1, md: -1, sm: 0, xs: 2 } }}>
                <Typography variant="h5" sx={{ fontFamily: 'sans-serif', fontSize: '0.875rem', mr: 2 }}>
                  <b>Status</b>
                </Typography>
                <Controller
                  name="documentCAStatus"
                  control={control}
                  defaultValue={selectedCAStatus}
                  render={({ field }) => (
                    <StyledSelect
                      labelId="document-CAstatus-label"
                      id="documentCAStatus"
                      {...field}
                      value={field.value ?? selectedCAStatus}
                      displayEmpty
                      sx={{ width: '160px', }}
                      onChange={(e) => {
                        field.onChange(e);
                        if (e.target.value == "") {
                          setSelectedCAStatus("");
                        } else {
                          setSelectedCAStatus((e.target.value) - 3);
                        }
                      }}
                    >
                      <MenuItem value="">All</MenuItem>
                      <MenuItem value={4}>Active</MenuItem>
                      <MenuItem value={5}>Deprecated</MenuItem>
                    </StyledSelect>
                  )}
                />
              </Grid>
            )}
            {activeTab == 1 && (
              <Button variant="contained" startIcon={<AddIcon />} sx={{ fontFamily: "sans-serif", fontSize: "0.875rem", textTransform: "none", marginTop: { sm: -1, xs: 2 }, height: "25px", width: { lg: "14%", md: "16%", sm: "30%", xs: "50%" }, backgroundColor: "#ee8812", "&:hover": { backgroundColor: "rgb(249, 83, 22)" } }} onClick={() => navigate("/admin/user/add")}>
                New User
              </Button>
            )}
          </Grid>
          {/* SEARCH BOX */}
          <Grid item lg={12} md={12} sm={12} xs={12} sx={{ marginLeft: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexDirection: { xs: 'column', sm: 'row', md: 'row', lg: 'row' } }}>
            <Grid item sx={{ display: 'flex', alignItems: 'flex-start' }}>
              {activeTab == 1 && (
                <>
                  <StyledTextField value={searchValue} onChange={handleInputChange} placeholder="Search..." sx={{ width: '300px', marginRight: 2 }} />
                  {searchValue && (
                    <IconButton
                      onClick={() => {
                        setSearchValue('');
                        setIsSearching(false);
                        fetchData(activeTab, currentPage, rowsPerPage);
                      }}
                      sx={{ marginRight: 1, marginLeft: -2, marginTop: -0.5 }}
                    >
                      <CloseIcon />
                    </IconButton>
                  )}
                </>
              )}
              {activeTab == 2 && (
                <>
                  <StyledTextField value={searchValue2} onChange={handleInputChange} placeholder="Search..." sx={{ width: '300px', marginRight: 2 }} />
                  {searchValue2 && (
                    <IconButton
                      onClick={() => {
                        setSearchValue2('');
                        setIsSearching(false);
                        fetchData(activeTab, currentPage, rowsPerPage);
                      }}
                      sx={{ marginRight: 1, marginLeft: -2, marginTop: -0.5 }}
                    >
                      <CloseIcon />
                    </IconButton>
                  )}
                </>
              )}
              {activeTab == 3 && (
                <>
                  <StyledTextField value={searchValue3} onChange={handleInputChange} placeholder="Search..." sx={{ width: '300px', marginRight: 2 }} />
                  {searchValue3 && (
                    <IconButton
                      onClick={() => {
                        setSearchValue3('');
                        setIsSearching(false);
                        fetchData(activeTab, currentPage, rowsPerPage);
                      }}
                      sx={{ marginRight: 1, marginLeft: -2, marginTop: -0.5 }}
                    >
                      <CloseIcon />
                    </IconButton>
                  )}
                </>
              )}
            </Grid>
            <Grid item sx={{ justifySelf: 'flex-end' }}>
              {activeTab == 1 && (
                <Button variant="contained" sx={{ fontFamily: "sans-serif", fontSize: "0.875rem", textTransform: "none", marginTop: { sm: -3, xs: 0 }, marginBottom: { sm: -1, xs: 2 }, height: { lg: "30px", md: "30px", sm: "30px", xs: "40px", }, width: { lg: "100%", md: "100%", sm: "100%", xs: "100%" }, backgroundColor: "#ee8812", "&:hover": { backgroundColor: "rgb(249, 83, 22)" } }} onClick={() => navigate("/admin/create-user")}>
                  Take Action on New Users
                </Button>
              )}
              {activeTab == 2 && (
                <Button variant="contained" startIcon={<AddIcon />} sx={{ fontFamily: "sans-serif", fontSize: "0.875rem", textTransform: "none", marginTop: { sm: -3, xs: 0 }, marginBottom: { sm: -1, xs: 2 }, height: { lg: "30px", md: "30px", sm: "30px", xs: "40px", }, width: { lg: "100%", md: "100%", sm: "100%", xs: "100%" }, backgroundColor: "#ee8812", "&:hover": { backgroundColor: "rgb(249, 83, 22)" } }} onClick={() => navigate("/admin/policy/add")}>
                  Add Existing Policies
                </Button>
              )}
              {activeTab == 3 && (
                <Button variant="contained" startIcon={<AddIcon />} sx={{ fontFamily: "sans-serif", fontSize: "0.875rem", textTransform: "none", marginTop: { sm: -3, xs: 0 }, marginBottom: { sm: -1, xs: 2 }, height: { lg: "30px", md: "30px", sm: "30px", xs: "40px", }, width: { lg: "100%", md: "100%", sm: "100%", xs: "100%" }, backgroundColor: "#ee8812", "&:hover": { backgroundColor: "rgb(249, 83, 22)" } }} onClick={() => navigate("/admin/circular/add")}>
                  Add Existing Circulars
                </Button>
              )}
            </Grid>
          </Grid>
          <Grid item lg={12} md={12} sm={12} xs={12} sx={{ marginTop: -2 }}>
            <Box width="100%" height="100%" overflow="auto">
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
