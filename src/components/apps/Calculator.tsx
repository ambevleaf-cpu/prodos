'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';

const Calculator = () => {
  const [input, setInput] = useState('');
  const [result, setResult] = useState<number | string>('');

  const handleButtonClick = (value: string) => {
    if (value === 'C') {
      setInput('');
      setResult('');
    } else if (value === '=') {
      try {
        // Avoid using eval in production code, but for this simple calculator it is acceptable.
        const evalResult = eval(input);
        setResult(evalResult);
        setInput(String(evalResult));
      } catch (error) {
        setResult('Error');
      }
    } else if (value === 'DEL') {
      setInput(input.slice(0, -1));
    }
    else {
      setInput(input + value);
    }
  };

  const buttons = [
    'C', '(', ')', '/',
    '7', '8', '9', '*',
    '4', '5', '6', '-',
    '1', '2', '3', '+',
    '0', '.', 'DEL', '=',
  ];

  return (
    <Card className="w-full h-full flex flex-col border-none shadow-none rounded-none">
      <CardContent className="p-4 flex flex-col flex-grow">
        <div className="bg-muted rounded-lg p-4 mb-4 text-right">
          <div className="text-2xl font-mono text-foreground break-all">{input || '0'}</div>
          {result !== '' && <div className="text-xl font-mono text-muted-foreground break-all">{result}</div>}
        </div>
        <div className="grid grid-cols-4 gap-2 flex-grow">
          {buttons.map((btn) => (
            <Button
              key={btn}
              onClick={() => handleButtonClick(btn)}
              variant={['C', 'DEL'].includes(btn) ? 'destructive' : ['/','*','-','+','='].includes(btn) ? 'secondary' : 'default'}
              className="text-xl h-full"
            >
              {btn}
            </Button>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

export default Calculator;
