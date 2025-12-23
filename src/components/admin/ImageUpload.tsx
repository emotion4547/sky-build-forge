import { useState, useRef } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { Upload, X, Image as ImageIcon, Loader2 } from "lucide-react";

interface ImageUploadProps {
  value: string[];
  onChange: (urls: string[]) => void;
  folder: string;
  maxImages?: number;
  single?: boolean;
}

export const ImageUpload = ({ 
  value = [], 
  onChange, 
  folder, 
  maxImages = 10, 
  single = false 
}: ImageUploadProps) => {
  const { toast } = useToast();
  const [uploading, setUploading] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setUploading(true);
    const newUrls: string[] = [];

    try {
      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        const fileExt = file.name.split('.').pop();
        const fileName = `${folder}/${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`;

        const { error: uploadError } = await supabase.storage
          .from("content-images")
          .upload(fileName, file);

        if (uploadError) {
          toast({ title: "Ошибка загрузки", description: uploadError.message, variant: "destructive" });
          continue;
        }

        const { data: urlData } = supabase.storage
          .from("content-images")
          .getPublicUrl(fileName);

        newUrls.push(urlData.publicUrl);
      }

      if (single) {
        onChange(newUrls.slice(0, 1));
      } else {
        const combined = [...value, ...newUrls].slice(0, maxImages);
        onChange(combined);
      }

      toast({ title: "Изображения загружены" });
    } catch (error) {
      toast({ title: "Ошибка", description: "Не удалось загрузить изображения", variant: "destructive" });
    } finally {
      setUploading(false);
      if (inputRef.current) {
        inputRef.current.value = "";
      }
    }
  };

  const removeImage = (index: number) => {
    const newUrls = value.filter((_, i) => i !== index);
    onChange(newUrls);
  };

  const displayValue = single ? value.slice(0, 1) : value;

  return (
    <div className="space-y-3">
      {displayValue.length > 0 && (
        <div className={`grid gap-2 ${single ? "" : "grid-cols-2 sm:grid-cols-3"}`}>
          {displayValue.map((url, index) => (
            <div key={index} className="relative group aspect-video bg-secondary rounded-lg overflow-hidden">
              <img 
                src={url} 
                alt={`Image ${index + 1}`} 
                className="w-full h-full object-cover"
              />
              <button
                type="button"
                onClick={() => removeImage(index)}
                className="absolute top-2 right-2 bg-destructive text-destructive-foreground rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          ))}
        </div>
      )}

      {(single ? displayValue.length === 0 : displayValue.length < maxImages) && (
        <div>
          <input
            ref={inputRef}
            type="file"
            accept="image/*"
            multiple={!single}
            onChange={handleUpload}
            className="hidden"
            id={`image-upload-${folder}`}
          />
          <Button
            type="button"
            variant="outline"
            disabled={uploading}
            onClick={() => inputRef.current?.click()}
            className="w-full border-dashed"
          >
            {uploading ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Загрузка...
              </>
            ) : (
              <>
                <Upload className="h-4 w-4 mr-2" />
                {single ? "Загрузить изображение" : `Добавить изображения (макс. ${maxImages})`}
              </>
            )}
          </Button>
        </div>
      )}

      {!single && displayValue.length === 0 && (
        <div className="flex items-center justify-center h-24 bg-secondary/50 rounded-lg border-2 border-dashed border-border">
          <div className="text-center text-muted-foreground">
            <ImageIcon className="h-8 w-8 mx-auto mb-2" />
            <p className="text-sm">Нет изображений</p>
          </div>
        </div>
      )}
    </div>
  );
};
