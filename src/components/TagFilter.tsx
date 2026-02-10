import { Badge } from "@/components/ui/badge";
import { getTagColor, allTags } from "@/lib/mock-data";

interface TagFilterProps {
  activeTag: string;
  onTagChange: (tag: string) => void;
}

const TagFilter = ({ activeTag, onTagChange }: TagFilterProps) => {
  return (
    <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-hide">
      {allTags.map((tag) => (
        <button
          key={tag}
          onClick={() => onTagChange(tag)}
          className={`px-4 py-2 text-xs font-bold uppercase tracking-wider font-body whitespace-nowrap transition-all ${
            activeTag === tag
              ? "bg-primary text-primary-foreground"
              : "bg-secondary text-muted-foreground hover:text-foreground"
          }`}
        >
          {tag}
        </button>
      ))}
    </div>
  );
};

export default TagFilter;
