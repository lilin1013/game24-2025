import styles from '@/styles/Home.module.css'
import TextBox from '../src/components/textBox';
import axios from 'axios';
import { useRouter } from 'next/router';
import { useState } from 'react';
import PageHeader from '../src/components/pageHeader';
import Button from '@/src/components/button';
import { ButtonType } from '../src/components/button';


export default function NewGame() {
  const hostUrl = process.env.HOST_URL;
    const router = useRouter();

    const [name, setName] = useState<string>('');
    const [loading, setLoading] = useState<boolean>(false);
    const [isValid, setIsValid] = useState<boolean>(false);

  
    const onChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        event.preventDefault();
        let name = event.target.value;
        setName(name);
        setIsValid(name.length > 0);
        
      };

      const goToNext = async () => {
        setLoading(true);
        try {
            const response = await axios.post(`${hostUrl}/api/game/host`, {
              name,
            });
            localStorage.setItem('userId', response.data.Id);
            router.push(`${response.data.GameCode}/code`);
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
                  <Button onClick={goToNext} text="Next" loading={loading} type={isValid?ButtonType.Primary:ButtonType.Disabled}></Button>
              </div>
          </main>
        </>
    )
}
