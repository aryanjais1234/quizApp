import PropTypes from 'prop-types';
import styles from './Badge.module.scss';

const Badge = ({
  children,
  variant = 'primary',
  size = 'md',
  className = '',
}) => {
  const classes = [
    styles['badge'],
    styles[`badge--${variant}`],
    styles[`badge--${size}`],
    className,
  ].filter(Boolean).join(' ');

  return <span className={classes}>{children}</span>;
};

Badge.propTypes = {
  children: PropTypes.node.isRequired,
  variant: PropTypes.oneOf(['primary', 'success', 'warning', 'danger', 'info', 'gray']),
  size: PropTypes.oneOf(['sm', 'md', 'lg']),
  className: PropTypes.string,
};

export default Badge;
