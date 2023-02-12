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
import { Main } from 'next/document';

export default function Play() {
    const hostUrl = process.env.HOST_URL;
    const router = useRouter();
    const gameCode = router.query.gameCode;
    const { users, getUsers,loadingUser } = useGetUsers({ gameCode: gameCode as string })
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
                    case "showResult":
                        router.push(`../${gameCode}/result`);
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
            } catch (error) {
                console.error(error);
            }
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
            <main className={styles.main}>
            <div className="flex mx-auto gap-10 justify-center">
                <div className='bg-gray-300 p-20 flex flex-col gap-10 max-w-2xl items-center h-80 w-96'>
                       {!loading && <div className='flex gap-4' >
                            <Card value={round.Card1.toString()}></Card>
                            <Card value={round.Card2.toString()}></Card>
                            <Card value={round.Card3.toString()}></Card>
                            <Card value={round.Card4.toString()}></Card>
                        </div>} 

                        {loading && <div className='flex gap-10' >
                            <Card value='s'></Card>
                            <Card value=''></Card>
                            <Card value=''></Card>
                            <Card value=''></Card>
                        </div>}
                       
                        <div>
                            {round.Status === Status.Playing && <Button width="w-48" onClick={onRaisehand} text="Raise Hand"></Button>}
                            {round.Status === Status.RaiseHand && <div className='flex flex-col gap-4'>
                                <div className='flex justify-center items-center'>
                                    <Avatar user={users.find(u=>u.Id = round.UserId) as User}/>
                                    <div className='text-orange-600 text-xl text-bold'>is presenting the calucation</div>
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
                    {users.map((user) =>{ 
                        return <Avatar key={user.Id} user={user} showPoints={true} />
                    })}
                    </div>
                </div>
            </main>
        </>
    );
}