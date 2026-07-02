interface AnnouncementBarProps {
  text: string;
}

export function AnnouncementBar({ text }: AnnouncementBarProps) {
  return (
    <div className="bg-teal-600 text-white text-center py-2 px-4 text-sm font-medium tracking-wide">
      {text}
    </div>
  );
}
