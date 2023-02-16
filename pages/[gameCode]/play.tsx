import Button, { ButtonType } from '../../src/components/button'
import axios from 'axios';
import { useRouter } from 'next/router';
import Avatar, { User, Role } from '../../src/components/avatar';
import { useEffect, useRef, useState } from 'react';
import PageHeader from '../../src/components/pageHeader';
import { useWebSocket, MessageListener } from '../../src/webSocket';
import { useGetUsers } from '@/src/hooks/useGetUser';
import { useGetRound, Status } from '../../src/hooks/useGetRound';
import PokerDeck from '../../src/components/pokerDeck';
import { getLocalStorageTextItem } from '@/src/helpers/localStorage';
import FullscreenPopup, {EvaluateState} from '@/src/components/fullScreenPop';
import Calulator from '@/src/components/calc';
import ErrorComponent from '../../src/components/error';

export default function Play() {
    const hostUrl = process.env.HOST_URL;
    const router = useRouter();
    const gameCode = router.query.gameCode;
    const { users, getUsers } = useGetUsers({ gameCode: gameCode as string })
    const { round, getLatestRound, loading } = useGetRound({ gameCode: gameCode as string })
    const { addMessageListener, removeMessageListener } = useWebSocket(gameCode as string);
    const userId = getLocalStorageTextItem('userId')

    const [showPopup, setShowPopup] = useState(false);
    const evaluateAnswerString = useRef<string>('')
    const evaluateState = useRef<EvaluateState>(EvaluateState.Wrong)

    const handleOpenPopup = () => {
        setShowPopup(true);
    };

    const handleClosePopup = () => {
        evaluateState.current = EvaluateState.Wrong
        setShowPopup(false);
    };

    const getIsHost = () => {
        if(!users || !userId) return false
        return !! users.find((user: User) => user.Id === userId && user.Role === Role.Host)
    }

    const isHost = getIsHost()

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
                        if(message.startsWith("evaluate:")){
                            const msg = message.split(":")
                            evaluateAnswerString.current = msg[2]
                            evaluateState.current = msg[1].toLowerCase() === "true" ? EvaluateState.Correct : EvaluateState.Wrong
                            handleOpenPopup();
                            
                            getLatestRound(gameCode as string);
                        }
                        break;
                }

            };
            addMessageListener(listener);
            return () => {
                removeMessageListener(listener);
            }
        }
    }, [gameCode])

    const onTimeout = async () => {
        if (gameCode) {
            try {
                await axios.put(`${hostUrl}/api/game/${gameCode}/timeout`, {
                    userId: userId,
                    round: round.Round
                });
            } catch (error) {
                console.error(error);
            }
        }

        evaluateState.current = EvaluateState.Timeout
    }

    const onRaisehand = async () => {
        if (gameCode) {
            try {
                await axios.put(`${hostUrl}/api/game/${gameCode}/raiseHand`, {
                    userId: userId,
                    round: round.Round,
                });
            } catch (error) {
                console.error(error);
            }
        }
    }

    const onSkip = async () => {
        if (gameCode) {
            try {
                await axios.post(`${hostUrl}/api/game/${gameCode}/round`, {
                    round: round.Round,
                });
            } catch (error) {
                console.error(error);
            }
        }
    }

    const onEvaluate = async (answer:string) => {
        if (gameCode) {
            try {
                await axios.put(`${hostUrl}/api/game/${gameCode}/evaluate`, {
                    answer:answer,
                    round: round.Round
                });
            } catch (error) {
                console.error(error);
            }
        }
    }

    if (userId === null) {
       return <ErrorComponent message='You have not join this game' />
    }
    if (!users) {
        return <div>Loading</div>
    }

    const currentUser = users?.find(u => u.Id === userId)
    if (!currentUser) {
        return <ErrorComponent message='You have not join this game' />
    }

    let raiseHandUser
    if (round && round.Status === Status.RaiseHand) {
        raiseHandUser = users.find(u => u.Id === round.UserId)
        if (!raiseHandUser) {
            return <div>Can not find someone raised hand</div>
        }
    }

    const showCalc = round.Status === Status.RaiseHand && round.UserId === userId 
    const height = showCalc ? 'h-[30rem]' : 'h-[25rem]'

    return (
        <>
            <PageHeader />
            <FullscreenPopup isOpen={showPopup} onClose={handleClosePopup} evaluateState={evaluateState.current} equation={evaluateAnswerString.current} />
            <main className='flex h-screen'>

                <div className="flex lg:justify-between mx-auto gap-10 flex-col lg:flex-row sm:p-10 p-4">

                    <div className={'bg-gray-300 sm:p-10 flex flex-col sm:gap-10 max-w-2xl items-center sm:w-9/12 p-4 w-12/12 gap-4 rounded '+height} >
                       {!(round.Status === Status.RaiseHand && round.UserId === userId) && <p className='text-green-700'>Use the four numbers below to arrive at the answer of 24.</p>}

                        {loading || showPopup &&<PokerDeck />}
                        {!loading && !showPopup&& !(round.Status === Status.RaiseHand && round.UserId === userId) && <PokerDeck value={[round.Card1.toString(), round.Card2.toString(), round.Card3.toString(), round.Card4.toString()]}></PokerDeck>}

                        {users && userId && <div>
                            {round.Status === Status.Playing && <div className="flex sm:flex-row flex-col gap-4">
                                    <Button width="w-48" onClick={onRaisehand} text="Raise Hand"></Button>
                                   { isHost && <Button type={ButtonType.Secondary} width="w-48" onClick={onSkip} text="Skip"></Button>}
                                </div>}
                            {showCalc && <div className='flex flex-col gap-2'>
                               <Calulator onSubmit={onEvaluate} onTimeout={onTimeout} Card1={round.Card1} Card2={round.Card2} Card3={round.Card3} Card4={round.Card4}></Calulator>
                            </div>
                            }
                            {round.Status === Status.RaiseHand && round.UserId !== userId && <div className='flex flex-col gap-4'>
                                <div className='flex justify-center items-center'>
                                    <Avatar user={raiseHandUser as User} />
                                    <div className='text-orange-600 text-xl text-bold'>is inputing the calculation, please wait</div>

                                </div>
                            </div>
                            }
                        </div>}

                    </div>
                    <div className='flex flex-col sm:w-96'>
                        {users.map((user) => {
                            return <Avatar key={user.Id} user={user} showPoints={true} />
                        })}
                    </div>
                </div>
            </main>
        </>
    );
}