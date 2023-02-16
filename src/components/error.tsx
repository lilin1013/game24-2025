import PageHeader from '@/src/components/pageHeader';
import { useRouter } from 'next/router';
import styles from '@/styles/Home.module.css';

interface Props{
    message: string;
}

const ErrorComponent: React.FC<Props>= ({message}) => {

    return (
        <>
            <div className="flex flex-col justify-center mx-auto gap-4 items-center h-screen">
                <div className="text-2xl font-bold text-green-900">{message}</div>
            </div>
      </>
    );
}

export default ErrorComponent;