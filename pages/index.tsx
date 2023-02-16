import Button from '../src/components/button'
import { useRouter } from 'next/router'
import PageHeader from '../src/components/pageHeader';
import PokerDeck from '../src/components/pokerDeck';
import Fireworks from '../src/components/fireworks';


export default function Home() {
  const router = useRouter();

  const goToNewGame = () => {
    router.push('/new-game');
  };
  return (
    <>
      <PageHeader />
      <main className='flex h-screen'>
          <div className="flex lg:justify-between mx-auto gap-10 flex-col lg:flex-row">
            <div className='bg-gray-300 sm:p-20 flex flex-col gap-4 max-w-2xl p-10 md:h-96'>
              <PokerDeck value={['4','6','7','8']}/>
              <p className='sm:text-xl font-bold text-green-900'>Game 24 is a card game where the goal is to make a hand that equals 24. for instance, (4*6)*(8-7) = 24.</p>
            </div>

            <div className="flex flex-col gap-4 p-10">
              <Button onClick={goToNewGame} text={'Start a new game'} />
              <Button onClick={() => { router.push('/join-as-player') }} text={'Join a game as guest'} />
            </div>
          </div>
       
      </main>
    </>
  )
}
