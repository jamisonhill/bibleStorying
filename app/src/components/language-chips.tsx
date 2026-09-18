// Horizontal language selector chips. Only languages that actually have
// content are shown (Sonship has no Maasai/Borana stories yet, for example).

import { ChoiceChips } from '@/components/choice-chips';
import { LANGUAGE_NAMES, type LangCode } from '@/lib/types';

interface Props {
  languages: LangCode[];
  selected: LangCode;
  onSelect: (lang: LangCode) => void;
}

export function LanguageChips({ languages, selected, onSelect }: Props) {
  return (
    <ChoiceChips
      options={languages.map((lang) => ({ value: lang, label: LANGUAGE_NAMES[lang] }))}
      selected={selected}
      onSelect={onSelect}
    />
  );
}
