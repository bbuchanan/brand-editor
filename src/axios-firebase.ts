import axios from "axios";

const axiosFirebase = axios.create({
  baseURL: process.env.REACT_APP_DATABASE_URL
});

export default axiosFirebase;
