import styles from '@/styles/Home.module.css'
import Button from '../components/button'
import TextBox from '../components/textBox';
import axios from 'axios';
import { useRouter } from 'next/router';
import { useState } from 'react';
import PageHeader from '../components/pageHeader';


export default function JoinAsPlayer() {
    const router = useRouter();
    const gameCode = router.query.gameCode;

    const [name, setName] = useState<string>('');

  
    const onChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
        event.preventDefault();

        let name = event.target.value;

        setName(name);
    
        
      };

      const goToNext = async () => {
        try {
            const response = await axios.post(`http://localhost:5065/api/game/${gameCode}/player`, {
              name,
            });

            localStorage.setItem('userId', response.data.UserId);
      
            router.push(`../${gameCode}/waiting`);
          } catch (error) {
            console.error(error);
          }
      }
    return (
        <>
          <PageHeader/>
          <main className={styles.main}>
              <div className="flex flex-col justify-between mx-auto gap-4">
                  <TextBox placeholder='Enter your name' onChange={onChange}/>
                  <Button onClick={goToNext} text="Next"></Button>
              </div>
          </main>
        </>
    )
}
