import styles from '@/styles/Home.module.css'
import Button from '../components/button'
import axios from 'axios';
import { useRouter } from 'next/router';
import Avatar, { User } from '../components/avatar';
import { useState, useEffect } from 'react';
import PageHeader from '../components/pageHeader';
import { useWebSocket, MessageListener } from '../../src/webSocket';

export default function WaitingPage() {
    const router = useRouter();
    const gameCode = router.query.gameCode;
    const [users, setUsers] = useState<Array<User>>([]);
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


    const getUsers = async () => {
        try {
            const response = await axios.get(`http://localhost:5065/api/game/${gameCode}/users`);
            setUsers(response.data);
        } catch (error) {
        }
    }

    useEffect(() => {
        if (gameCode) getUsers();
    }, [gameCode])

    return (
        <>
            <PageHeader />
            <main className={styles.main}>
                <div className='flex flex-col gap-4'>
                    <p className='text-center text-xl text-bold text-green-700'>Waiting for the host to start ...</p>
                    <div className='flex flex-wrap gap-4 justify-center max-w-3xl'>
                        {users.map((user) => <Avatar key={user.Id} user={user} />)}
                    </div>
                </div>
            </main>
        </>
    );
}