import styles from '@/styles/Home.module.css'
import Button from '../components/button'
import axios from 'axios';
import { useRouter } from 'next/router';
import Avatar, {User} from '../components/avatar';
import {  useEffect } from 'react';
import PageHeader from '../components/pageHeader';
import { useWebSocket, MessageListener } from '../../src/webSocket';
import Card from '../components/card';
import { useGetUsers } from '@/src/hooks/useGetUser';

export default function Cards() {
    const router = useRouter();
    const gameCode = router.query.gameCode;
    const {users, getUsers} = useGetUsers({gameCode: gameCode as string})
    const { addMessageListener, removeMessageListener } = useWebSocket();

    useEffect(() => {
        const listener: MessageListener = (message: String) => {
            if (message === "newPlayerJoined") {
                getUsers();
            }
        };
        addMessageListener(listener);

        return () => {
            removeMessageListener(listener);
        };
    }, []);

    

    useEffect(() => {
        if (gameCode) getUsers(gameCode as string);
    }, [gameCode])

    return (
        <>
            <PageHeader />
            <main className="flex flex-col justify-between items-center h-screen p-6">
                <div className='flex gap-10'>
                    
                    <div className='flex flex-col gap-40 items-center bg-gray-300 p-20 rounded' >
                   
                    <div className='flex gap-10' >
                        <Card value='4'></Card>
                        <Card value='6'></Card>
                        <Card value='7'></Card>
                        <Card value='8'></Card>
                    </div>
                    <Button width="w-48" onClick={()=>{}} text="Raise Hand"></Button>
                    </div>
                    <div className='flex flex-col'>
                        {users.map((user) => <Avatar key={user.Id} user={user} showPoints={true}/>)}
                    </div>
                </div>
            </main>
        </>
    );
}