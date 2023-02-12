import styles from '@/styles/Home.module.css'
import Button from '../components/button'
import { useRouter } from 'next/router';
import Avatar from '../components/avatar';
import { useEffect } from 'react';
import PageHeader from '../components/pageHeader';
import { useWebSocket, MessageListener } from '../../src/webSocket';
import { useGetUsers } from '@/src/hooks/useGetUser';
import axios from 'axios';

export default function CodePage() {
    const hostUrl = process.env.HOST_URL;
    const router = useRouter();
    const gameCode = router.query.gameCode;
    const { users, getUsers } = useGetUsers({ gameCode: gameCode as string })
    const { addMessageListener, removeMessageListener } = useWebSocket(gameCode as string);

    useEffect(() => {
        if (gameCode) {
            getUsers(gameCode as string);
            const listener: MessageListener = (message: String) => {
                switch (message) {
                    case "userUpdated":
                        getUsers();
                        break;
                    default:
                        break;
                }
    
            };
            addMessageListener(listener);
            return () => {
                removeMessageListener(listener);
            };
        }
    }, [gameCode])

    const startNewGame = async (gameCode:string) => {
        if (gameCode) {
            try {
                await axios.post(`${hostUrl}/api/game/${gameCode}/round`);
                router.push(`../${gameCode}/play`);
            } catch (error) {
                console.error(error);
            }
        }
    }

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
                    <Button width='w-48' onClick={()=>{startNewGame(gameCode as string)}} text="Next"></Button>
                </div>
            </main>
        </>
    );
}