import { jwtDecode } from "jwt-decode";
import { useSelector, useDispatch } from "react-redux";
//import { setAccessToken } from "./redux/accessTokenSlice";
import { setJwtToken } from "../../redux/actions/authActions";
const useCustomFetch = () => {
  const dispatch = useDispatch();
  const accessToken = useSelector((state) => state.token);
  const customFetchWithAuth = async (url,method,payload) => {
    let token = accessToken;
    const decodedToken = jwtDecode(token);
    const expirationTime = decodedToken.exp;
    const currentTime = Math.floor(Date.now() / 1000);
    if (currentTime +1 > expirationTime) {
      //alert("inside refresh logic");
      const newAccessTokenData = await fetch("https://policyuat.spandanasphoorty.com/policy_apis/auth/refresh-token", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ otp: "value" })
      });
      const data = await newAccessTokenData.json();
      if (!data.status) {console.log("token not refreshed");
        //redirect to login page
      }
      dispatch(setJwtToken(data.jwt));
      token = data.jwt;
    }
    let requestParams ={
      method:method,
      headers: {
        Authorization: `Bearer ${token}`
      },
    }
    if(method=="POST"){
      requestParams.body=payload
    }
    const response = await fetch(url, requestParams);
    return response;
    // const secretData = await response.json();
    // console.log("data - ", secretData);
    // return secretData;
  };
  return customFetchWithAuth;
};
export default useCustomFetch;
//dispatch(setAccessToken(data.accessToken));
