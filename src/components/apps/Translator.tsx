'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent } from '@/components/ui/card';
import { ArrowRightLeft, Loader2 } from 'lucide-react';
import { handleTranslate } from '@/app/actions';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

type Language = 'English' | 'Hindi';

export default function Translator() {
  const [inputText, setInputText] = useState('');
  const [outputText, setOutputText] = useState('');
  const [sourceLang, setSourceLang] = useState<Language>('English');
  const [targetLang, setTargetLang] = useState<Language>('Hindi');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const swapLanguages = () => {
    const tempLang = sourceLang;
    setSourceLang(targetLang);
    setTargetLang(tempLang);
    const tempText = inputText;
    setInputText(outputText);
    setOutputText(tempText);
  };

  const onTranslate = async () => {
    if (!inputText.trim()) return;

    setIsLoading(true);
    setError(null);
    setOutputText('');

    const response = await handleTranslate({
      text: inputText,
      targetLanguage: targetLang,
    });

    if (response.error) {
      setError(response.error);
    } else if (response.result) {
      setOutputText(response.result.translatedText);
    }
    setIsLoading(false);
  };

  return (
    <Card className="w-full h-full flex flex-col border-none shadow-none rounded-none">
      <CardContent className="p-4 flex flex-col flex-grow gap-4">
        <div className="grid grid-cols-[1fr_auto_1fr] items-center gap-2">
            <Select value={sourceLang} onValueChange={(value: Language) => setSourceLang(value)}>
                <SelectTrigger>
                    <SelectValue placeholder="Source Language" />
                </SelectTrigger>
                <SelectContent>
                    <SelectItem value="English">English</SelectItem>
                    <SelectItem value="Hindi">Hindi</SelectItem>
                </SelectContent>
            </Select>

            <Button variant="ghost" size="icon" onClick={swapLanguages}>
                <ArrowRightLeft className="w-5 h-5" />
            </Button>
          
            <Select value={targetLang} onValueChange={(value: Language) => setTargetLang(value)}>
                <SelectTrigger>
                    <SelectValue placeholder="Target Language" />
                </SelectTrigger>
                <SelectContent>
                    <SelectItem value="English">English</SelectItem>
                    <SelectItem value="Hindi">Hindi</SelectItem>
                </SelectContent>
            </Select>
        </div>

        <div className="flex flex-col md:flex-row gap-4 flex-grow">
          <Textarea
            placeholder={`Enter text in ${sourceLang}...`}
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            className="flex-1 text-base resize-none"
          />
          <div className="relative flex-1">
             <Textarea
                placeholder="Translation"
                value={outputText}
                readOnly
                className="bg-muted flex-1 text-base resize-none"
              />
               {isLoading && (
                <div className="absolute inset-0 flex items-center justify-center bg-background/50">
                    <Loader2 className="w-8 h-8 animate-spin text-primary" />
                </div>
               )}
          </div>
        </div>

        {error && <p className="text-sm text-destructive text-center">{error}</p>}

        <Button onClick={onTranslate} disabled={isLoading || !inputText.trim()} className="w-full">
          {isLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Translate'}
        </Button>
      </CardContent>
    </Card>
  );
}
