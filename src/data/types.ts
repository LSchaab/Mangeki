export type TitleType = 'manga' | 'manhwa' | 'manhua';
export type TitleStatus = 'ongoing' | 'completed' | 'hiatus';

export interface Title {
  id: string;
  slug: string;
  title: string;
  type: TitleType;
  status: TitleStatus;
  synopsis: string;
  coverUrl: string;
  score: number | null;
  chapters: number | null;
  views: number;
  latestChapter: number | null;
  updatedAgo: string;
  authorIds: string[];
  genres: string[];
}

export interface Author {
  id: string;
  name: string;
  bio: string;
  photoUrl: string;
  titleIds: string[];
}

export interface Genre {
  slug: string;
  name: string;
}

export interface CustomTitle {
  id: string;
  title: string;
  author: string;
  type: TitleType;
  coverUrl: string;
  synopsis: string;
  genres: string[];
  createdAt: string;
}

export interface User {
  id: string;
  username: string;
  email: string;
  password: string;
}
