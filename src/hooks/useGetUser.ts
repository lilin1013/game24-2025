import axios from 'axios';
import { useState, useEffect } from 'react';
import { User } from '../../pages/components/avatar';

interface Props {
    gameCode: string
}


export const useGetUsers= (props :Props) => {
    let { gameCode } = props;
    const [users, setUsers] = useState<Array<User>>([]);
    const [loading, setLoading] = useState(true);

    const getUsers = async (code?: string) => {
        if(code) gameCode = code;
        if(gameCode){
            setLoading(true);
        try {
            const response = await axios.get(`http://localhost:5065/api/game/${gameCode}/users`);
            setLoading(false);
            setUsers(response.data);
        } catch (error) {
            console.error(error);
        }
        }
        
    }
    
    useEffect(() => {
      getUsers();
    }, []);
    
    return { users, getUsers, loading };
}


