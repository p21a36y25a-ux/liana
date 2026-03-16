export type FrameworkCategory = 'frontend' | 'backend' | 'fullstack' | 'bundler';

export interface Framework {
  id: string;
  name: string;
  category: FrameworkCategory;
  language: string;
  description: string;
  useCases: string[];
  officialSite: string;
  tags: string[];
  color: string;
}
