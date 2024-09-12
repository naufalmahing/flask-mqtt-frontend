import axios from "axios";

// const baseUrl = 'http://localhost:8000'
const baseUrl = 'https://46d6da7b-7353-488a-982f-e92bade45d11-dev.e1-us-east-azure.choreoapis.dev/flask-mqtt/backend/v1.1'

export default axios.create({
  baseURL: baseUrl,
  withCredentials: false,
});