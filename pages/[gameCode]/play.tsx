import styles from '@/styles/Home.module.css'
import Button from '../../src/components/button'
import axios from 'axios';
import { useRouter } from 'next/router';
import Avatar, { User } from '../../src/components/avatar';
import { useEffect } from 'react';
import PageHeader from '../../src/components/pageHeader';
import { useWebSocket, MessageListener } from '../../src/webSocket';
import Card from '../../src/components/card';
import { useGetUsers } from '@/src/hooks/useGetUser';
import { useGetRound, Round, Status } from '../../src/hooks/useGetRound';

export default function Play() {
    const hostUrl = process.env.HOST_URL;
    const router = useRouter();
    const gameCode = router.query.gameCode;
    const { users, getUsers } = useGetUsers({ gameCode: gameCode as string })
    const { round, getLatestRound, loading} = useGetRound({ gameCode: gameCode as string })
    const { addMessageListener, removeMessageListener } = useWebSocket(gameCode as string);

   
    useEffect(() => {
        if (gameCode) {
            getUsers(gameCode as string);
            getLatestRound(gameCode as string);
            const listener: MessageListener = (message: String) => {
                switch (message) {
                    case "roundUpdated":
                        getLatestRound(gameCode as string);
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

    const onRaisehand = async () => {
        if (gameCode) {
            try {
                await axios.put(`${hostUrl}/api/game/${gameCode}/raiseHand`, {
                    userId:localStorage.getItem("userId"),
                    round: round.Round,
                });
                getLatestRound(gameCode as string)
            } catch (error) {
                console.error(error);
            }

            const listener: MessageListener = (message: String) => {
                if (message === "userUpdated") {
                    getUsers(gameCode as string);
                }
                if (message === "roundUpdated") {
                    getLatestRound(gameCode as string)
                }
            };
            addMessageListener(listener);
    
            return () => {
                removeMessageListener(listener);
            };
        }
    }

    const onEvaluate = async (correct: boolean) => {
        if (gameCode) {
            try {
                await axios.put(`${hostUrl}/api/game/${gameCode}/evaluate`, {
                    correct,
                    round: round.Round
                });
            } catch (error) {
                console.error(error);
            }
        }
    }

    return (
        <>
            <PageHeader />
            <main className="flex flex-col justify-between items-center h-screen p-6">
                <div className='flex gap-10'>

                    <div className='flex flex-col gap-40 items-center bg-gray-300 p-20 rounded' >

                       {!loading && <div className='flex gap-10' >
                            <Card value={round.Card1.toString()}></Card>
                            <Card value={round.Card2.toString()}></Card>
                            <Card value={round.Card3.toString()}></Card>
                            <Card value={round.Card4.toString()}></Card>
                        </div>} 
                       
                        <div>
                            {round.Status === Status.Playing && <Button width="w-48" onClick={onRaisehand} text="Raise Hand"></Button>}
                            {round.Status === Status.RaiseHand && <div className='flex flex-col gap-4'>
                                <div className='flex justify-center items-center'>
                                    <Avatar user={users.find(u=>u.Id = round.UserId) as User}/>
                                    <div className='text-orange-600 text-xl text-bold'>is presenting the idea</div>
                                </div>
                                <div className='flex gap-4'>
                                    <Button width="w-48" onClick={()=>{onEvaluate(true)}} text="correct"></Button>
                                    <Button width="w-48" onClick={()=>{onEvaluate(false)}}  text="wrong"></Button>
                                </div>
                            </div>
                            }
                        </div>
                       
                    </div>
                    <div className='flex flex-col'>
                        {users.map((user) => <Avatar key={user.Id} user={user} showPoints={true} />)}
                    </div>
                </div>
            </main>
        </>
    );
}