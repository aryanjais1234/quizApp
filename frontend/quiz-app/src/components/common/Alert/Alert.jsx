import PropTypes from 'prop-types';
import styles from './Alert.module.scss';

const Alert = ({ children, variant = 'info', className = '' }) => {
  const classes = [
    styles['alert'],
    styles[`alert--${variant}`],
    className,
  ].filter(Boolean).join(' ');

  return <div className={classes} role="alert">{children}</div>;
};

Alert.propTypes = {
  children: PropTypes.node.isRequired,
  variant: PropTypes.oneOf(['success', 'error', 'warning', 'info']),
  className: PropTypes.string,
};

export default Alert;
