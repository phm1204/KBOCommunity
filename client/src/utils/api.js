import axios from 'axios';
export const getGames = () => axios.get('http://localhost:5000/games').then(res => res.data);
export const getTeamRankings = () => axios.get('http://localhost:5000/teams/rank').then(res => res.data);
export const login = (data) => axios.post('http://localhost:5000/user/login', data);
export const register = (data) => axios.post('http://localhost:5000/user/register', data);
export const patchMyteam = (username, myteam) => axios.patch('http://localhost:5000/user/myteam', { username, myteam });
export const deleteUser = (username) => axios.delete('http://localhost:5000/user', { data: { username } }); 