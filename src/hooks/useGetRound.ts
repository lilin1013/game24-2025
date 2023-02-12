import axios from 'axios';
import { useState, useEffect } from 'react';

interface Props {
    gameCode: string
}

export interface Round {
    Id:string,
    Round: number,
    Card1: number,
    Card2: number,
    Card3: number,
    Card4: number,
    UserId: string,
    Status: Status,
}

export enum Status {
    Waiting = 0,
    Playing = 1,
    RaiseHand = 2,
    Correct = 3,
    Wrong = 4,
    Skipped = 5
}


export const useGetRound= (props :Props) => {
    let { gameCode } = props;
    const hostUrl = process.env.HOST_URL;
    const [round, setRound] = useState<Round>({} as Round);
    const [loading, setLoading] = useState(true);

    const getLatestRound = async (code?: string) => {
        if(code) gameCode = code;
        if(gameCode){
            setLoading(true);
        try {
            const response = await axios.get(`${hostUrl}/api/game/${gameCode}/latestRound`);
            setLoading(false);
            setRound(response.data);
        } catch (error) {
            console.error(error);
        }
        }
        
    }
    
    useEffect(() => {
        getLatestRound();
    }, []);
    
    return { round, getLatestRound, loading };
}


