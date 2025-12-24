'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { ImageIcon, AlertCircle } from 'lucide-react';

interface ImageUploaderProps {
  value: string | undefined;
  onChange: (value: string) => void;
  name?: string;
}

export function ImageUploader({ value, onChange, name }: ImageUploaderProps) {
  const [error, setError] = useState(false);

  const handleUrlChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newUrl = e.target.value;
    setError(false);
    onChange(newUrl);
  };

  return (
    <div className="space-y-4">
      <Input
        id={name || "imageUrl"}
        name={name || "imageUrl"}
        type="url"
        placeholder="https://ejemplo.com/imagen.jpg"
        value={value || ''}
        onChange={handleUrlChange}
      />
      {(value || error) && (
        <Card className="overflow-hidden border-dashed">
          <CardContent className="p-0">
            <div className="aspect-video w-full relative bg-muted/50 flex items-center justify-center">
              {error ? (
                 <div className="text-destructive flex flex-col items-center gap-2 p-4">
                    <AlertCircle className="h-8 w-8" />
                    <span className="text-sm font-medium">No se pudo cargar la imagen</span>
                    <p className="text-xs text-center">Verifica que la URL sea correcta y accesible.</p>
                 </div>
              ) : value ? (
                <Image
                  src={value}
                  alt="Vista previa de la imagen"
                  fill
                  sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                  className="object-cover"
                  onError={() => setError(true)}
                  onLoad={() => setError(false)}
                />
              ) : null}
               {!value && !error && (
                <div className="text-muted-foreground flex flex-col items-center gap-2">
                    <ImageIcon className="h-10 w-10" />
                    <span className="text-sm">Pega una URL para ver la vista previa</span>
                </div>
               )}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
