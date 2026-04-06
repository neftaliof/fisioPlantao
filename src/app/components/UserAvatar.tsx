import { cn } from "./ui/utils";
import { getAvatarPalette, initialsFromNome } from "../lib/avatarUtils";

export type UserAvatarSize =
  | "xs"
  | "sm"
  | "md"
  | "lg"
  | "xl"
  | "2xl"
  | "tile";

const sizeClass: Record<UserAvatarSize, string> = {
  xs: "w-6 h-6 min-w-6 min-h-6 text-[10px]",
  sm: "w-8 h-8 min-w-8 min-h-8 text-xs",
  md: "w-10 h-10 min-w-10 min-h-10 text-sm",
  lg: "w-14 h-14 min-w-14 min-h-14 text-base",
  xl: "w-16 h-16 min-w-16 min-h-16 text-lg",
  "2xl": "w-20 h-20 min-w-20 min-h-20 text-xl",
  tile: "w-12 h-12 min-w-12 min-h-12 text-sm",
};

export interface UserAvatarProps {
  nome: string;
  foto?: string | null;
  userId?: string;
  size?: UserAvatarSize;
  className?: string;
  imgClassName?: string;
  alt?: string;
}

export function UserAvatar({
  nome,
  foto,
  userId,
  size = "sm",
  className,
  imgClassName,
  alt,
}: UserAvatarProps) {
  const seed = userId ?? nome;
  const { bg, text } = getAvatarPalette(seed);
  const initials = initialsFromNome(nome);
  const dim = sizeClass[size];

  if (foto) {
    return (
      <img
        src={foto}
        alt={alt ?? nome}
        title=""
        className={cn(dim, "rounded-full object-cover flex-shrink-0", imgClassName, className)}
      />
    );
  }

  return (
    <div
      className={cn(
        dim,
        "rounded-full flex items-center justify-center flex-shrink-0 font-semibold",
        bg,
        text,
        className
      )}
      aria-hidden
    >
      {initials}
    </div>
  );
}
