import axios from 'axios';

const api = axios.create({
 // baseURL: 'https://fantastic-bassoon-q4p6w6665g934vrr-5000.app.github.dev/api', 
 baseURL: 'http://localhost:5000/api', 
});

export default api;