import React, { useState } from 'react';
import Button, { ButtonType } from './button';
import Timer from './Timer';
import isValidCal from '@/src/helpers/validCal';
import { v4 as uuidv4 } from 'uuid';

interface Props {
    Card1: number;
    Card2: number;
    Card3: number;
    Card4: number;
    onTimeout: () => void;
    onSubmit: (answer: string) => void;
}
const Calulator: React.FC<Props> = ({ onTimeout, onSubmit, Card1, Card2, Card3, Card4 }) => {

    const [isValid, setIsValid] = useState<boolean>(false)
    const [text, setText] = useState<string>('')
    const arr = [
        { value: Card1, text: Card1.toString() },
        { value: Card2, text: Card2.toString() },
        { value: Card3, text: Card3.toString() },
        { value: Card4, text: Card4.toString() },
        { value: "+", text: "+" },
        { value: "-", text: "-" },
        { value: "*", text: "*" },
        { value: "/", text: "/" },
        { value: "(", text: "(" },
        { value: ")", text: ")" },
        { value: "C", text: "C" },
        { value: "AC", text: "AC" }
    ]
    const onCalBtnClick = (value: number | string) => {
        let newText = ''
        switch (value) {
            case "C":
                if (text.length > 0) newText = text.slice(0, -1)
                break
            case "AC":
                if (text.length > 0) newText = ''
                break
            default:
                newText = text + value.toString()
                break
        }

        const isValid = isValidCal(newText, [Card1, Card2, Card3, Card4])
        setIsValid(isValid)
        setText(newText)
    }
    return (
        <div className='flex flex-col gap-4 p-4 justfy-center '>
            <div className='flex justify-center'>
                <Timer initialTime={20} onTimeout={onTimeout} />
            </div>

            <div className='text-end border border-green-700 p-4 rounded bg-gray-100 h-12'>{text}</div>
            <div className="grid grid-cols-4 gap-4 justify-end">
                {arr.map((item) =>
                    <CalBtn key={uuidv4()} value={item.value} text={item.text} onClick={onCalBtnClick}></CalBtn>
                )}
            </div>
            <Button onClick={() => { onSubmit(text) }} text={'Submit'} type={isValid?ButtonType.Primary:ButtonType.Disabled}></Button>
        </div>
    )
}

export default Calulator

interface CalBtnProps {
    value: number | string,
    onClick: (value: string | number) => void
    text: string
}

const CalBtn: React.FC<CalBtnProps> = ({ value, onClick, text }) => {
    return (
        <button className='h-12 py-2 px-4 rounded bg-green-700 text-white' onClick={() => { onClick(value) }}>
            {text}
        </button>
    )
}