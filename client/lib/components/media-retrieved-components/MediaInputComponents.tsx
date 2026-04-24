import { Link } from "react-router-dom";
import { LongText } from "../../../lib/ui/LongText";

interface ITextProps {
  id: string;
  className: string;
  placeholder: string;
  value: string;
  onChange?: React.ReactEventHandler;
  onClick?: React.ReactEventHandler;
  children?: React.ReactNode;
}

interface ILinkProps {
  id: string;
  className: string;
  href: string;
  text: string;
  onChange?: React.ReactEventHandler;
}

//Text Component
export const DisabledTextAreaInput = ({
  className,
  onClick,
  children,
}: ITextProps) => {
  return (
    <LongText onClick={onClick} className={className}>
      {children}
    </LongText>
  );
};

export const TextLinkInput = ({
  id,
  className,
  href,
  text,
  onChange,
}: ILinkProps) => {
  return (
    <Link
      target="_blank"
      id={id}
      className={className}
      to={href}
      onChange={onChange}
    >
      {text}
    </Link>
  );
};
export const EnabledTextAreaInput = ({
  id,
  className,
  placeholder,
  value,
  onChange,
}: ITextProps) => {
  return (
    <textarea
      id={id}
      minLength={1}
      maxLength={8000}
      autoComplete="off"
      placeholder={placeholder}
      className={className}
      value={value}
      onChange={onChange}
      required
    />
  );
};

interface IAudioProps {
  id: string;
  className: string;
  placeholder?: string;
  value: string;
  onChange?: React.ReactEventHandler;
  onDoubleClick?: React.ReactEventHandler;
  children?: React.ReactNode;
}
//Audio Component Input
export const DisabledAudioInput = ({
  className,
  onDoubleClick,
  children,
}: IAudioProps) => {
  return (
    <audio controls onDoubleClick={onDoubleClick} className={className}>
      {children}
    </audio>
  );
};

export const EnabledAudioInput = ({
  id,
  className,
  placeholder,
  value,
  onChange,
}: IAudioProps) => {
  return (
    <input
      type="file"
      id={id}
      minLength={1}
      accept="audio/*"
      maxLength={10000}
      autoComplete="off"
      placeholder={placeholder}
      className={className}
      value={value}
      onChange={onChange}
      required
    />
  );
};
export const EnabledAudiosInput = ({
  id,
  className,
  placeholder,
  value,
  onChange,
}: IAudioProps) => {
  return (
    <input
      type="file"
      multiple
      id={id}
      minLength={1}
      accept="audio/*"
      maxLength={10000}
      autoComplete="off"
      placeholder={placeholder}
      className={className}
      value={value}
      onChange={onChange}
      required
    />
  );
};

interface IImageProps {
  id: string;
  className: string;
  src?: string;
  alt?: string;
  onChange?: React.ReactEventHandler;
  onDoubleClick?: React.ReactEventHandler;
}

//Image Component
export const DisabledImageInput = ({
  id,
  className,
  src,
  alt,
  onDoubleClick,
}: IImageProps) => {
  return (
    <img
      id={id}
      src={src}
      alt={alt}
      className={className}
      onDoubleClick={onDoubleClick}
    />
  );
};

export const EnabledImageInput = ({ id, className, onChange }: IImageProps) => {
  return (
    <input
      type="file"
      accept="image/*"
      minLength={1}
      maxLength={1}
      autoComplete="off"
      onChange={onChange}
      id={id}
      className={className}
      required
    />
  );
};

//under construction
export const DisabledImagesInput = ({
  id,
  className,
  src,
  onDoubleClick,
}: IImageProps) => {
  return (
    <img
      id={id}
      src={src}
      className={className}
      onDoubleClick={onDoubleClick}
    />
  );
};

export const EnabledImagesInput = ({
  id,
  className,
  onChange,
}: IImageProps) => {
  return (
    <input
      type="file"
      accept="image/*"
      multiple
      minLength={1}
      maxLength={1}
      autoComplete="off"
      onChange={onChange}
      id={id}
      className={className}
      required
    />
  );
};

//Video Component
interface IVideoProps {
  id: string;
  className: string;
  src?: string;
  alt?: string;
  value?: string;
  onChange?: React.ReactEventHandler;
  onDoubleClick?: React.ReactEventHandler;
}
export const DisabledVideoInput = ({
  id,
  className,
  src,
  onDoubleClick,
}: IVideoProps) => {
  return (
    <video
      src={src}
      id={id}
      className={className}
      onDoubleClick={onDoubleClick}
    />
  );
};

export const EnabledVideoInput = ({ id, className, onChange }: IVideoProps) => {
  return (
    <input
      type="file"
      id={id}
      accept="video/*"
      min={1}
      max={100}
      className={className}
      onChange={onChange}
      required
    />
  );
};

//under construction
export const DisabledVideosInput = ({
  id,
  className,
  src,
  onDoubleClick,
}: IVideoProps) => {
  return (
    <video
      src={src}
      id={id}
      className={className}
      onDoubleClick={onDoubleClick}
    />
  );
};

export const EnabledVideosInputs = ({
  id,
  className,
  onChange,
}: IVideoProps) => {
  return (
    <input
      type="file"
      multiple
      id={id}
      accept="video/*"
      min={1}
      max={100}
      className={className}
      onChange={onChange}
      required
    />
  );
};
