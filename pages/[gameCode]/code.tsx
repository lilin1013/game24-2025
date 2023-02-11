import styles from '@/styles/Home.module.css'
import Button from '../components/button'
import { useRouter } from 'next/router';
import Avatar from '../components/avatar';
import {  useEffect } from 'react';
import PageHeader from '../components/pageHeader';
import { useWebSocket, MessageListener } from '../../src/webSocket';
import { useGetUsers } from '@/src/hooks/useGetUser';

export default function CodePage() {
    const router = useRouter();
    const gameCode =router.query.gameCode;
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
            <main className={styles.main}>
                <div className='flex flex-col gap-4 items-center'>
                    <p className='text-center text-xl text-bold'>Send the code to other players</p>
                    <p className='text-bold text-3xl text-center'>{gameCode}</p>
                    <div className='flex flex-wrap gap-4 justify-center max-w-3xl'>
                        {users.map((user) => <Avatar key={user.Id} user={user} />)}

                    </div>
                    <Button width='w-48' onClick={() => {  router.push(`../${gameCode}/cards`);}} text="Next"></Button>
                </div>
            </main>
        </>
    );
}