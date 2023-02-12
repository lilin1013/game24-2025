import styles from '@/styles/Home.module.css'
import Button from '../components/button'
import axios from 'axios';
import { useRouter } from 'next/router';
import Avatar, { User } from '../components/avatar';
import { useState, useEffect } from 'react';
import PageHeader from '../components/pageHeader';
import { useWebSocket, MessageListener } from '../../src/webSocket';
import { useGetUsers } from '@/src/hooks/useGetUser';

export default function WaitingPage() {
    const router = useRouter();
    const gameCode = router.query.gameCode;
    const { users, getUsers } = useGetUsers({ gameCode: gameCode as string })
    const { addMessageListener, removeMessageListener } = useWebSocket(gameCode as string);

    useEffect(() => {
        if (gameCode) {
            getUsers(gameCode as string);
            const listener: MessageListener = (message: String) => {
                switch (message) {
                    case "roundUpdated":
                        router.push(`../${gameCode}/play`);
                        break;
                    case "userUpdated":
                        getUsers(gameCode as string);
                        break;
                    default:
                        break;
                }
    
            };
            addMessageListener(listener);
            return () => {
                removeMessageListener(listener);
            }
        }
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