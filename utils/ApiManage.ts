import axios from "axios";

const baseURL = "http://10.0.2.2:1337"

const jwtToken = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6Mzk1NCwiaWF0IjoxNjg4NzE3NzcxLCJleHAiOjE2OTEzMDk3NzF9.jeZv5mi_mV-Sw42zkif4XVtyMtreSKsxNPdikL2mL4I"


export const client = axios.create({
    baseURL: baseURL,
    headers: {
        'Authorization': `Bearer ${jwtToken}`,
        'Content-Type': 'application/json'
    },
    timeout: 5000
});