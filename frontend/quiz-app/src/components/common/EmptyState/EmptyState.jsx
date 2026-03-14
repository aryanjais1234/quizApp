import styles from './EmptyState.module.scss';

const EmptyState = ({ icon = '📭', title, description, action }) => {
  return (
    <div className={styles['empty-state']}>
      <div className={styles['empty-state__icon']}>{icon}</div>
      {title && <h3 className={styles['empty-state__title']}>{title}</h3>}
      {description && <p className={styles['empty-state__description']}>{description}</p>}
      {action && <div className={styles['empty-state__action']}>{action}</div>}
    </div>
  );
};

export default EmptyState;
