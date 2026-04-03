import { Button, UserAvatar } from '@stonal-tech/lib-design-system-react';
import { useAuth } from '@hooks/useAuth';
import styles from './DashboardHeader.module.scss';

interface DashboardHeaderProps {
  onRefresh: () => void;
  isLoading: boolean;
}

export const DashboardHeader = ({ onRefresh, isLoading }: DashboardHeaderProps) => {
  const { user, logout } = useAuth();

  return (
    <header className={styles.header}>
      <div className={styles.header__left}>
        <span className={styles.header__org}>stonal-tech</span>
        <span className={styles.header__separator}>·</span>
        <span className={styles.header__user}>{user?.name ?? user?.login}</span>
        <UserAvatar
          name={user?.name ?? user?.login}
          imgUrl={user?.avatar_url}
          variantSize="xs"
        />
      </div>

      <div className={styles.header__right}>
        <Button
          variant="outline"
          variantSize="xs"
          iconLeft="rotate"
          hasLoader={isLoading}
          onClick={onRefresh}
        >
          Refresh
        </Button>
        <Button
          variant="subtle"
          variantSize="xs"
          iconLeft="right-from-bracket"
          onClick={logout}
        >
          Sign out
        </Button>
      </div>
    </header>
  );
};
