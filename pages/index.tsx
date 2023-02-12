import styles from '@/styles/Home.module.css'
import Button from '../src/components/button'
import Card from '../src/components/card'
import { useRouter } from 'next/router'
import PageHeader from '../src/components/pageHeader';


export default function Home() {
  const router = useRouter();

  const goToNewGame = () => {
    router.push('/new-game');
  };
  return (
    <>
      <PageHeader />
      <main className={styles.main}>
          <div className="flex justify-between mx-auto gap-10">
            <div className='bg-gray-300 p-20 flex flex-col gap-4 max-w-2xl'>
              <div className="flex gap-4  ">
                <Card value='4'></Card>
                <Card value='6'></Card>
                <Card value='7'></Card>
                <Card value='8'></Card>
              </div>
              <p className='text-xl font-bold text-green-900'>Determine a method to arrive at the value of 24 using those cards. for instance, (4*6)*(8-7) = 24.</p>
            </div>

            <div className="flex flex-col gap-4">
              <Button onClick={goToNewGame} text={'Start new game'} />
              <Button onClick={() => { router.push('/join-as-player') }} text={'Join a game'} />
            </div>
          </div>
       
      </main>
    </>
  )
}
