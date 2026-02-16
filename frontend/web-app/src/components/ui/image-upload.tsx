import React, { useRef, useState } from 'react';
import { Upload, X, Image as ImageIcon, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import api from '@/lib/api/client';

interface ImageUploadProps {
    value?: string;
    onChange: (url: string) => void;
    disabled?: boolean;
    className?: string;
    entityType?: 'love' | 'pin'; // For future use if needed
}

export const ImageUpload: React.FC<ImageUploadProps> = ({
    value,
    onChange,
    disabled,
    className,
    entityType
}) => {
    const [isUploading, setIsUploading] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleUpload = async (file: File) => {
        if (!file) return;

        // Validate MIME type client-side as a first check
        if (!['image/jpeg', 'image/png', 'image/webp'].includes(file.type)) {
            alert('Only JPEG, PNG, and WebP images are allowed.');
            return;
        }

        setIsUploading(true);

        const formData = new FormData();
        formData.append('file', file);
        if (entityType) {
            formData.append('entity_type', 'life_' + entityType); // e.g. life_love
        }

        try {
            // Use configured API client; axios handles Content-Type for FormData
            const response = await api.post('/files', formData);

            if (response.data && response.data.url) {
                onChange(response.data.url);
            }
        } catch (error) {
            console.error('Upload failed:', error);
            alert('Image upload failed. Please try again.');
        } finally {
            setIsUploading(false);
        }
    };

    const onFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            handleUpload(e.target.files[0]);
        }
    };

    const handleRemove = (e: React.MouseEvent) => {
        e.stopPropagation();
        onChange('');
        if (fileInputRef.current) {
            fileInputRef.current.value = '';
        }
    };

    const handleClick = () => {
        if (!disabled) {
            fileInputRef.current?.click();
        }
    }

    return (
        <div className={cn("flex flex-col gap-4", className)}>
            <input
                type="file"
                ref={fileInputRef}
                onChange={onFileChange}
                className="hidden"
                accept="image/jpeg,image/png,image/webp"
                disabled={disabled || isUploading}
            />

            {!value ? (
                <div
                    onClick={handleClick}
                    className={cn(
                        "relative flex flex-col items-center justify-center w-32 h-32 rounded-lg border-2 border-dashed border-muted-foreground/25 hover:border-muted-foreground/50 transition-colors cursor-pointer bg-muted/50 hover:bg-muted",
                        (disabled || isUploading) && "opacity-50 cursor-not-allowed"
                    )}
                >
                    {isUploading ? (
                        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                    ) : (
                        <>
                            <Upload className="h-6 w-6 text-muted-foreground mb-2" />
                            <span className="text-xs text-muted-foreground font-medium">Upload</span>
                        </>
                    )}
                </div>
            ) : (
                <div className="relative w-32 h-32 rounded-lg overflow-hidden border border-border group">
                    {/* Use specific image component or simple img */}
                    <img
                        src={value}
                        alt="Uploaded"
                        className="w-full h-full object-cover"
                    />
                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                        <button
                            onClick={handleRemove}
                            type="button"
                            className="p-1 rounded-full bg-destructive text-destructive-foreground hover:bg-destructive/90 transition-colors"
                        >
                            <X className="h-4 w-4" />
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};
