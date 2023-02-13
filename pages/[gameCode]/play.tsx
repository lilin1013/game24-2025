import styles from '@/styles/Home.module.css'
import Button from '../../src/components/button'
import axios from 'axios';
import { useRouter } from 'next/router';
import Avatar, { User } from '../../src/components/avatar';
import { useEffect, useState } from 'react';
import PageHeader from '../../src/components/pageHeader';
import { useWebSocket, MessageListener } from '../../src/webSocket';
import Card from '../../src/components/card';
import { useGetUsers } from '@/src/hooks/useGetUser';
import { useGetRound, Round, Status } from '../../src/hooks/useGetRound';
import { Main } from 'next/document';
import TextBox from '../../src/components/textBox';
import isValidCal from '@/src/helpers/validCal';

export default function Play() {
    const hostUrl = process.env.HOST_URL;
    const router = useRouter();
    const gameCode = router.query.gameCode;
    const { users, getUsers,loadingUser } = useGetUsers({ gameCode: gameCode as string })
    const { round, getLatestRound, loading} = useGetRound({ gameCode: gameCode as string })
    const { addMessageListener, removeMessageListener } = useWebSocket(gameCode as string);

const [answer, setAnswer] = useState<string>('');

   
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

    const onEvaluate = async () => {
        var correct = isValidCal(answer, [round.Card1, round.Card2, round.Card3, round.Card4])
        
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

    const calculationOnChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
        setAnswer(event.target.value);
    }
  

    return (
        <>
            <PageHeader />
            <main className={styles.main}>
            <div className="flex mx-auto gap-10 justify-center w-11/12">
                <div className='bg-gray-300 p-20 flex flex-col gap-10 max-w-2xl items-center h-96 w-9/12'>
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
                            {round.Status === Status.RaiseHand && round.UserId === localStorage.getItem('userId') && <div className='flex flex-col gap-4'>
                                <div className='flex justify-center items-center'>
                                    <Avatar user={users.find(u=>u.Id = round.UserId) as User}/>
                                    <div className='text-orange-600 text-xl text-bold'>Input your calculation</div>
                    
                                </div>
                                <div className='flex justify-between gap-4'>
                                    <TextBox onChange={calculationOnChange} placeholder='Enter the calculation'></TextBox>
                                    <Button width="w-48" onClick={onEvaluate} text="valid"></Button>
                                </div>
                            </div>
                            }
                             {round.Status === Status.RaiseHand && round.UserId !== localStorage.getItem('userId') && <div className='flex flex-col gap-4'>
                                <div className='flex justify-center items-center'>
                                    <Avatar user={users.find(u=>u.Id = round.UserId) as User}/>
                                    <div className='text-orange-600 text-xl text-bold'>is inputing the calculation, please wait</div>
                    
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