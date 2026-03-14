import PropTypes from 'prop-types';
import styles from './LoadingSpinner.module.scss';

const LoadingSpinner = ({ size = 'md', message = 'Loading...' }) => {
  return (
    <div className={styles['loading-spinner']}>
      <div className={`${styles['loading-spinner__ring']} ${styles[`loading-spinner__ring--${size}`]}`} aria-hidden="true" />
      {message && <p className={styles['loading-spinner__message']}>{message}</p>}
    </div>
  );
};

LoadingSpinner.propTypes = {
  size: PropTypes.oneOf(['sm', 'md', 'lg']),
  message: PropTypes.string,
};

export default LoadingSpinner;
