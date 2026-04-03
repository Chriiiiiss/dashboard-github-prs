import {
  SegmentedControl,
  SegmentedControlItem,
  InputSelectFilter,
  InputText,
} from '@stonal-tech/lib-design-system-react';
import type { Filters, RoleFilter, SortOption } from '@localTypes/github';
import styles from './PRFilters.module.scss';

interface PRFiltersProps {
  filters: Filters;
  onRoleChange: (role: RoleFilter) => void;
  onRepoChange: (repo: string) => void;
  onSearchChange: (search: string) => void;
  onSortChange: (sort: SortOption) => void;
  availableRepos: string[];
}

export const PRFilters = ({
  filters,
  onRoleChange,
  onRepoChange,
  onSearchChange,
  onSortChange,
  availableRepos,
}: PRFiltersProps) => (
  <div className={styles.filters}>
    <div className={styles.filters__row}>
      <SegmentedControl
        value={filters.role}
        onChange={(value) => onRoleChange(value as RoleFilter)}
        variantSize="sm"
      >
        <SegmentedControlItem value="all">All</SegmentedControlItem>
        <SegmentedControlItem value="author">Author</SegmentedControlItem>
        <SegmentedControlItem value="reviewer">Reviewer</SegmentedControlItem>
      </SegmentedControl>

      <div className={styles.filters__right}>
        <div className={styles.filters__select}>
          <InputSelectFilter
            placeholder="Filter by repo"
            value={filters.repo}
            onSelectionChange={(item) => onRepoChange(item?.value?.toString() ?? '')}
            isClearable
            variantSize="sm"
          >
            {availableRepos.map((repo) => (
              <InputSelectFilter.Item key={repo} value={repo}>
                {repo}
              </InputSelectFilter.Item>
            ))}
          </InputSelectFilter>
        </div>

        <div className={styles.filters__select}>
          <InputSelectFilter
            placeholder="Sort by"
            value={filters.sort}
            onSelectionChange={(item) => {
              if (item?.value) onSortChange(item.value.toString() as SortOption);
            }}
            variantSize="sm"
          >
            <InputSelectFilter.Item key="newest" value="newest">Newest</InputSelectFilter.Item>
            <InputSelectFilter.Item key="oldest" value="oldest">Oldest</InputSelectFilter.Item>
            <InputSelectFilter.Item key="recently_updated" value="recently_updated">Recently Updated</InputSelectFilter.Item>
          </InputSelectFilter>
        </div>

        <div className={styles.filters__search}>
          <InputText
            placeholder="Search PRs..."
            value={filters.search}
            onChange={(e) => onSearchChange(e.target.value)}
            iconLeft="magnifying-glass"
            isClearable
            onClear={() => onSearchChange('')}
            variantSize="sm"
          />
        </div>
      </div>
    </div>
  </div>
);
