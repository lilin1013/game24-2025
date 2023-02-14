import { useEffect, useState } from 'react';
import styles from '@/styles/fullScreenPopup.module.css'
import Fireworks from '@/src/components/fireworks';

type FullscreenPopupProps = {
  evaluateState: EvaluateState;
  isOpen: boolean;
  onClose: () => void;
  equation: string;
};

export enum EvaluateState {
  Correct,
  Wrong,
  Timeout
}

const FullscreenPopup = ({ isOpen, onClose, evaluateState, equation }: FullscreenPopupProps): JSX.Element => {
  const [show, setShow] = useState(true);

  useEffect(() => {
    if(isOpen==true){
      if(evaluateState = EvaluateState.Correct){
        setShow(true)
        setTimeout(() => {
          setShow(false)
        }, 3*1000);
      }

     
      const timer = EvaluateState.Correct ? 8*1000 : 2*1000;

      setTimeout(() => {
        onClose()
      }, timer);
    }
   
  }, [isOpen]);
  return (
    <div className={`${styles.overlay} ${isOpen ? styles.open : ''}`}>
     
      <div className={styles.popup}>
        {show && evaluateState === EvaluateState.Correct && <Fireworks/>}
        <RoundResult evaluateState={evaluateState} equation={equation} />
        </div>
    </div>
  );
};

type RoundResultProps = {
  evaluateState: EvaluateState,
  equation: string
}
const RoundResult: React.FC<RoundResultProps> = ({ evaluateState, equation }) => {
  return (
      <>
      {evaluateState === EvaluateState.Correct && <div className='flex items-center py-32 flex-col g-10 sm:text-xl text-l text-green-700 '>
          <div>
              Congratulations! the answer is correct.  
          </div>
          <div>
              {equation} = 24
          </div>
      </div>}
      {evaluateState === EvaluateState.Wrong && <div className='flex items-center py-32 flex-col g-10 sm:text-xl text-l text-red-700 '>
          <div>
              sorry! the answer is wrong.  
          </div>
          <div>
              {equation} != 24
          </div>
      </div>}

      {evaluateState === EvaluateState.Timeout && <div className='flex items-center py-32 flex-col g-10 sm:text-xl text-l text-red-700 '>
          <div>
              Time out!
          </div>
      </div>}
      </>
  );
};

export default FullscreenPopup;
