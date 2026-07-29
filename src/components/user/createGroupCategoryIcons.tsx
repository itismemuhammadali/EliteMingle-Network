import type { FC } from 'react';
import type { SvgProps } from 'react-native-svg';
import type { CreateGroupCategoryId } from '../../constants/createGroupCategories';
import CategoryArt from '../../assets/Icons/createGroupCategory/art.svg';
import CategoryBooks from '../../assets/Icons/createGroupCategory/books.svg';
import CategoryMusic from '../../assets/Icons/createGroupCategory/music.svg';
import CategorySports from '../../assets/Icons/createGroupCategory/sports.svg';
import CategoryGames from '../../assets/Icons/createGroupCategory/games.svg';
import CategoryCooking from '../../assets/Icons/createGroupCategory/cooking.svg';
import CategoryMovies from '../../assets/Icons/createGroupCategory/movies.svg';
import CategoryOther from '../../assets/Icons/createGroupCategory/other.svg';

export const CREATE_GROUP_CATEGORY_ICON: Record<
  CreateGroupCategoryId,
  FC<SvgProps>
> = {
  art: CategoryArt,
  books: CategoryBooks,
  music: CategoryMusic,
  sports: CategorySports,
  games: CategoryGames,
  cooking: CategoryCooking,
  movies: CategoryMovies,
  other: CategoryOther,
};
