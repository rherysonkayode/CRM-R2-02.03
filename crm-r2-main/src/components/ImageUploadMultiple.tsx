import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { Upload, Loader2, X } from "lucide-react";

interface ImageUploadMultipleProps {
  propertyId: string;
  images: { id: string; url: string; position: number }[];
  onUploadSuccess: (url: string) => void;
  onRemove: (imageId: string) => void;
}

export const ImageUploadMultiple = ({
  propertyId,
  images,
  onUploadSuccess,
  onRemove,
}: ImageUploadMultipleProps) => {
  const [uploading, setUploading] = useState(false);

  const uploadImage = async (event: React.ChangeEvent<HTMLInputElement>) => {
    try {
      setUploading(true);
      if (!event.target.files || event.target.files.length === 0) return;

      const file = event.target.files[0];
      const fileExt = file.name.split(".").pop();
      const fileName = `${propertyId}/${Date.now()}.${fileExt}`;
      const filePath = fileName;

      const { error: uploadError } = await supabase.storage
        .from("imoveis_fotos")
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      const { data } = supabase.storage.from("imoveis_fotos").getPublicUrl(filePath);

      onUploadSuccess(data.publicUrl);
      toast.success("Foto enviada com sucesso!");
    } catch (error: any) {
      console.error("Erro no upload:", error);
      toast.error("Erro ao enviar: " + error.message);
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="space-y-4">
      {images.length > 0 && (
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
          {images.map((img) => (
            <div key={img.id} className="relative group aspect-square rounded-lg border border-border overflow-hidden">
              <img src={img.url} alt="" className="w-full h-full object-cover" />
              <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                <button
                  onClick={() => onRemove(img.id)}
                  className="p-1.5 bg-red-500 text-white rounded-full hover:bg-red-600"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      <div className="flex flex-col items-center gap-4 p-4 border-2 border-dashed border-slate-200 rounded-xl bg-slate-50/50">
        <input
          type="file"
          id="file-upload-multiple"
          accept="image/*"
          onChange={uploadImage}
          disabled={uploading}
          className="hidden"
        />
        <div className="flex flex-col items-center gap-2">
          <Upload className="w-8 h-8 text-slate-300" />
          <p className="text-xs text-slate-500 mb-2">JPG, PNG ou WebP</p>
          <Button
            variant="outline"
            type="button"
            disabled={uploading}
            onClick={() => document.getElementById("file-upload-multiple")?.click()}
          >
            {uploading ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" /> Enviando...
              </>
            ) : (
              "Adicionar Foto"
            )}
          </Button>
        </div>
      </div>
    </div>
  );
};