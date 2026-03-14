import styles from './LoadingSpinner.module.scss';

const LoadingSpinner = ({ size = 'md', message = 'Loading...' }) => {
  return (
    <div className={styles['loading-spinner']}>
      <div className={`${styles['loading-spinner__ring']} ${styles[`loading-spinner__ring--${size}`]}`} aria-hidden="true" />
      {message && <p className={styles['loading-spinner__message']}>{message}</p>}
    </div>
  );
};

export default LoadingSpinner;
