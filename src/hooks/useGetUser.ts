import axios from 'axios';
import { useState, useEffect } from 'react';
import { User } from '../components/avatar';

interface Props {
    gameCode: string
}


export const useGetUsers= (props :Props) => {
    const hostUrl = process.env.HOST_URL;
    let { gameCode } = props;
    const [users, setUsers] = useState<Array<User>>([]);
    const [loadingUser, setLoadingUser] = useState(true);

    const getUsers = async (code?: string) => {
        if(code) gameCode = code;
        if(gameCode){
            setLoadingUser(true);
        try {
            const response = await axios.get(`${hostUrl}/api/game/${gameCode}/users`);
            setLoadingUser(false);
            setUsers(response.data);
        } catch (error) {
            console.error(error);
        }
        }
        
    }
    
    useEffect(() => {
      getUsers();
    }, []);
    
    return { users, getUsers, loadingUser };
}


