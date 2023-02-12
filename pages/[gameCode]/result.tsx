import Avatar from '@/src/components/avatar';
import PageHeader from '@/src/components/pageHeader';
import { useGetUsers } from '@/src/hooks/useGetUser';
import { useRouter } from 'next/router';
import React, { useEffect } from 'react'
import styles from '@/styles/Home.module.css';

export default function Result() {
    const router = useRouter();
    const gameCode = router.query.gameCode;
    const { users, getUsers,loadingUser } = useGetUsers({ gameCode: gameCode as string })
    useEffect(() => {
        if (gameCode) {
            getUsers(gameCode as string);
        }
    }, [gameCode])

    if (loadingUser) {
        return <div>Loading...</div>
    }
    return (
        <>
        <PageHeader />
            <main className={styles.main}>
                <div className='flex flex-col gap-10 p-20 bg-gray-300'>
                    <div className='text-bold text-xl text-green-600'>Congratulations <span className='text-3xl'>{users[0].Name}</span>! you are the champion!</div>
                    <div className='flex flex-col'>
                    {users.map((user) =>{ 
                        return <Avatar key={user.Id} user={user} showPoints={true} />
                    })}
                    </div>
                </div>
            </main>
        </>
    )
}