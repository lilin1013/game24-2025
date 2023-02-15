import styles from '@/styles/Home.module.css'
import Button, { ButtonType } from '../src/components/button'
import TextBox from '../src/components/textBox';
import axios from 'axios';
import { useRouter } from 'next/router';
import { useState } from 'react';
import PageHeader from '../src/components/pageHeader';

export default function JoinAsPlayer() {
  const hostUrl = process.env.HOST_URL;
    const router = useRouter();
    const gameCode = router.query.gameCode;

    const [name, setName] = useState<string>('');
    const [code, setCode] = useState<string>('');
    const [loading, setLoading] = useState<boolean>(false);
    const [isValid, setIsValid] = useState<boolean>(false);

  
    const onChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
        event.preventDefault();

        let name = event.target.value;

        setIsValid(name.length > 0&&code.length>0);
        setName(name);
       
      };

      const onChangeGameCode = async (event: React.ChangeEvent<HTMLInputElement>) => {
        event.preventDefault();

        let code = event.target.value;
        setIsValid(name.length > 0&&code.length>0);
        setCode(code);
      };

      const goToNext = async () => {
        setLoading(true);
        try {
            const response = await axios.post(`${hostUrl}/api/game/${code}/player`, {
              name,
            });

            localStorage.setItem('userId', response.data.Id);
      
            router.push(`../${code}/waiting`);
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
                  <TextBox placeholder='Enter the gameCode' onChange={onChangeGameCode}/>
                  <Button onClick={goToNext} text="Next" loading={loading} type={isValid?ButtonType.Primary:ButtonType.Disabled}></Button>
              </div>
          </main>
        </>
    )
}
